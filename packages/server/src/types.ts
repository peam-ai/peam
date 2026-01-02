import { SearchEngine } from '@peam/search';
import { UIMessage, type LanguageModel } from 'ai';

/**
 * Metadata about the current page the user is on.
 */
export interface CurrentPageMetadata {
  /**
   * The title of the page (optional).
   */
  title?: string;
  /**
   * The origin of the page.
   */
  origin: string;
  /**
   * The path of the page (e.g., "/about").
   */
  path: string;
}

/**
 * Function to retrieve the search engine instance.
 */
export type GetSearchEngine = () => Promise<SearchEngine | undefined>;

/**
 * Options for creating a chat handler.
 */
export interface CreateHandlerOptions {
  /**
   * The language model to use for generating responses.
   */
  model: LanguageModel;
  /**
   * Function to retrieve the search engine instance.
   * If not provided, the handler will return an error when no search engine is available.
   */
  getSearchEngine?: GetSearchEngine;
}

/**
 * Request body structure for chat API.
 */
export interface ChatRequestBody {
  messages: UIMessage[];
}
