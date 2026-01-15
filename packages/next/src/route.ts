import { FileBasedSearchIndexExporter } from '@peam-ai/search';
import { createHandler } from 'peam/server';
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

export const POST = createHandler({
  searchIndexExporter: new FileBasedSearchIndexExporter({
    baseDir: process.cwd(),
    indexPath: config.indexPath,
  }),
});
