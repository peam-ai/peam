import type { SearchIndexData } from '../indexBuilder';

/**
 * Interface for exporting and importing search indexes
 */
export interface SearchIndexExporter {
  /**
   * Import a search index from storage
   * @returns The search index data or null if not available
   */
  import(): Promise<SearchIndexData | null>;

  /**
   * Export a search index to storage
   * @param data The search index data to save
   */
  export(data: SearchIndexData): Promise<void>;

  /**
   * Synchronous export of search index to storage
   * @param data
   */
  exportSync?(data: SearchIndexData): void;
}
