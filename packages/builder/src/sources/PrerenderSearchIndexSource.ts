import { loggers } from '@peam-ai/logger';
import type { PageCandidate } from '../builder/types';
import type { SearchIndexSource } from './SearchIndexSource';

const log = loggers.builder;

/**
 * Prerendered page
 */
export interface PrerenderPage {
  pathname: string;
  fallback?: {
    filePath: string;
  };
}

/**
 * Configuration for prerender search index source
 * @description Index prerendered pages
 */
export interface PrerenderSearchIndexSourceOptions {
  /**
   * The prerender pages from the framework build
   * @description Array of prerendered pages (JSON)
   */
  prerenders: PrerenderPage[] | string;

  /**
   * The project directory
   * @description Project root directory
   */
  projectDir: string;
}

/**
 * Prerender implementation of SearchIndexSource
 * Discovers prerendered pages for indexing
 */
export class PrerenderSearchIndexSource implements SearchIndexSource {
  private prerenders: PrerenderPage[];
  private projectDir: string;

  constructor(options: PrerenderSearchIndexSourceOptions) {
    this.prerenders =
      typeof options.prerenders === 'string' ? (JSON.parse(options.prerenders) as PrerenderPage[]) : options.prerenders;
    this.projectDir = options.projectDir;
  }

  getProjectDir(): string {
    return this.projectDir;
  }

  async discover(): Promise<PageCandidate[]> {
    log.debug('Discovering prerender pages');

    if (!this.prerenders || this.prerenders.length === 0) {
      log.warn('No prerender pages found');
      return [];
    }

    const pages: PageCandidate[] = [];

    for (const prerender of this.prerenders) {
      const pathname = prerender.pathname;
      let fallbackFilePath = prerender.fallback?.filePath;

      if (!fallbackFilePath) {
        continue;
      }

      // Fix for Next.js 15
      if (fallbackFilePath.endsWith('/.html')) {
        fallbackFilePath = fallbackFilePath.replace('/.html', '/index.html');
      }

      pages.push({
        path: pathname,
        filePath: fallbackFilePath,
        source: 'prerender',
      });
    }

    log.debug('Discovered', pages.length, 'prerender pages');
    return pages;
  }
}
