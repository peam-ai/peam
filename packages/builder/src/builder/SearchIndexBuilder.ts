import { loggers } from '@peam-ai/logger';
import { parseHTML, type StructuredPage } from '@peam-ai/parser';
import { SearchEngine, type SearchIndexData } from '@peam-ai/search';
import * as fs from 'fs/promises';
import { createFiltersFromConfig, SearchIndexBuilderFilterConfig } from '../filters/config';
import type { SearchIndexFilter } from '../filters/SearchIndexFilter';
import { createSourceFromConfig, type SearchIndexSourceConfig } from '../sources/config';
import type { SearchIndexSource } from '../sources/SearchIndexSource';
import type { PageCandidate } from './types';

const log = loggers.builder;

export type SearchIndexBuilderOptions = {
  sources: SearchIndexSource[];
  filters: SearchIndexFilter[];
};

export type PageToIndex = {
  path: string;
  structuredPage: StructuredPage;
};

export class SearchIndexBuilder {
  private readonly sources: SearchIndexSource[];
  private readonly filters: SearchIndexFilter[];

  constructor(options: SearchIndexBuilderOptions) {
    this.sources = options.sources;
    this.filters = options.filters;
  }

  static fromConfigs(
    sourceConfigs: SearchIndexSourceConfig[],
    filterConfig?: SearchIndexBuilderFilterConfig
  ): SearchIndexBuilder {
    const sources = sourceConfigs.map(createSourceFromConfig);
    const filters = createFiltersFromConfig(sources, filterConfig);
    return new SearchIndexBuilder({ sources, filters });
  }

  private async discover(): Promise<PageCandidate[]> {
    const results = await Promise.all(this.sources.map((source) => source.discover()));
    const pages = results.flat();

    if (pages.length === 0) return [];

    const unique = new Map<string, PageCandidate>();
    for (const page of pages) {
      if (!unique.has(page.path)) {
        unique.set(page.path, page);
      }
    }

    return Array.from(unique.values());
  }

  private async applyFilters(pages: PageCandidate[]): Promise<PageCandidate[]> {
    let current = pages;
    for (const filter of this.filters) {
      current = await filter.filter(current);
    }
    return current;
  }

  private async loadStructuredPages(pages: PageCandidate[]): Promise<PageToIndex[]> {
    const results: PageToIndex[] = [];

    for (const page of pages) {
      try {
        const content = page.content ?? (page.filePath ? await fs.readFile(page.filePath, 'utf-8') : undefined);

        if (!content) {
          log.warn('Missing content for', page.path);
          continue;
        }

        const structuredPage = parseHTML(content);

        if (!structuredPage) {
          log.warn('No content extracted from', page.path);
          continue;
        }

        results.push({
          path: page.path,
          structuredPage: structuredPage as StructuredPage,
        });
      } catch (error) {
        log.error('Error processing', page.path, error);
      }
    }

    return results;
  }

  async build(searchEngine: SearchEngine): Promise<SearchIndexData | null> {
    log.debug('Building search index via builder');

    const discovered = await this.discover();
    if (discovered.length === 0) {
      log.warn('No pages discovered by sources');
      return null;
    }

    const filtered = await this.applyFilters(discovered);
    if (filtered.length === 0) {
      log.warn('No pages left after filtering');
      return null;
    }

    const structuredPages = await this.loadStructuredPages(filtered);
    if (structuredPages.length === 0) {
      log.warn('No pages available to index');
      return null;
    }

    log.debug('Creating search index from', structuredPages.length, 'pages');

    await searchEngine.initialize();

    for (const page of structuredPages) {
      await searchEngine.addPage(page.path, page.structuredPage);
    }

    const exportedData: Record<string, string> = {};
    const result = await searchEngine.export(async (key, data) => {
      exportedData[key] = data;
    });

    return {
      keys: result.keys,
      data: exportedData,
    };
  }
}
