export { createChat } from './createChat';
import { createChat } from './createChat';

/**
 * Default POST handler using GPT-4o.
 *
 * @example
 * ```typescript
 * export { POST } from '@peam-ai/next/route';
 * ```
 */
export const POST = createChat().handler;
