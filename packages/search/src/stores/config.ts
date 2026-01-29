import { FileBasedSearchIndexStore, FileBasedSearchIndexStoreOptions } from './FileBasedSearchIndexStore';
import { SearchIndexStore } from './SearchIndexStore';

export type SearchStoreConfig = {
  type: 'fileBased';
  config: FileBasedSearchIndexStoreOptions;
};

/**
 * Creates a SearchIndexStore instance from a SearchStoreConfig
 */
export function createStoreFromConfig(storeConfig: SearchStoreConfig): SearchIndexStore {
  if (storeConfig.type === 'fileBased') {
    return new FileBasedSearchIndexStore({
      ...storeConfig.config,
    });
  }

  throw new Error(`Unknown store type: ${storeConfig.type}`);
}
