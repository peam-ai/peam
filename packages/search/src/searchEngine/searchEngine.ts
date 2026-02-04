import type { StructuredPage } from '@peam-ai/parser';
import type { StructuredPageDocumentData } from '../types';

export interface SearchOptions {
  limit?: number;
  offset?: number;
  suggest?: boolean;
}

/**
 * Interface for a search engine.
 */
export interface SearchEngine {
  /**
   * Initializes the search engine.
   */
  initialize(): Promise<void>;

  /**
   * Adds a page to the search index.
   * @param path The path of the page.
   * @param content The structured content of the page.
   */
  addPage(path: string, content: StructuredPage): Promise<void>;

  /**
   * Searches the index for relevant documents.
   * @param query The search query.
   * @param options Search options.
   * @returns A promise that resolves to an array of structured page document data.
   */
  search(query: string, options?: SearchOptions): Promise<StructuredPageDocumentData[]>;

  /**
   * Returns the total number of documents in the search index.
   * @return The number of documents.
   */
  count(): number;

  /**
   * Retrieves a document by its path.
   * @param path The path of the page.
   * @returns The structured page document data or null if not found.
   */
  getDocument(path: string): StructuredPageDocumentData | null;

  /**
   * Retrieves all documents in the search index.
   * @param limit Optional limit on the number of documents to retrieve.
   * @returns An array of structured page document data.
   */
  getAllDocuments(limit?: number): StructuredPageDocumentData[];

  /**
   * Clears the search index.
   */
  clear(): void;

  /**
   * Exports the search index data.
   * @param handler A function that handles exporting each key-data pair.
   * @returns A promise that resolves to an object containing all exported keys.
   */
  export(handler: (key: string, data: string) => Promise<void>): Promise<{ keys: string[] }>;

  /**
   * Imports search index data.
   * @param handler A function that handles importing data for each key.
   * @param keys An array of keys to import.
   * @returns A promise that resolves when the import is complete.
   */
  import(handler: (key: string) => Promise<string>, keys: string[]): Promise<void>;
}
