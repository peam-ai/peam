import { describe, expect, it, vi } from 'vitest';
import type { PageCandidate } from '../builder/types';
import { PrerenderPathFilter } from './PrerenderPathFilter';

vi.mock('@peam-ai/logger', () => ({
  loggers: {
    builder: {
      debug: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
  },
}));

describe('PrerenderPathFilter', () => {
  it('filters out non-indexable prerender paths', async () => {
    // arrange
    const pages: PageCandidate[] = [
      { path: '/blog/[slug]', content: 'content', source: 'prerender' },
      { path: '/_not-found', content: 'content', source: 'prerender' },
      { path: '/page.rsc', content: 'content', source: 'prerender' },
      { path: '/app/.segments/1', content: 'content', source: 'prerender' },
      { path: '/logo.png', content: 'content', source: 'prerender' },
      { path: '/docs', content: 'content', source: 'prerender' },
    ];
    const filter = new PrerenderPathFilter();

    // act
    const result = await filter.filter(pages);

    // assert
    expect(result).toEqual([{ path: '/docs', content: 'content', source: 'prerender' }]);
  });
});
