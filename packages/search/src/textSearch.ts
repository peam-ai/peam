import FlexSearch from 'flexsearch';
import { loggers } from '@peam/logger';
import type { IndexedDocument } from './types';

export interface TextSearchOptions {
  limit?: number;
  offset?: number;
  suggest?: boolean;
}

const log = loggers.search;

export class TextSearch {
  private index: FlexSearch.Document<IndexedDocument, true>;
  private documents: Map<string, IndexedDocument>;
  private initialized: boolean;

  constructor() {
    this.documents = new Map();
    this.initialized = false;

    this.index = new FlexSearch.Document<IndexedDocument, true>({
      document: {
        id: 'path',
        index: [
          'content:title',
          'content:description',
          'content:textContent',
          'content:author',
          'content:keywords',
        ],
        store: true,
      },
      tokenize: 'forward',
      context: {
        resolution: 9,
        depth: 3,
        bidirectional: true,
      },
      charset: 'latin:extra',
    } as any);
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      log('Text search already initialized');
      return;
    }

    this.initialized = true;
  }

  async addDocument(document: IndexedDocument): Promise<void> {
    if (!this.initialized) {
      throw new Error('Text search not initialized. Call initialize() first.');
    }

    log('Adding document to text search: %s', document.path);

    this.documents.set(document.path, document);
    this.index.add(document);
  }

  async search(query: string, options: TextSearchOptions = {}): Promise<IndexedDocument[]> {
    if (!this.initialized) {
      throw new Error('Text search not initialized. Call initialize() first.');
    }

    const limit = options.limit || 10;
    const offset = options.offset || 0;

    log('Searching for: "%s"', query);

    const results = this.index.search(query, {
      limit: limit + offset,
      suggest: options.suggest,
    });

    const pathSet = new Set<string>();
    const documents: IndexedDocument[] = [];

    for (const fieldResults of results) {
      if (Array.isArray(fieldResults.result)) {
        for (const path of fieldResults.result) {
          if (!pathSet.has(path as string)) {
            pathSet.add(path as string);
            const doc = this.documents.get(path as string);
            if (doc) {
              documents.push(doc);
            }
          }
        }
      }
    }

    const pagedResults = documents.slice(offset, offset + limit);
  
    return pagedResults;
  }

  getDocument(path: string): IndexedDocument | undefined {
    return this.documents.get(path);
  }

  getAllDocuments(): IndexedDocument[] {
    return Array.from(this.documents.values());
  }

  clear(): void {
    this.documents.clear();
    // Recreate the index
    this.index = new FlexSearch.Document<IndexedDocument, true>({
      document: {
        id: 'path',
        index: [
          'content:title',
          'content:description',
          'content:textContent',
          'content:author',
          'content:keywords',
        ],
        store: true,
      },
      tokenize: 'forward',
      context: {
        resolution: 9,
        depth: 3,
        bidirectional: true,
      },
      charset: 'latin:extra',
    } as any);
    log('Text search cleared');
  }

  async export(): Promise<any> {
    return (this.index as any).export();
  }

  async import(data: any): Promise<void> {
    (this.index as any).import(data);
  }
}
