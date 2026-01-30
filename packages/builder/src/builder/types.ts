export type PageCandidate = {
  path: string;
  content?: string;
  filePath?: string;
  source: 'prerender' | 'fileBased';
};
