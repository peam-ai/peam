import { loggers } from '@peam-ai/logger';
import { SearchEngine } from '@peam-ai/search';

const log = loggers.server;
let searchEngine: SearchEngine | null = null;

export async function getSearchEngine(): Promise<SearchEngine | undefined> {
  if (searchEngine) return searchEngine;

  try {
    // @ts-expect-error - peam_index/generated is resolved via webpack/turbopack alias
    const indexFile = (await import('peam_index/generated'))?.default;

    // Check if this is the stub
    if (!indexFile || !indexFile.data || !indexFile.keys || indexFile.keys.length === 0) {
      log.debug('Search index not yet generated. Run build first to generate the index.');
      return undefined;
    }

    searchEngine = new SearchEngine();
    await searchEngine.import(async (key: string) => {
      return indexFile.data[key];
    }, indexFile.keys);

    const totalDocs = searchEngine.count();
    log.debug('Index loaded successfully with', totalDocs, 'documents');
    return searchEngine;
  } catch (error) {
    log.error('Failed to load search index:', error);
  }

  return undefined;
}
