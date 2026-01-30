import { loggers } from '@peam-ai/logger';
import { PrerenderSearchIndexSource } from '../sources/PrerenderSearchIndexSource';
import { SearchIndexSource } from '../sources/SearchIndexSource';
import { CommonFilter } from './CommonFilter';
import { ExcludePatternFilter } from './ExcludePatternFilter';
import { PrerenderPathFilter } from './PrerenderPathFilter';
import { RobotsTxtFilter } from './RobotsTxtFilter';
import { SearchIndexFilter } from './SearchIndexFilter';

const log = loggers.builder;

export interface SearchIndexBuilderFilterConfig {
  exclude?: string[] | string;
  robotsTxt?: string | boolean;
}

function normalizeExclude(exclude?: string[] | string): string[] {
  if (Array.isArray(exclude)) {
    return exclude.map((value) => value.trim()).filter(Boolean);
  }
  if (typeof exclude === 'string') {
    return exclude
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
  }
  return [];
}

export function createFiltersFromConfig(
  sources: SearchIndexSource[],
  config?: SearchIndexBuilderFilterConfig
): SearchIndexFilter[] {
  const filters: SearchIndexFilter[] = [];
  const exclude = normalizeExclude(config?.exclude);

  // if exclude is defined but empty, skip CommonFilter
  if (!(config?.exclude && exclude.length == 0)) {
    filters.push(new CommonFilter());
  }

  const hasPrerenderSource = sources.some((source) => source instanceof PrerenderSearchIndexSource);
  if (hasPrerenderSource) {
    filters.push(new PrerenderPathFilter());
  }

  if (exclude.length > 0) {
    filters.push(new ExcludePatternFilter({ exclude }));
  }

  const robotsTxt = config?.robotsTxt;
  if (robotsTxt !== false) {
    for (const source of sources) {
      if (source.getProjectDir()) {
        filters.push(
          new RobotsTxtFilter({
            projectDir: source.getProjectDir(),
            robotsTxt,
          })
        );
      }
    }
  }

  log.debug('Created', filters.length, 'filter(s) for SearchIndexBuilder');

  return filters;
}
