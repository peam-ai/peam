import { StructuredPage } from '../structuredPage';

export interface ParseOptions {
  /**
   * Keep CSS classes in the parsed HTML content
   * @default false
   */
  keepClasses?: boolean;

  /**
   * Disable JSON-LD extraction
   * @default true
   */
  disableJSONLD?: boolean;

  /**
   * Extract internal links
   * @default true
   */
  extractLinks?: boolean;

  /**
   * Extract images
   * @default true
   */
  extractImages?: boolean;
}

export interface Parser {
  parse: (document: Document, options?: ParseOptions) => StructuredPage | undefined;
}
