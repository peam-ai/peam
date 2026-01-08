import { loggers } from '@peam-ai/logger';
import {
  loadRobotsTxt as baseLoadRobotsTxt,
  createRobotsParser,
  parseHTML,
  shouldIncludePath,
  type RobotsTxtResult,
  type StructuredPage,
} from '@peam-ai/parser';
import { buildSearchIndex } from '@peam-ai/search';
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import type { NextAdapter } from 'next';
import { join } from 'path';
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
    log('Error extracting robots from prerender: %O', error);
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
          log('Found dynamic robots.txt from prerenders');
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
        log('Loaded robots.txt from: %s', result.path);
        return result;
      }
      return null;
    }

    return {
      parser: createRobotsParser(robotsContent),
      path: foundPath || '',
    };
  } catch (error) {
    log('Error loading robots.txt: %O', error);
    return null;
  }
}

export function createPeamAdapter(config: ResolvedPeamAdapterConfig): NextAdapter {
  return {
    name: 'peam-adapter',

    async onBuildComplete(ctx) {
      log('Extracting page content via adapter');

      const outputs = ctx.outputs as NextJS15Output[] | NextJS16Outputs;
      let prerenders: PrerenderOutput[];

      if (Array.isArray(outputs)) {
        prerenders = outputs.filter((output: NextJS15Output) => output.type === 'PRERENDER');
      } else {
        prerenders = outputs.prerenders || [];
      }

      log('Total prerenders: %d', prerenders.length);

      const projectDir = ctx.projectDir || process.cwd();

      const robotsResult = config.respectRobotsTxt ? loadRobotsTxt(projectDir, prerenders, config.robotsTxtPath) : null;

      if (robotsResult) {
        log('Using robots.txt from: %s', robotsResult.path);
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
            log('Path excluded by robots.txt: %s', pathname);
          } else if (filterResult.reason === 'exclude-pattern') {
            log('Path excluded by user pattern: %s', pathname);
          }
          continue;
        }

        try {
          log('Reading HTML from: %s', fallbackFilePath);

          const html = readFileSync(fallbackFilePath, 'utf-8');
          const structuredPage = parseHTML(html);

          if (!structuredPage) {
            log('No content extracted from %s', pathname);
            continue;
          }

          log('Successfully extracted content from %s', pathname);
          pages.push({
            path: pathname,
            htmlFile: fallbackFilePath.replace(projectDir + '/', ''),
            structuredPage,
            type: 'page',
          });
        } catch (error) {
          log('Error processing %s: %O', pathname, error);
        }
      }

      const outputPath = join(projectDir, config.outputDir);
      mkdirSync(outputPath, { recursive: true });

      log('Creating search index...');
      const searchIndexData = await buildSearchIndex(pages);

      const searchIndexFile = join(outputPath, config.indexFilename);
      writeFileSync(searchIndexFile, JSON.stringify(searchIndexData));

      log('Saved search index to: %s', searchIndexFile);
      log('Extraction complete with total pages: %d', pages.length);
    },
  };
}
