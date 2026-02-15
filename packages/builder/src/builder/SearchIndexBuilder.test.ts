import type { StructuredPage } from '@peam-ai/parser';
import type { SearchEngine } from '@peam-ai/search';
import * as fsPromises from 'fs/promises';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SearchIndexBuilder } from './SearchIndexBuilder';
import type { PageCandidate } from './types';

const parseHTML = vi.fn();

vi.mock('@peam-ai/parser', () => ({
  parseHTML: (...args: unknown[]) => parseHTML(...args),
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

vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
}));

const createStructuredPage = (overrides: Partial<StructuredPage> = {}): StructuredPage => ({
  title: 'Title',
  description: 'Description',
  content: 'Content',
  textContent: 'Text',
  ...overrides,
});

const createSearchEngine = (overrides: Partial<SearchEngine> = {}): SearchEngine => ({
  initialize: vi.fn().mockResolvedValue(undefined),
  addPage: vi.fn().mockResolvedValue(undefined),
  search: vi.fn().mockResolvedValue([]),
  count: vi.fn().mockReturnValue(0),
  getDocument: vi.fn().mockReturnValue(null),
  getAllDocuments: vi.fn().mockReturnValue([]),
  clear: vi.fn(),
  export: vi.fn().mockResolvedValue({ keys: [] }),
  import: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

const createSource = (pages: PageCandidate[]) => ({
  discover: vi.fn().mockResolvedValue(pages),
  getProjectDir: vi.fn().mockReturnValue('/project'),
});

const createFilter = (pages?: PageCandidate[]) => ({
  filter: vi.fn(async (input: PageCandidate[]) => pages ?? input),
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('SearchIndexBuilder', () => {
  it('returns null when no pages are discovered', async () => {
    // arrange
    const builder = new SearchIndexBuilder({ sources: [createSource([])], filters: [] });
    const searchEngine = createSearchEngine();

    // act
    const result = await builder.build(searchEngine);

    // assert
    expect(result).toBeNull();
    expect(searchEngine.initialize).not.toHaveBeenCalled();
  });

  it('returns null when filters remove all pages', async () => {
    // arrange
    const pages: PageCandidate[] = [{ path: '/a', content: '<html/>', source: 'fileBased' }];
    const builder = new SearchIndexBuilder({
      sources: [createSource(pages)],
      filters: [createFilter([])],
    });
    const searchEngine = createSearchEngine();

    // act
    const result = await builder.build(searchEngine);

    // assert
    expect(result).toBeNull();
    expect(searchEngine.initialize).not.toHaveBeenCalled();
  });

  it('returns null when no structured pages are extracted', async () => {
    // arrange
    const pages: PageCandidate[] = [{ path: '/a', content: '<html/>', source: 'fileBased' }];
    const builder = new SearchIndexBuilder({
      sources: [createSource(pages)],
      filters: [],
    });
    const searchEngine = createSearchEngine();

    parseHTML.mockReturnValue(null);

    // act
    const result = await builder.build(searchEngine);

    // assert
    expect(result).toBeNull();
    expect(searchEngine.initialize).not.toHaveBeenCalled();
  });

  it('builds and exports a search index from discovered pages', async () => {
    // arrange
    const pages: PageCandidate[] = [
      { path: '/a', content: '<html>a</html>', source: 'fileBased' },
      { path: '/b', filePath: '/project/b.html', source: 'fileBased' },
    ];
    const builder = new SearchIndexBuilder({
      sources: [createSource(pages)],
      filters: [createFilter(pages)],
    });

    const searchEngine = createSearchEngine({
      export: vi.fn(async (handler) => {
        await handler('index', 'serialized');
        return { keys: ['index'] };
      }),
    });

    parseHTML
      .mockReturnValueOnce(createStructuredPage({ title: 'A' }))
      .mockReturnValueOnce(createStructuredPage({ title: 'B' }));

    vi.mocked(fsPromises.readFile).mockResolvedValueOnce('<html>b</html>');

    // act
    const result = await builder.build(searchEngine);

    // assert
    expect(searchEngine.initialize).toHaveBeenCalledTimes(1);
    expect(searchEngine.addPage).toHaveBeenCalledTimes(2);
    expect(searchEngine.addPage).toHaveBeenCalledWith('/a', expect.any(Object));
    expect(searchEngine.addPage).toHaveBeenCalledWith('/b', expect.any(Object));
    expect(fsPromises.readFile).toHaveBeenCalledWith('/project/b.html', 'utf-8');
    expect(result).toEqual({
      keys: ['index'],
      data: { index: 'serialized' },
    });
  });
});
