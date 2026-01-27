import { FileBasedSearchIndexBuilder, type FileBasedSearchIndexBuilderOptions } from './FileBasedSearchIndexBuilder';
import { PrerenderSearchIndexBuilder, type PrerenderSearchIndexBuilderOptions } from './PrerenderSearchIndexBuilder';
import type { SearchIndexBuilder } from './SearchIndexBuilder';

export type SearchBuilderConfig =
  | {
      type: 'fileBased';
      config: FileBasedSearchIndexBuilderOptions;
    }
  | {
      type: 'prerender';
      config: PrerenderSearchIndexBuilderOptions;
    };

/**
 * Creates a SearchIndexBuilder instance from a SearchBuilderConfig
 */
export function createBuilderFromConfig(builderConfig: SearchBuilderConfig): SearchIndexBuilder {
  switch (builderConfig.type) {
    case 'fileBased':
      return new FileBasedSearchIndexBuilder({
        ...builderConfig.config,
      });
    case 'prerender':
      return new PrerenderSearchIndexBuilder({
        ...builderConfig.config,
      });
    default:
      throw new Error(`Unknown builder type`);
  }
}
