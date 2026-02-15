import { describe, expect, it, vi } from 'vitest';
import type { PageCandidate } from '../builder/types';
import { CommonFilter } from './CommonFilter';

vi.mock('@peam-ai/logger', () => ({
  loggers: {
    builder: {
      debug: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
  },
}));

describe('CommonFilter', () => {
  it('filters common error and framework paths', async () => {
    // arrange
    const pages: PageCandidate[] = [
      { path: '/404', content: 'content', source: 'fileBased' },
      { path: '/_next/static/chunk.js', content: 'content', source: 'fileBased' },
      { path: '/docs', content: 'content', source: 'fileBased' },
    ];
    const filter = new CommonFilter();

    // act
    const result = await filter.filter(pages);

    // assert
    expect(result).toEqual([{ path: '/docs', content: 'content', source: 'fileBased' }]);
  });
});
