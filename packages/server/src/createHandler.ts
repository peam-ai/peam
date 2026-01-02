import { openai } from '@ai-sdk/openai';
import { streamSearchText } from '@peam/ai';
import { loggers } from '@peam/logger';
import { createUIMessageStreamResponse } from 'ai';
import { type ChatRequestBody, type CreateHandlerOptions } from './types';
import { getCurrentPage } from './utils/getCurrentPage';

const MAX_MESSAGE_LENGTH = 1000;
const log = loggers.server;

/**
 * Creates a HTTP handler for the chat API.
 * This handler processes incoming chat messages and streams responses back to the client.
 *
 * @param options - Configuration options for the handler
 * @returns An async function that handles HTTP requests
 *
 * @example
 * ```typescript
 * // Next.js
 * import { createHandler } from '@peam/server';
 * import { openai } from '@ai-sdk/openai';
 *
 * export const POST = createHandler({
 *   model: openai('gpt-4o'),
 *   getSearchEngine: async () => mySearchEngine,
 * });
 * ```
 */
export function createHandler(options: CreateHandlerOptions = {}) {
  const model = options.model || openai('gpt-4o');

  const handler = async (req: Request): Promise<Response> => {
    try {
      const { messages } = (await req.json()) as ChatRequestBody;

      if (messages.length === 0) {
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

      const lastMessage = messages[messages.length - 1];
      const currentPage = getCurrentPage({ request: req, message: lastMessage });

      // Get search engine using the provided function
      const searchEngine = options.getSearchEngine ? await options.getSearchEngine() : undefined;

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
      });

      return createUIMessageStreamResponse({ stream });
    } catch (error) {
      log(`Error in the chat route: ${error}`);

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
