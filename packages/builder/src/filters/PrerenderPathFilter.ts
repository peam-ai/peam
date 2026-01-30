import { loggers } from '@peam-ai/logger';
import type { PageCandidate } from '../builder/types';
import type { SearchIndexFilter } from './SearchIndexFilter';

const log = loggers.builder;

const STATIC_ASSET_REGEX = /\.(ico|png|jpg|jpeg|svg|gif|webp|txt|xml|json|css|js|woff|woff2|ttf|eot)$/i;

type PrerenderPathFilterReason = 'dynamic-route' | 'internal-route' | 'rsc-file' | 'segment-file' | 'static-asset';

function getPrerenderPathExclusion(pathname: string): PrerenderPathFilterReason | null {
  if (pathname.includes('[') && pathname.includes(']')) {
    return 'dynamic-route';
  }

  if (pathname.startsWith('/_not-found') || pathname.startsWith('/_global-error')) {
    return 'internal-route';
  }

  if (pathname.endsWith('.rsc')) {
    return 'rsc-file';
  }

  if (pathname.includes('.segments/')) {
    return 'segment-file';
  }

  if (STATIC_ASSET_REGEX.test(pathname)) {
    return 'static-asset';
  }

  return null;
}

/**
 * Filters out prerender-specific non-indexable paths such as
 * dynamic routes, internal Next.js routes, RSC files, and static assets.
 */
export class PrerenderPathFilter implements SearchIndexFilter {
  async filter(pages: PageCandidate[]): Promise<PageCandidate[]> {
    const filtered: PageCandidate[] = [];

    for (const page of pages) {
      const reason = getPrerenderPathExclusion(page.path);
      if (reason) {
        log.debug('Path excluded by prerender rules:', page.path, reason);
        continue;
      }
      filtered.push(page);
    }

    return filtered;
  }
}
