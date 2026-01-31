import { type SearchIndexStore } from '@peam-ai/search';
import { UIMessage, type LanguageModel } from 'ai';
import type { ConversationSummarizer, SummarizationOptions, Summary } from './summarization/ConversationSummarizer';

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
   * Search index store to use for loading the search index.
   */
  searchIndexStore?: SearchIndexStore;

  /**
   * Options for message summarization.
   */
  summarization?: SummarizationOptions | false;

  /**
   * Custom summarizer implementation.
   */
  summarizer?: ConversationSummarizer;
}

/**
 * Request body structure for chat API.
 */
export interface ChatRequestBody {
  messages: UIMessage[];
  summary?: Summary;
}

/**
 * Request body structure for chat API.
 */
export type HandlerRequestBody = ChatRequestBody;
