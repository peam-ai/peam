import type { SearchIndexData } from '../indexBuilder';

export type ExportOptions = {
  /**
   * Whether to override existing index data
   * @default false
   */
  override?: boolean;
};

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
   * @param options Exporter options
   */
  export(data: SearchIndexData, options?: ExportOptions): Promise<void>;

  /**
   * Synchronous export of search index to storage
   * @param data
   * @param options Exporter options
   */
  exportSync?(data: SearchIndexData, options?: ExportOptions): void;
}
