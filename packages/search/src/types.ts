import type { StructuredPage } from '@peam/parser';

export interface IndexedDocument {
  id: string;
  path: string;
  content: StructuredPage;
}
