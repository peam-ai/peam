import type { StructuredPage } from '@peam-ai/parser';

export type StructuredPageDocumentData = {
  id: string;
  path: string;
  content: StructuredPage;
  [key: string]: any;
};
