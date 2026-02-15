import { describe, expect, it, vi } from 'vitest';
import { FileBasedSearchIndexSource } from './FileBasedSearchIndexSource';

const existsSync = vi.hoisted(() => vi.fn());
const fg = vi.hoisted(() => vi.fn());

vi.mock('fs', () => ({
  existsSync,
}));

vi.mock('fast-glob', () => ({
  default: fg,
}));

vi.mock('@peam-ai/logger', () => ({
  loggers: {
    builder: {
      debug: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
  },
}));

describe('FileBasedSearchIndexSource', () => {
  it('throws when no source directory can be determined', () => {
    // arrange
    existsSync.mockReturnValue(false);

    // act
    const createSource = () => new FileBasedSearchIndexSource({ projectDir: '/project' });

    // assert
    expect(createSource).toThrow('sourceDir is required for FileBasedSearchIndexSource');
  });

  it('discovers files and maps them to pathnames', async () => {
    // arrange
    fg.mockResolvedValue([
      '/project/dist/index.html',
      '/project/dist/docs/index.html',
      '/project/dist/server/pages/blog.html',
      '/project/dist/index.htm',
    ]);

    const source = new FileBasedSearchIndexSource({
      projectDir: '/project',
      sourceDir: 'dist',
    });

    // act
    const result = await source.discover();

    // assert
    expect(result).toEqual([
      { path: '/', filePath: '/project/dist/index.html', source: 'fileBased' },
      { path: '/docs/', filePath: '/project/dist/docs/index.html', source: 'fileBased' },
      { path: '/blog', filePath: '/project/dist/server/pages/blog.html', source: 'fileBased' },
    ]);
  });
});
