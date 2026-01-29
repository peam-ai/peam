import { loggers } from '@peam-ai/logger';
import { SearchEngine, type SearchIndexStore } from '@peam-ai/search';

const log = loggers.server;
let searchEngine: SearchEngine | null = null;

export async function getSearchEngine(store: SearchIndexStore): Promise<SearchEngine | undefined> {
  if (searchEngine) return searchEngine;

  try {
    const indexData = await store.import();

    if (!indexData || !indexData.keys || indexData.keys.length === 0) {
      log.debug('Search index not yet generated. Run build first to generate the index.');
      return undefined;
    }

    searchEngine = new SearchEngine();
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
