import { loggers } from '@peam-ai/logger';
import type { StructuredPage } from '@peam-ai/parser';
import type { StructuredPageDocumentData } from '../types';
import { SearchEngine, SearchOptions } from './searchEngine';
import { TextSearch } from './textSearch';

const log = loggers.search;

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TextBasedSearchEngineConfig {
  // Reserved for future configuration options
}

export class TextBasedSearchEngine implements SearchEngine {
  private textSearch: TextSearch;
  private initialized: boolean;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_config?: TextBasedSearchEngineConfig) {
    this.textSearch = new TextSearch();
    this.initialized = false;
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    log.debug('Initializing search engine');
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
      content: {
        title: content.title,
        description: content.description,
        content: content.markdownContent ? content.markdownContent : content.textContent,
        author: content.author,
        keywords: content.keywords,
        language: content.language,
        publishedTime: content.publishedTime,
      },
    };

    await this.textSearch.addDocument(document);
    log.debug('Page added to search engine:', path);
  }

  async search(query: string, options: SearchOptions = {}): Promise<StructuredPageDocumentData[]> {
    if (!this.initialized) {
      throw new Error('Search engine not initialized. Call initialize() first.');
    }

    log.debug('Performing text search:', query);
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
    log.debug('Search engine initialized from imported data');
  }
}
