import { openai } from '@ai-sdk/openai';
import { streamSearchText } from '@peam/ai';
import { loggers } from '@peam/logger';
import { createUIMessageStreamResponse, UIMessage, type LanguageModel } from 'ai';
import { getCurrentPage } from './utils/currentPage';
import { getSearchEngine } from './utils/searchEngine';

const MAX_MESSAGE_LENGTH = 1000;
const log = loggers.next;

type RequestBody = {
  messages: UIMessage[];
};

/**
 * Creates a POST handler for the chat API route with a custom model.
 *
 * @example
 * ```typescript
 * // Custom model with custom config
 * import { createPOST } from '@peam/next/route';
 * import { anthropic } from '@ai-sdk/anthropic';
 *
 * export const maxDuration = 60;
 * export const runtime = 'edge';
 *
 * export const POST = createPOST({
 *   model: anthropic('claude-3-5-sonnet-20241022'),
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Using Google Gemini
 * import { createPOST } from '@peam/next/route';
 * import { google } from '@ai-sdk/google';
 *
 * export const maxDuration = 45;
 *
 * export const POST = createPOST({
 *   model: google('gemini-2.0-flash-exp'),
 * });
 * ```
 */
export function createPOST(options: { model: LanguageModel }) {
  const handler = async (req: Request) => {
    try {
      const { messages } = (await req.json()) as RequestBody;

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
      const searchEngine = await getSearchEngine();

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
        model: options.model,
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

/**
 * Default POST handler using GPT-4o.
 *
 * @example
 * ```typescript
 * export { POST } from '@peam/next/route';
 * ```
 */
export const POST = createPOST({
  model: openai('gpt-4o'),
});
