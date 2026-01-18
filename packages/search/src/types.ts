import type { StructuredPage } from '@peam-ai/parser';

export type StructuredPageDocumentData = {
  id: string;
  path: string;
  content: Pick<
    StructuredPage,
    | 'title'
    | 'description'
    | 'author'
    | 'keywords'
    // content would be the normalized text/markdown/html content of the page
    | 'content'
    | 'language'
    | 'publishedTime'
  >;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};
