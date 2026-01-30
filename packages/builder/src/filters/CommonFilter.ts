import type { PageCandidate } from '../builder/types';
import { ExcludePatternFilter } from './ExcludePatternFilter';
import type { SearchIndexFilter } from './SearchIndexFilter';

const COMMON_PATHS = ['/404', '/400', '/500', '/_not-found', '/_error', '/_global-error'];
const COMMON_PREFIXES = ['/_next/**', '/_astro/**'];

export class CommonFilter implements SearchIndexFilter {
  private readonly matcher = new ExcludePatternFilter({
    exclude: [...COMMON_PATHS, ...COMMON_PREFIXES],
    label: 'common filter',
  });

  async filter(pages: PageCandidate[]): Promise<PageCandidate[]> {
    return this.matcher.filter(pages);
  }
}
