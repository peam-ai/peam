import { loggers } from '@peam-ai/logger';
import { TextBasedSearchEngine, type SearchEngine, type SearchIndexStore } from '@peam-ai/search';

const log = loggers.server;
let searchEngine: SearchEngine | null = null;

/**
 * Retrieves the SearchEngine instance, loading it from the provided store if necessary.
 * @param store The SearchIndexStore to load the index from.
 * @returns The SearchEngine instance or undefined if loading failed.
 */
export async function getSearchEngine(store: SearchIndexStore): Promise<SearchEngine | undefined> {
  if (searchEngine) return searchEngine;

  try {
    const indexData = await store.import();

    if (!indexData || !indexData.keys || indexData.keys.length === 0) {
      log.debug('Search index not yet generated. Run build first to generate the index.');
      return undefined;
    }

    searchEngine = new TextBasedSearchEngine();
    await searchEngine.import(async (key: string) => {
      return indexData.data[key];
    }, indexData.keys);

    const totalDocs = searchEngine.count();
    log.debug('Index loaded successfully with', totalDocs, 'documents');
    return searchEngine;
  } catch (error) {
    log.error('Failed to load search index:', error);
  }

  return undefined;
}
