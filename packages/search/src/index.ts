export { buildSearchIndex, type PageToIndex, type SearchIndexData } from './indexBuilder';
export { SearchEngine } from './searchEngine';
export { TextSearch } from './textSearch';

export type { StructuredPageDocumentData } from './types';

export type { SearchEngineConfig } from './searchEngine';

export {
  FileBasedSearchIndexStore,
  createStoreFromConfig,
  type FileBasedSearchIndexStoreOptions,
  type SearchIndexStore,
  type SearchStoreConfig,
} from './stores';
