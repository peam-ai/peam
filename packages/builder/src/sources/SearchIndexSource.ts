import type { PageCandidate } from '../builder/types';

/**
 * Interface for discovering pages to index
 */
export interface SearchIndexSource {
  /**
   * Get the project directory
   */
  getProjectDir(): string;

  /**
   * Discover pages to index
   */
  discover(): Promise<PageCandidate[]>;
}
