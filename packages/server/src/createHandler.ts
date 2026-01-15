import { openai } from '@ai-sdk/openai';
import { streamSearchText, streamSummarize } from '@peam-ai/ai';
import { loggers } from '@peam-ai/logger';
import { createUIMessageStreamResponse } from 'ai';
import { type CreateHandlerOptions, type HandlerRequestBody } from './types';
import { getCurrentPage } from './utils/getCurrentPage';
import { getSearchEngine } from './utils/getSearchEngine';

const MAX_MESSAGE_LENGTH = 30000;
const log = loggers.server;

/**
 * Creates a HTTP handler for the chat API.
 * This handler processes incoming chat messages and streams responses back to the client.
 *
 * @param options - Configuration options for the handler
 * @param options.model - The language model to use (default: GPT-4o)
 * @param options.searchIndexExporter - The search index exporter to use for loading the search index (required)
 * @returns An async function that handles HTTP requests
 *
 * @example
 * ```typescript
 * import { createHandler } from 'peam/server';
 * import { openai } from '@ai-sdk/openai';
 * import { FileBasedSearchIndexExporter } from '@peam-ai/search';
 *
 * export const POST = createHandler({
 *   model: openai('gpt-4o'),
 *   searchIndexExporter: new FileBasedSearchIndexExporter({
 *     baseDir: process.cwd(),
 *     indexPath: 'generated/index.json',
 *   }),
 * });
 * ```
 */
export function createHandler(options: CreateHandlerOptions = {}) {
  const model = options.model || openai('gpt-4o');

  const handler = async (req: Request): Promise<Response> => {
    try {
      const body = (await req.json()) as HandlerRequestBody;
      const { messages, mode } = body;

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

        if (messageContent.length > MAX_MESSAGE_LENGTH) {
          return new Response(
            JSON.stringify({
              error: `Message exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters`,
            }),
            {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }
      }

      // Handle summarization
      if (mode === 'summarize') {
        const { previousSummary } = body;
        const stream = streamSummarize({
          model,
          messages,
          previousSummary,
        });

        return createUIMessageStreamResponse({ stream });
      }

      // Handle chat
      const { summary } = body;
      const lastMessage = messages[messages.length - 1];
      const currentPage = getCurrentPage({ request: req, message: lastMessage });

      if (!options.searchIndexExporter) {
        return new Response(
          JSON.stringify({
            error: 'Search index exporter not configured',
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      const searchEngine = await getSearchEngine(options.searchIndexExporter);

      if (!searchEngine) {
        return new Response(
          JSON.stringify({
            error: 'Search engine not available',
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      const stream = streamSearchText({
        model,
        searchEngine,
        messages,
        currentPage,
        summary,
      });

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
  };

  return handler;
}
