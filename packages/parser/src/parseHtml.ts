import { loggers } from '@peam-ai/logger';
import { JSDOM } from 'jsdom';
import TurndownService from 'turndown';
import { CssSelectorParser } from './parsers/cssSelectorParser';
import { ParseOptions } from './parsers/parser';
import { ReadabilityParser } from './parsers/readabilityParser';
import { StructuredPage } from './structuredPage';

const log = loggers.parser;

/**
 * Parse HTML content and convert it to a StructuredPage
 * @param html - HTML string to parse
 * @param options - Parsing options
 * @returns StructuredPage or undefined if parsing fails
 */
export function parseHTML(html: string, options: ParseOptions = {}): StructuredPage | undefined {
  if (!html || html.trim().length === 0) {
    log.error('Empty or invalid HTML input');
    return undefined;
  }

  log.debug('Starting parse with options', options);
  const dom = new JSDOM(html);
  const document = dom.window.document;

  const cssSelectorParser = new CssSelectorParser();
  const cssSelectorStructuredPage = cssSelectorParser.parse(document, options);
  const readabilityParser = new ReadabilityParser();
  const readabilityStructuredPage = readabilityParser.parse(document, options);

  if (!cssSelectorStructuredPage && !readabilityStructuredPage) {
    log.error('Failed to extract content');
    return undefined;
  }

  // Merge results, prioritizing Readability data
  const mergedResult: StructuredPage = {
    ...{
      title: '',
      description: '',
      content: '',
      textContent: '',
    },
    ...cssSelectorStructuredPage,
    ...readabilityStructuredPage,
  };

  // Convert HTML content to markdown
  if (mergedResult.content) {
    try {
      const turndownService = new TurndownService({
        headingStyle: 'atx',
        codeBlockStyle: 'fenced',
      });
      mergedResult.markdownContent = turndownService.turndown(mergedResult.content);
    } catch (error) {
      log.error('Failed to convert content to markdown', error);
    }
  }

  return mergedResult;
}
