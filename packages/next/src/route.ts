import { createChat } from 'peam/server';
import { getConfig } from './config';

/**
 * Default POST handler using GPT-4o.
 *
 * @example
 * ```typescript
 * export { POST } from '@peam-ai/next/route';
 * ```
 */
const config = getConfig();

export const POST = createChat({
  searchIndexStore: config.searchIndexStore,
}).handler;
