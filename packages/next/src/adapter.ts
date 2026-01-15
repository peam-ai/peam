import { readFileSync } from 'fs';
import type { NextAdapter } from 'next';
import { loggers } from 'peam/logger';
import {
  loadRobotsTxt as baseLoadRobotsTxt,
  createRobotsParser,
  parseHTML,
  shouldIncludePath,
  type RobotsTxtResult,
  type StructuredPage,
} from 'peam/parser';
import { buildSearchIndex } from 'peam/search';
import { type ResolvedPeamAdapterConfig } from './config';

const log = loggers.adapter;

interface PrerenderOutput {
  pathname: string;
  fallback?: {
    filePath: string;
  };
}

interface NextJS15Output extends PrerenderOutput {
  type: string;
}

interface NextJS16Outputs {
  prerenders: Array<PrerenderOutput>;
}

function extractRobotsFromPrerender(prerender: PrerenderOutput): string | null {
  try {
    if (prerender.pathname !== '/robots.txt') {
      return null;
    }

    if (prerender.fallback?.filePath) {
      const content = readFileSync(prerender.fallback.filePath, 'utf-8');
      return content;
    }
  } catch (error) {
    log.error('Error extracting robots from prerender:', error);
  }

  return null;
}

function loadRobotsTxt(
  projectDir: string,
  prerenders: PrerenderOutput[],
  robotsTxtPath?: string
): RobotsTxtResult | null {
  try {
    let robotsContent: string | null = null;
    let foundPath: string | null = null;

    if (prerenders && prerenders.length > 0) {
      for (const prerender of prerenders) {
        const content = extractRobotsFromPrerender(prerender);
        if (content) {
          log.debug('Found dynamic robots.txt from prerenders');
          robotsContent = content;
          foundPath = prerender.pathname;
          break;
        }
      }
    }

    if (!robotsContent) {
      const searchPaths = ['public/robots.txt', 'app/robots.txt', 'src/app/robots.txt'];
      const result = baseLoadRobotsTxt(projectDir, searchPaths, robotsTxtPath);
      if (result) {
        log.debug('Loaded robots.txt from:', result.path);
        return result;
      }
      return null;
    }

    return {
      parser: createRobotsParser(robotsContent),
      path: foundPath || '',
    };
  } catch (error) {
    log.error('Error loading robots.txt:', error);
    return null;
  }
}

export function createPeamAdapter(config: ResolvedPeamAdapterConfig): NextAdapter {
  return {
    name: 'peam-adapter',

    async onBuildComplete(ctx) {
      log.debug('Extracting page content via adapter');

      const outputs = ctx.outputs as NextJS15Output[] | NextJS16Outputs;
      let prerenders: PrerenderOutput[];

      if (Array.isArray(outputs)) {
        prerenders = outputs.filter((output: NextJS15Output) => output.type === 'PRERENDER');
      } else {
        prerenders = outputs.prerenders || [];
      }

      log.debug('Total prerenders:', prerenders.length);

      const projectDir = ctx.projectDir || process.cwd();

      const robotsResult = config.respectRobotsTxt ? loadRobotsTxt(projectDir, prerenders, config.robotsTxtPath) : null;

      if (robotsResult) {
        log.debug('Using robots.txt from:', robotsResult.path);
      }

      const pages: Array<{
        path: string;
        htmlFile: string;
        structuredPage: StructuredPage;
        type: string;
        runtime?: string;
      }> = [];

      for (const prerender of prerenders) {
        const pathname = prerender.pathname;
        let fallbackFilePath = prerender.fallback?.filePath;

        if (!fallbackFilePath) {
          continue;
        }

        // Fix for Next.js 15
        if (fallbackFilePath?.endsWith('/.html')) {
          fallbackFilePath = fallbackFilePath.replace('/.html', '/index.html');
        }

        const filterResult = shouldIncludePath(
          pathname,
          robotsResult?.parser ?? null,
          config.exclude,
          config.respectRobotsTxt
        );

        if (!filterResult.included) {
          if (filterResult.reason === 'robots-txt') {
            log.debug('Path excluded by robots.txt:', pathname);
          } else if (filterResult.reason === 'exclude-pattern') {
            log.debug('Path excluded by user pattern:', pathname);
          }
          continue;
        }

        try {
          log.debug('Reading HTML from:', fallbackFilePath);

          const html = readFileSync(fallbackFilePath, 'utf-8');
          const structuredPage = parseHTML(html);

          if (!structuredPage) {
            log.warn('No content extracted from', pathname);
            continue;
          }

          log.debug('Successfully extracted content from', pathname);
          pages.push({
            path: pathname,
            htmlFile: fallbackFilePath.replace(projectDir + '/', ''),
            structuredPage,
            type: 'page',
          });
        } catch (error) {
          log.error('Error processing', pathname, error);
        }
      }

      log.debug('Creating search index...');
      const searchIndexData = await buildSearchIndex(pages);

      // Use the exporter to save the search index
      await config.searchIndexExporter.export(searchIndexData);

      log.debug('Saved search index via exporter');
      log.debug('Extraction complete with total pages:', pages.length);
    },
  };
}
