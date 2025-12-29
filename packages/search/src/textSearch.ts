import { Charset, Document } from "flexsearch";
import { loggers } from '@peam/logger';
import type { StructuredPageDocumentData } from './types';

export interface TextSearchOptions {
  limit?: number;
  offset?: number;
  suggest?: boolean;
}

const PEAM_DOCUMENT_IDS_KEY = 'peam.documentIds';
const MAX_DOCUMENTS_RETRIEVE = 25;
const log = loggers.search;

export class TextSearch {
  private index: Document<StructuredPageDocumentData>;
  private initialized: boolean;
  private documentIds: Set<string>;

  constructor() {
    this.initialized = false;
    this.index = this.getIndex();
    this.documentIds = new Set();
  }

  private getIndex() {
    return new Document<StructuredPageDocumentData>({
      worker: false,
      document: {
        id: 'path',
        index: ['content:title', 'content:description', 'content:textContent', 'content:author', 'content:keywords'],
        store: true,
      },
      tokenize: 'strict',
      resolution: 9,
      context: {
        resolution: 3,
        depth: 2,
        bidirectional: true,
      },
      cache: 100,
      encoder: Charset.LatinExtra,
    });
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      log('Text search already initialized');
      return;
    }

    this.initialized = true;
  }

  async addDocument(document: StructuredPageDocumentData): Promise<void> {
    if (!this.initialized) {
      throw new Error('TextSearch not initialized. Call initialize() first.');
    }

    log('Adding document to text search: %s', document.path);

    this.index.add(document);
    this.documentIds.add(document.path);
  }

  async search(query: string, options: TextSearchOptions = {}): Promise<StructuredPageDocumentData[]> {
    if (!this.initialized) {
      throw new Error('TextSearch not initialized. Call initialize() first.');
    }

    const limit = options.limit || MAX_DOCUMENTS_RETRIEVE;
    const offset = options.offset || 0;

    log('Searching for: "%s"', query);

    const results = await this.index.search(query, {
      limit: limit + offset,
      suggest: options.suggest,
      enrich: true,
    });

    const pathSet = new Set<string>();
    const documents: StructuredPageDocumentData[] = [];

    for (const fieldResults of results) {
      if (Array.isArray(fieldResults.result)) {
        for (const result of fieldResults.result) {
          const id = typeof result === 'object' && 'id' in result ? result.id : result;
          const doc = typeof result === 'object' && 'doc' in result ? result.doc : null;

          if (!pathSet.has(id as string) && doc) {
            pathSet.add(id as string);
            documents.push(doc);
          }
        }
      }
    }

    const pagedResults = documents.slice(offset, offset + limit);

    return pagedResults;
  }

  count(): number {
    return this.documentIds.size;
  }

  getDocument(path: string) {
    return this.index.get(path);
  }

  getAllDocuments(limit?: number): StructuredPageDocumentData[] {
    const documents: StructuredPageDocumentData[] = [];
    let count = 0;
    limit = limit || MAX_DOCUMENTS_RETRIEVE;

    for (const id of this.documentIds) {
      if (count >= limit) {
        break;
      }

      const doc = this.index.get(id);
      if (doc) {
        documents.push(doc);
        count++;
      }
    }

    log('Retrieved %d documents from store (limit: %d)', documents.length, limit);
    return documents;
  }

  clear(): void {
    this.index.clear();
    this.index = this.getIndex();
    this.documentIds.clear();
  }

  async export(handler: (key: string, data: string) => Promise<void>): Promise<{ keys: string[] }> {
    const keys: string[] = [];

    await handler(PEAM_DOCUMENT_IDS_KEY, JSON.stringify(Array.from(this.documentIds)));
    keys.push(PEAM_DOCUMENT_IDS_KEY);

    await this.index.export(async (key: string, data: string) => {
      keys.push(key);
      await handler(key, data);
    });

    log('Exported %d keys', keys.length);

    return { keys };
  }

  async import(handler: (key: string) => Promise<string>, keys: string[]): Promise<void> {
    const documentIdsData = await handler(PEAM_DOCUMENT_IDS_KEY);
    if (documentIdsData) {
      const parsed = typeof documentIdsData === 'string' ? JSON.parse(documentIdsData) : documentIdsData;
      this.documentIds = new Set(parsed);
    }

    for (const key of keys) {
      if (key === PEAM_DOCUMENT_IDS_KEY) {
        continue;
      }

      try {
        const data = await handler(key);
        if (data) {
          this.index.import(key, data);
        }
      } catch (error) {
        log('Error importing key %s: %s', key, error);
      }
    }

    this.initialized = true;
    log('Import completed with %d keys', keys.length);
  }
}
