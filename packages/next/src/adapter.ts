import { loggers } from '@peam/logger';
import { parseHTML, type StructuredPage } from '@peam/parser';
import { SearchEngine } from '@peam/search';
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import type { NextAdapter } from 'next';
import { join } from 'path';
import robotsParser from 'robots-parser';
import { type ResolvedPeamAdapterConfig } from './config';
import { matchesExcludePattern } from './utils/excludePatterns';
import { isPathAllowedByRobots, loadRobotsTxt } from './utils/robotsParser';

const log = loggers.adapter;

type RobotsParser = ReturnType<typeof robotsParser>;

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

function shouldIncludePath(
  pathname: string,
  robots: RobotsParser | null,
  excludePatterns: string[],
  respectRobotsTxt: boolean
): boolean {
  if (pathname.startsWith('/_not-found') || pathname.startsWith('/_global-error')) {
    return false;
  }

  if (pathname.endsWith('.rsc')) {
    return false;
  }

  if (pathname.includes('.segments/')) {
    return false;
  }

  if (pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|txt|xml|json)$/i)) {
    return false;
  }

  // Check robots.txt rules if enabled
  if (respectRobotsTxt && !isPathAllowedByRobots(pathname, robots)) {
    log('Path excluded by robots.txt: %s', pathname);
    return false;
  }

  // Check user-defined exclude patterns
  if (matchesExcludePattern(pathname, excludePatterns)) {
    log('Path excluded by user pattern: %s', pathname);
    return false;
  }

  return true;
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

      const robots = config.respectRobotsTxt ? loadRobotsTxt(projectDir, prerenders, config.robotsTxtPath) : null;

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

        if (!shouldIncludePath(pathname, robots, config.exclude, config.respectRobotsTxt)) {
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
      const searchEngine = new SearchEngine();
      await searchEngine.initialize();

      for (const page of pages) {
        if (page.structuredPage) {
          await searchEngine.addPage(page.path, page.structuredPage);
          log('Added page to search index: %s', page.path);
        }
      }

      const exportedData: Record<string, string> = {};
      const result = await searchEngine.export(async (key, data) => {
        exportedData[key] = data;
      });

      const searchIndexData = {
        keys: result.keys,
        data: exportedData,
      };

      const searchIndexFile = join(outputPath, config.indexFilename);
      writeFileSync(searchIndexFile, JSON.stringify(searchIndexData));

      log('Saved search index to: %s', searchIndexFile);
      log('Extraction complete with total pages: %d', pages.length);
    },
  };
}
