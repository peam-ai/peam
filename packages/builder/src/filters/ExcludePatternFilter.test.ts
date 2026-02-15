import { describe, expect, it, vi } from 'vitest';
import type { PageCandidate } from '../builder/types';
import { ExcludePatternFilter } from './ExcludePatternFilter';

vi.mock('@peam-ai/logger', () => ({
  loggers: {
    builder: {
      debug: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
  },
}));

describe('ExcludePatternFilter', () => {
  it('returns pages unchanged when no excludes are provided', async () => {
    // arrange
    const pages: PageCandidate[] = [
      { path: '/docs', content: 'content', source: 'fileBased' },
      { path: '/blog', content: 'content', source: 'fileBased' },
    ];
    const filter = new ExcludePatternFilter({ exclude: [] });

    // act
    const result = await filter.filter(pages);

    // assert
    expect(result).toEqual(pages);
  });

  it('filters pages matching exclude patterns', async () => {
    // arrange
    const pages: PageCandidate[] = [
      { path: '/docs', content: 'content', source: 'fileBased' },
      { path: '/blog/post', content: 'content', source: 'fileBased' },
      { path: '/admin', content: 'content', source: 'fileBased' },
    ];
    const filter = new ExcludePatternFilter({ exclude: ['admin', '/blog/**'] });

    // act
    const result = await filter.filter(pages);

    // assert
    expect(result).toEqual([{ path: '/docs', content: 'content', source: 'fileBased' }]);
  });
});
