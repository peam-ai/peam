import { type SearchIndexExporter } from '@peam-ai/search';
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
 * Options for creating a chat handler.
 */
export interface CreateHandlerOptions {
  /**
   * The language model to use for generating responses and summarization.
   * Defaults to OpenAI GPT-4o if not provided.
   */
  model?: LanguageModel;
  /**
   * Search index exporter to use for loading the search index.
   * If not provided, the handler will return an error when search is needed.
   */
  searchIndexExporter?: SearchIndexExporter;
}

/**
 * Request body structure for chat API.
 */
export interface ChatRequestBody {
  mode?: 'chat';
  messages: UIMessage[];
  summary?: string;
}

/**
 * Request body structure for summarization API.
 */
export interface SummarizeRequestBody {
  mode: 'summarize';
  messages: UIMessage[];
  previousSummary?: string;
}

/**
 * Conditional request body type based on mode.
 */
export type HandlerRequestBody = ChatRequestBody | SummarizeRequestBody;
