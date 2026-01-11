import { type LanguageModel } from 'ai';
import { createHandler as serverCreateHandler } from 'peam/server';
import { getSearchEngine } from './utils/searchEngine';

/**
 * Creates a POST handler for the chat API route with a custom model.
 *
 * @example
 * ```typescript
 * // Custom model with custom config
 * import { createHandler } from '@peam-ai/next/route';
 * import { anthropic } from '@ai-sdk/anthropic';
 *
 * export const maxDuration = 60;
 * export const runtime = 'edge';
 *
 * export const POST = createHandler({
 *   model: anthropic('claude-3-5-sonnet-20241022'),
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Using Google Gemini
 * import { createHandler } from '@peam-ai/next/route';
 * import { google } from '@ai-sdk/google';
 *
 * export const maxDuration = 45;
 * export const runtime = 'edge';
 *
 * export const POST = createHandler({
 *   model: google('gemini-2.0-flash-exp'),
 * });
 * ```
 */
export function createHandler(options?: { model?: LanguageModel }) {
  return serverCreateHandler({
    model: options?.model,
    getSearchEngine,
  });
}

/**
 * Default POST handler using GPT-4o.
 *
 * @example
 * ```typescript
 * export { POST } from '@peam-ai/next/route';
 * ```
 */
export const POST = createHandler();
