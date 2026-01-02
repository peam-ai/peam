import { openai } from '@ai-sdk/openai';
import { createHandler as serverCreateHandler } from '@peam/server';
import { type LanguageModel } from 'ai';
import { getSearchEngine } from './utils/searchEngine';

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
export function createHandler(options: { model: LanguageModel }) {
  return serverCreateHandler({
    model: options.model,
    getSearchEngine,
  });
}

/**
 * Default POST handler using GPT-4o.
 *
 * @example
 * ```typescript
 * export { POST } from '@peam/next/route';
 * ```
 */
export const POST = createHandler({
  model: openai('gpt-4o'),
});
