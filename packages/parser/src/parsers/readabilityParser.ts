import { Readability } from '@mozilla/readability';
import { StructuredPage } from '../structuredPage';
import { ParseOptions, Parser } from './parser';

export class ReadabilityParser implements Parser {
  parse(document: Document, options?: ParseOptions): StructuredPage | undefined {
    const { keepClasses, disableJSONLD } = options || {};

    const reader = new Readability(document, {
      keepClasses,
      disableJSONLD,
    });

    const parsedPage = reader.parse();

    if (parsedPage) {
      const page: StructuredPage = {
        title: parsedPage.title,
        description: parsedPage.excerpt,
        content: parsedPage.content,
        textContent: parsedPage.textContent,
        contentLength: parsedPage.length,
        author: parsedPage.byline,
        direction: parsedPage.dir,
        language: parsedPage.lang,
        siteName: parsedPage.siteName,
        publishedTime: parsedPage.publishedTime,
      };

      return page;
    }

    return undefined;
  }
}
