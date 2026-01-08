import { loggers } from '@peam-ai/logger';
import type { StructuredPage } from '@peam-ai/parser';
import { TextSearch, type TextSearchOptions } from './textSearch';
import type { StructuredPageDocumentData } from './types';

const log = loggers.search;

export interface SearchEngineConfig {
  // Reserved for future configuration options
}

export class SearchEngine {
  private textSearch: TextSearch;
  private initialized: boolean;

  constructor(_config?: SearchEngineConfig) {
    this.textSearch = new TextSearch();
    this.initialized = false;
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    log('Initializing search engine');
    await this.textSearch.initialize();
    this.initialized = true;
  }

  async addPage(path: string, content: StructuredPage): Promise<void> {
    if (!this.initialized) {
      throw new Error('Search engine not initialized. Call initialize() first.');
    }

    const document: StructuredPageDocumentData = {
      id: path,
      path,
      content,
    };

    await this.textSearch.addDocument(document);
    log('Page added to search engine: %s', path);
  }

  async search(query: string, options: TextSearchOptions = {}): Promise<StructuredPageDocumentData[]> {
    if (!this.initialized) {
      throw new Error('Search engine not initialized. Call initialize() first.');
    }

    log('Performing text search: "%s"', query);
    return this.textSearch.search(query, options);
  }

  count(): number {
    return this.textSearch.count();
  }

  getDocument(path: string) {
    return this.textSearch.getDocument(path);
  }

  getAllDocuments(limit?: number): StructuredPageDocumentData[] {
    return this.textSearch.getAllDocuments(limit);
  }

  clear(): void {
    this.textSearch.clear();
  }

  async export(handler: (key: string, data: string) => Promise<void>): Promise<{ keys: string[] }> {
    return this.textSearch.export(handler);
  }

  async import(handler: (key: string) => Promise<string>, keys: string[]): Promise<void> {
    await this.textSearch.import(handler, keys);
    this.initialized = true;
    log('Search engine initialized from imported data');
  }
}
