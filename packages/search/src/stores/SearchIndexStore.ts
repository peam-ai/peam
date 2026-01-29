import type { SearchIndexData } from '../indexBuilder';

export type StoreOptions = {
  /**
   * Whether to override existing index data
   * @default false
   */
  override?: boolean;
};

/**
 * Interface for storing and loading search indexes
 */
export interface SearchIndexStore {
  /**
   * Import a search index from storage
   * @returns The search index data or null if not available
   */
  import(): Promise<SearchIndexData | null>;

  /**
   * Export a search index to storage
   * @param data The search index data to save
   * @param options Store options
   */
  export(data: SearchIndexData, options?: StoreOptions): Promise<void>;

  /**
   * Synchronous export of search index to storage
   * @param data
   * @param options Store options
   */
  exportSync?(data: SearchIndexData, options?: StoreOptions): void;
}
