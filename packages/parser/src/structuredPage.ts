export interface StructuredPage {
  title: string;
  description: string;
  content: string;
  textContent: string;
  markdownContent?: string;
  contentLength?: number;

  author?: string;
  direction?: string;
  language?: string;

  siteName?: string;
  publishedTime?: string;

  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;

  keywords?: string[];

  headings?: string[];

  internalLinks?: string[];
  externalLinks?: string[];
  images?: string[];
  imageAlts?: string[];
}
