import type { StructuredPage } from '@peam-ai/parser';
import { SearchEngine } from './searchEngine';

export interface PageToIndex {
  path: string;
  structuredPage: StructuredPage;
}

export interface SearchIndexData {
  keys: string[];
  data: Record<string, string>;
}

/**
 * Build a search index from structured pages
 */
export async function buildSearchIndex(pages: PageToIndex[]): Promise<SearchIndexData> {
  const searchEngine = new SearchEngine();
  await searchEngine.initialize();

  for (const page of pages) {
    await searchEngine.addPage(page.path, page.structuredPage);
  }

  const exportedData: Record<string, string> = {};
  const result = await searchEngine.export(async (key, data) => {
    exportedData[key] = data;
  });

  return {
    keys: result.keys,
    data: exportedData,
  };
}
