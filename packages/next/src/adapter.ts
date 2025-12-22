import { parseHTML, type StructuredPage } from '@peam/parser';
import { loggers } from '@peam/logger';
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import type { NextAdapter } from 'next';
import { join } from 'path';
import { type PeamAdapterConfig } from './config';

const log = loggers.adapter;

export function createPeamAdapter(config: PeamAdapterConfig): NextAdapter {
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

      // Process app pages
      for (const appPage of ctx.outputs.appPages) {
        try {
          // App pages have .rsc suffix, and HTML is typically in prerenders
          log('Processing app page: %s', appPage.pathname);

          const prerender = ctx.outputs.prerenders.find((p) => p.pathname === appPage.pathname.replace('.rsc', ''));

          if (prerender && prerender.fallback) {
            const htmlPath = prerender.fallback.filePath;

            const html = readFileSync(htmlPath, 'utf-8');
            const structuredPage = parseHTML(html);

            if (!structuredPage) {
              log(`No content extracted from ${appPage.pathname}`);
              continue;
            }

            log('Successfully extracted content from %s', appPage.pathname);
            pages.push({
              path: appPage.pathname.replace('.rsc', ''),
              htmlFile: htmlPath.replace(ctx.projectDir + '/', ''),
              structuredPage,
              type: 'app-page',
              runtime: appPage.runtime,
            });
          }
        } catch (error) {
          log('Error processing %s: %O', appPage.pathname, error);
        }
      }

      // Process prerenders that don't have corresponding app pages (like _not-found)
      for (const prerender of ctx.outputs.prerenders) {
        if (prerender.fallback && !pages.find((p) => p.path === prerender.pathname)) {
          try {
            const htmlPath = prerender.fallback.filePath;
            log('Reading prerender HTML from: %s', htmlPath);

            const html = readFileSync(htmlPath, 'utf-8');
            const structuredPage = parseHTML(html);

            if (!structuredPage) {
              log('No content extracted from %s', prerender.pathname);
              continue;
            }

            log('Successfully extracted content from prerender %s', prerender.pathname);
            pages.push({
              path: prerender.pathname,
              htmlFile: htmlPath.replace(ctx.projectDir + '/', ''),
              structuredPage,
              type: 'prerender',
            });
          } catch (error) {
            log('Error processing prerender %s: %O', prerender.pathname, error);
          }
        }
      }

      const outputPath = join(ctx.projectDir, config.outputDir);
      mkdirSync(outputPath, { recursive: true });

      const outputFile = join(outputPath, 'pages.json');
      const outputData = {
        extractedAt: new Date().toISOString(),
        totalPages: pages.length,
        buildId: ctx.buildId,
        nextVersion: ctx.nextVersion,
        pages,
      };

      writeFileSync(outputFile, JSON.stringify(outputData, null, 2));

      log('Saved content to: %s', outputFile);
      log('Extraction complete! Total pages: %d', pages.length);
    },
  };
}
