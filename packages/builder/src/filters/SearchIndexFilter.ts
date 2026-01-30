import type { PageCandidate } from '../builder/types';

export interface SearchIndexFilter {
  filter(pages: PageCandidate[]): Promise<PageCandidate[]>;
}
