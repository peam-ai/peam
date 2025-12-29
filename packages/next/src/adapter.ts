import { loggers } from '@peam/logger';
import { parseHTML, type StructuredPage } from '@peam/parser';
import { SearchEngine } from '@peam/search';
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import type { NextAdapter } from 'next';
import { join } from 'path';
import { type PeamAdapterConfig } from './config';

const log = loggers.adapter;

function shouldIncludePath(pathname: string): boolean {
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

  // Exclude Next.js special routes that start with underscore
  const pathParts = pathname.split('/').filter(Boolean);
  if (pathParts.some((part) => part.startsWith('_') && part !== '_app' && part !== '_document')) {
    return false;
  }

  return true;
}

export function createPeamAdapter(config: Required<PeamAdapterConfig>): NextAdapter {
  return {
    name: 'peam-adapter',

    async onBuildComplete(ctx) {
      log('Extracting page content via adapter');
      log('Total app pages: %d', ctx.outputs.appPages.length);
      log('Total prerenders: %d', ctx.outputs.prerenders.length);

      const pages: Array<{
        path: string;
        htmlFile: string;
        structuredPage: StructuredPage;
        type: string;
        runtime?: string;
      }> = [];

      for (const prerender of ctx.outputs.prerenders) {
        if (!prerender.fallback) {
          continue;
        }

        const pathname = prerender.pathname;

        if (!shouldIncludePath(pathname)) {
          continue;
        }

        try {
          const htmlPath = prerender.fallback.filePath;
          log('Reading HTML from: %s', htmlPath);

          const html = readFileSync(htmlPath, 'utf-8');
          const structuredPage = parseHTML(html);

          if (!structuredPage) {
            log('No content extracted from %s', pathname);
            continue;
          }

          log('Successfully extracted content from %s', pathname);
          pages.push({
            path: pathname,
            htmlFile: htmlPath.replace(ctx.projectDir + '/', ''),
            structuredPage,
            type: 'page',
          });
        } catch (error) {
          log('Error processing %s: %O', pathname, error);
        }
      }

      const outputPath = join(ctx.projectDir, config.outputDir);
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
