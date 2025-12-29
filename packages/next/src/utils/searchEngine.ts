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
    const indexPath = `${config.outputDir}/${config.indexFilename}`;
    log(`Loading index from: ${indexPath}`);

    // Use @/ alias which Next.js resolves to the project root src directory
    const indexFile = await import(`@/../${indexPath}`);

    await searchEngine.import(async (key: string) => {
      return indexFile.data[key];
    }, indexFile.keys);

    const totalDocs = searchEngine.count();
    log(`Index loaded successfully with ${totalDocs} documents`);
    return searchEngine;
  } catch (error) {
    log(`Failed to load search index: ${error}`);
  }

  return undefined;
}
