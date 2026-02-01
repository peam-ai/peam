import type { SearchEngine } from '@peam-ai/search';
import type { InferUIMessageChunk, UIMessage } from 'ai';
import type { Summary } from '../summarization/ConversationSummarizer';
import type { CurrentPageMetadata } from '../utils/getCurrentPage';

export interface ChatExecutionContext {
  searchEngine: SearchEngine;
}

export interface ChatStreamInput {
  messages: UIMessage[];
  summary?: Summary;
  currentPage?: CurrentPageMetadata;
}

/**
 * ChatRuntime defines the interface for handling chat interactions,
 * including streaming responses and handling HTTP requests.
 */
export interface ChatRuntime {
  /**
   * Streams chat responses based on the provided input and context.
   * @param input Chat stream input containing messages, summary, and current page metadata
   * @param context ChatRuntime execution context
   */
  stream(input: ChatStreamInput, context: ChatExecutionContext): ReadableStream<InferUIMessageChunk<UIMessage>>;

  /**
   * Handles an incoming HTTP request for the chat API.
   * @param request Incoming HTTP request or an object containing the request
   */
  handler(request: Request): Promise<Response>;
}
