import { JSDOM } from 'jsdom';
import { CssSelectorParser } from './parsers/cssSelectorParser';
import { ParseOptions } from './parsers/parser';
import { ReadabilityParser } from './parsers/readabilityParser';
import { StructuredPage } from './structuredPage';

export { CssSelectorParser } from './parsers/cssSelectorParser';
export { ParseOptions } from './parsers/parser';
export { ReadabilityParser } from './parsers/readabilityParser';
export { StructuredPage } from './structuredPage';

/**
 * Parse HTML content and convert it to a StructuredPage
 * @param html - HTML string to parse
 * @param options - Parsing options
 * @returns StructuredPage or undefined if parsing fails
 */
export function parseHTML(html: string, options: ParseOptions = {}): StructuredPage | undefined {
  if (!html || html.trim().length === 0) {
    return undefined;
  }

  const dom = new JSDOM(html);
  const document = dom.window.document;

  const cssSelectorParser = new CssSelectorParser();
  const cssSelectorStructuredPage = cssSelectorParser.parse(document, options);
  const readabilityParser = new ReadabilityParser();
  const readabilityStructuredPage = readabilityParser.parse(document, options);

  if (!cssSelectorStructuredPage && !readabilityStructuredPage) {
    return undefined;
  }

  // Merge results, prioritizing Readability data
  return {
    ...{
      title: '',
      description: '',
      content: '',
      textContent: '',
    },
    ...cssSelectorStructuredPage,
    ...readabilityStructuredPage,
  };
}
