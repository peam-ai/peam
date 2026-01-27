import type { SearchIndexData } from '@peam-ai/search';

/**
 * Interface for building search indexes from various sources
 */
export interface SearchIndexBuilder {
  /**
   * Build a search index from the source
   * @returns The search index data or null if not available
   */
  build(): Promise<SearchIndexData | null>;
}
