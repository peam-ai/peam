import { loggers } from '@peam/logger';
import type { StructuredPage } from '@peam/parser';
import { TextSearch, type TextSearchOptions } from './textSearch';
import type {
  IndexedDocument
} from './types';

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

    const document: IndexedDocument = {
      id: path,
      path,
      content,
    };

    await this.textSearch.addDocument(document);
    log('Page added to search engine: %s', path);
  }

  async search(query: string, options: TextSearchOptions = {}): Promise<IndexedDocument[]> {
    if (!this.initialized) {
      throw new Error('Search engine not initialized. Call initialize() first.');
    }

    log('Performing text search: "%s"', query);
    return this.textSearch.search(query, options);
  }

  getDocument(path: string): IndexedDocument | undefined {
    return this.textSearch.getDocument(path);
  }

  getAllDocuments(): IndexedDocument[] {
    return this.textSearch.getAllDocuments();
  }

  clear(): void {
    this.textSearch.clear();
  }

  async export(): Promise<any> {
    return this.textSearch.export();
  }

  async import(data: any): Promise<void> {
    await this.textSearch.import(data);
  }
}
