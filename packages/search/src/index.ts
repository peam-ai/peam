export type { SearchEngine, SearchOptions } from './searchEngine/searchEngine';
export { TextBasedSearchEngine, type TextBasedSearchEngineConfig } from './searchEngine/textBasedSearchEngine';
export type { SearchIndexData, StructuredPageDocumentData } from './types';

export {
  FileBasedSearchIndexStore,
  createStoreFromConfig,
  type FileBasedSearchIndexStoreOptions,
  type SearchIndexStore,
  type SearchStoreConfig,
} from './stores';
