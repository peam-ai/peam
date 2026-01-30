import { FileBasedSearchIndexSource, type FileBasedSearchIndexSourceOptions } from './FileBasedSearchIndexSource';
import { PrerenderSearchIndexSource, type PrerenderSearchIndexSourceOptions } from './PrerenderSearchIndexSource';
import type { SearchIndexSource } from './SearchIndexSource';

export type SearchIndexSourceConfig =
  | {
      type: 'fileBased';
      config: FileBasedSearchIndexSourceOptions;
    }
  | {
      type: 'prerender';
      config: PrerenderSearchIndexSourceOptions;
    };

/**
 * Creates a SearchIndexSource instance from a SearchIndexSourceConfig
 */
export function createSourceFromConfig(sourceConfig: SearchIndexSourceConfig): SearchIndexSource {
  switch (sourceConfig.type) {
    case 'fileBased':
      return new FileBasedSearchIndexSource({
        ...sourceConfig.config,
      });
    case 'prerender':
      return new PrerenderSearchIndexSource({
        ...sourceConfig.config,
      });
    default:
      throw new Error(`Unknown source type`);
  }
}
