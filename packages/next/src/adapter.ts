import type { NextAdapter } from 'next';
import { PrerenderSearchIndexBuilder } from 'peam/builder';
import { loggers } from 'peam/logger';
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

/**
 * Normalize Next.js outputs into PrerenderPage array
 */
function normalizePrerenders(outputs: NextJS15Output[] | NextJS16Outputs) {
  // Next.js 16+ format (outputs is an object with prerenders array)
  if ('prerenders' in outputs) {
    return outputs.prerenders.map((prerender) => ({
      pathname: prerender.pathname,
      fallback: prerender.fallback,
    }));
  }

  // Next.js 15 format (outputs is an array)
  return (outputs as NextJS15Output[]).map((prerender) => ({
    pathname: prerender.pathname,
    fallback: prerender.fallback,
  }));
}

export function createPeamAdapter(config: ResolvedPeamAdapterConfig): NextAdapter {
  return {
    name: 'peam-adapter',

    async onBuildComplete(ctx) {
      log.debug('Extracting page content via adapter');

      const outputs = ctx.outputs as NextJS15Output[] | NextJS16Outputs;
      const projectDir = ctx.projectDir || process.cwd();
      const prerenders = normalizePrerenders(outputs);

      const builder = new PrerenderSearchIndexBuilder({
        prerenders,
        projectDir,
        respectRobotsTxt: config.respectRobotsTxt,
        robotsTxtPath: config.robotsTxtPath,
        exclude: config.exclude,
      });

      log.debug('Building search index from prerender outputs...');
      const searchIndexData = await builder.build();

      if (!searchIndexData) {
        log.warn('No search index data generated');
        return;
      }

      await config.searchIndexStore.export(searchIndexData);

      log.debug('Saved search index via store');
      log.debug('Extraction complete with total keys:', searchIndexData.keys.length);
    },
  };
}
