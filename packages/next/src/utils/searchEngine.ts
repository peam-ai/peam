import { loggers } from '@peam/logger';
import { SearchEngine } from '@peam/search';
import { getConfig } from '../config';

const log = loggers.next;
let searchEngine: SearchEngine | null = null;

export async function getSearchEngine(): Promise<SearchEngine | undefined> {
  if (searchEngine) return searchEngine;

  searchEngine = new SearchEngine();

  try {
    const config = getConfig();
    log(`Loading search index from: ${config.outputDir}/search-index.json`);
    
    // Use @/ alias which Next.js resolves to the project root src directory
    const searchIndexData = await import(`@/../${config.outputDir}/search-index.json`);
    await searchEngine.import(searchIndexData);
    
    log(`Search index loaded successfully with ${searchEngine.getAllDocuments().length} documents`);
    return searchEngine;
  } catch (error) {
    log(`Failed to load search index: ${error}`);
  }

  return undefined;
}
