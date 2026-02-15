import { describe, expect, it, vi } from 'vitest';
import { PrerenderSearchIndexSource } from './PrerenderSearchIndexSource';

vi.mock('@peam-ai/logger', () => ({
  loggers: {
    builder: {
      debug: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
  },
}));

describe('PrerenderSearchIndexSource', () => {
  it('returns empty array when no prerender pages are provided', async () => {
    // arrange
    const source = new PrerenderSearchIndexSource({ prerenders: [], projectDir: '/project' });

    // act
    const result = await source.discover();

    // assert
    expect(result).toEqual([]);
  });

  it('parses prerender pages from JSON and fixes fallback paths', async () => {
    // arrange
    const prerenders = JSON.stringify([
      { pathname: '/docs', fallback: { filePath: '/project/out/.html' } },
      { pathname: '/blog', fallback: { filePath: '/project/out/blog.html' } },
    ]);
    const source = new PrerenderSearchIndexSource({ prerenders, projectDir: '/project' });

    // act
    const result = await source.discover();

    // assert
    expect(result).toEqual([
      { path: '/docs', filePath: '/project/out/index.html', source: 'prerender' },
      { path: '/blog', filePath: '/project/out/blog.html', source: 'prerender' },
    ]);
  });
});
