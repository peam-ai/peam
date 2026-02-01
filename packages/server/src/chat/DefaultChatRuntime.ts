import { openai } from '@ai-sdk/openai';
import { streamSearchText } from '@peam-ai/ai';
import { loggers } from '@peam-ai/logger';
import { FileBasedSearchIndexStore, SearchIndexStore } from '@peam-ai/search';
import { createUIMessageStream, createUIMessageStreamResponse, LanguageModel, UIMessage } from 'ai';
import { ConversationSummarizer, SummarizationOptions, Summary } from '../summarization/ConversationSummarizer';
import { WindowedConversationSummarizer } from '../summarization/WindowedConversationSummarizer';
import { getCurrentPage } from '../utils/getCurrentPage';
import { getSearchEngine } from '../utils/getSearchEngine';
import type { ChatExecutionContext, ChatRuntime, ChatStreamInput } from './ChatRuntime';

const log = loggers.server;

/**
 * Options for creating ChatRuntime.
 */
export interface ChatRuntimeOptions {
  /**
   * The language model to use for generating responses and summarization.
   * Defaults to OpenAI GPT-4o if not provided.
   */
  model?: LanguageModel;

  /**
   * Maximum allowed length for a single message.
   * @default 30000
   */
  maxMessageLength?: number;

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

export class DefaultChatRuntime implements ChatRuntime {
  private readonly model;
  private readonly summarizer;
  private readonly searchIndexStore;
  private readonly maxMessageLength;

  constructor(options: ChatRuntimeOptions = {}) {
    this.model = options.model || openai('gpt-4o');
    this.maxMessageLength = options.maxMessageLength ?? 30000;
    this.summarizer =
      options.summarization === false
        ? null
        : (options.summarizer ??
          new WindowedConversationSummarizer({
            model: this.model,
            ...options.summarization,
          }));

    this.searchIndexStore =
      options.searchIndexStore ??
      new FileBasedSearchIndexStore({
        indexPath: '.peam/index.json',
      });
  }

  stream = ({ messages, summary, currentPage }: ChatStreamInput, { searchEngine }: ChatExecutionContext) => {
    const previousSummary = summary?.text;

    return createUIMessageStream({
      originalMessages: messages,
      execute: async ({ writer }) => {
        const chatStream = streamSearchText({
          model: this.model,
          searchEngine,
          messages,
          currentPage,
          summary: previousSummary,
        });

        writer.merge(chatStream);

        const summaryUpdate = await this.summarizer?.summarize({
          messages,
          previousSummary: summary,
        });

        if (summaryUpdate) {
          writer.write({
            type: 'data-summary',
            data: summaryUpdate,
          });
        }
      },
    });
  };

  private resolveExecutionContext = async (): Promise<ChatExecutionContext> => {
    if (!this.searchIndexStore) {
      throw new Error('Search index store not configured');
    }

    const searchEngine = await getSearchEngine(this.searchIndexStore);

    if (!searchEngine) {
      throw new Error('Search engine not available');
    }

    return { searchEngine };
  };

  async handler(req: Request): Promise<Response> {
    try {
      if (req.method !== 'POST') {
        return new Response(
          JSON.stringify({
            error: 'Method not allowed',
          }),
          {
            status: 405,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      const body = (await req.json()) as ChatRequestBody;
      const { messages } = body;

      if (!messages || messages.length === 0) {
        return new Response(
          JSON.stringify({
            error: 'No messages provided',
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Validate message length
      for (const message of messages) {
        const messageContent = message.parts
          .filter((part) => part.type === 'text')
          .map((part) => ('text' in part ? part.text : ''))
          .join('');

        if (messageContent.length > this.maxMessageLength) {
          return new Response(
            JSON.stringify({
              error: `Message exceeds maximum length of ${this.maxMessageLength} characters`,
            }),
            {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }
      }

      const lastMessage = messages[messages.length - 1];
      const currentPage = getCurrentPage({ request: req, message: lastMessage });
      const summary = body.summary;
      const executionContext = await this.resolveExecutionContext();

      const stream = this.stream({ messages, summary, currentPage }, executionContext);

      return createUIMessageStreamResponse({ stream });
    } catch (error) {
      log.error('Error in the chat route:', error);

      return new Response(
        JSON.stringify({
          error: 'Error while processing the chat request',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }
}

export function createChat(options: ChatRuntimeOptions = {}) {
  return new DefaultChatRuntime(options);
}
