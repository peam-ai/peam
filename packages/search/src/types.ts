import type { StructuredPage } from '@peam-ai/parser';

export type StructuredPageDocumentData = {
  id: string;
  path: string;
  content: StructuredPage;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};
