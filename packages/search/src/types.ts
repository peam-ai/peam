import type { StructuredPage } from '@peam/parser';

export type StructuredPageDocumentData = {
  id: string;
  path: string;
  content: StructuredPage;
  [key: string]: any;
};
