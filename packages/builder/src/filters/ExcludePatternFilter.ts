import { loggers } from '@peam-ai/logger';
import { isMatch } from 'matcher';
import type { PageCandidate } from '../builder/types';
import type { SearchIndexFilter } from './SearchIndexFilter';

const log = loggers.builder;

export interface ExcludePatternFilterConfig {
  exclude: string[];
  label?: string;
}

export class ExcludePatternFilter implements SearchIndexFilter {
  constructor(private readonly options: ExcludePatternFilterConfig) {}

  private matchesExcludePattern(pathname: string): boolean {
    if (!this.options.exclude || this.options.exclude.length === 0) {
      return false;
    }

    const normalize = (value: string) => (value.startsWith('/') ? value : `/${value}`);
    const normalizedPath = normalize(pathname);
    const normalizedPatterns = this.options.exclude.map(normalize);

    return isMatch(normalizedPath, normalizedPatterns);
  }

  async filter(pages: PageCandidate[]): Promise<PageCandidate[]> {
    if (!this.options.exclude || this.options.exclude.length === 0) return pages;

    const filtered: PageCandidate[] = [];

    for (const page of pages) {
      if (this.matchesExcludePattern(page.path)) {
        const label = this.options.label ?? 'user pattern';
        log.debug(`Path excluded by ${label}:`, page.path);
        continue;
      }

      filtered.push(page);
    }

    return filtered;
  }
}
