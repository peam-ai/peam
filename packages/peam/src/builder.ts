/**
 * Re-export builders from @peam-ai/builder
 * Separate entry point to avoid loading heavy dependencies (jsdom)
 */

export {
  FileBasedSearchIndexBuilder,
  PrerenderSearchIndexBuilder,
  createBuilderFromConfig,
  type FileBasedSearchIndexBuilderOptions,
  type PrerenderPage,
  type PrerenderSearchIndexBuilderOptions,
  type SearchBuilderConfig,
  type SearchIndexBuilder,
} from '@peam-ai/builder';
