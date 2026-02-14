import type { SearchEngine } from '@peam-ai/search';
import type { ToolExecutionOptions, UIMessageStreamWriter } from 'ai';
import { describe, expect, it, vi } from 'vitest';
import { createGetDocumentTool, createListDocumentsTool, createSearchTool, createSearchTools } from './tools';

const tool = vi.hoisted(() => vi.fn((config: { execute?: unknown }) => config));

vi.mock('ai', () => ({
  tool: (config: { execute?: unknown }) => tool(config),
}));

vi.mock('@peam-ai/logger', () => ({
  loggers: {
    ai: {
      debug: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
    },
  },
}));

const toolOptions: ToolExecutionOptions = {
  toolCallId: 'tool-call-id',
  messages: [],
};

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

const createWriter = (overrides: Partial<UIMessageStreamWriter> = {}): UIMessageStreamWriter => ({
  write: vi.fn<UIMessageStreamWriter['write']>(),
  merge: vi.fn<UIMessageStreamWriter['merge']>(),
  onError: undefined,
  ...overrides,
});

describe('createSearchTool', () => {
  it('returns formatted results and writes sources', async () => {
    // arrange
    const searchEngine = createSearchEngine({
      search: vi.fn<SearchEngine['search']>().mockResolvedValue([
        {
          id: 'doc-1',
          path: '/doc-1',
          content: {
            title: 'Doc 1',
            description: 'Doc 1 description',
            content: 'Doc 1 body',
          },
        },
        {
          id: 'doc-2',
          path: '/doc-2',
          content: {
            title: 'Doc 2',
            description: 'Doc 2 description',
            content: 'Doc 2 body',
          },
        },
      ]),
    });
    const writer = createWriter();

    const searchTool = createSearchTool({ searchEngine, writer });
    if (!searchTool.execute) {
      throw new Error('Expected search tool to define execute');
    }

    // act
    const result = await searchTool.execute({ query: 'test' }, toolOptions);

    // assert
    expect(writer.write).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      success: true,
      message: 'Found 2 relevant page(s)',
      results: [
        { id: 'doc-1', title: 'Doc 1', url: '/doc-1' },
        { id: 'doc-2', title: 'Doc 2', url: '/doc-2' },
      ],
    });
  });

  it('handles empty results', async () => {
    // arrange
    const searchEngine = createSearchEngine({
      search: vi.fn<SearchEngine['search']>().mockResolvedValue([]),
    });
    const writer = createWriter();

    const searchTool = createSearchTool({ searchEngine, writer });
    if (!searchTool.execute) {
      throw new Error('Expected search tool to define execute');
    }

    // act
    const result = await searchTool.execute({ query: 'none' }, toolOptions);

    // assert
    expect(writer.write).not.toHaveBeenCalled();
    expect(result).toEqual({ success: true, message: 'No matching content found.', results: [] });
  });

  it('handles search errors', async () => {
    // arrange
    const searchEngine = createSearchEngine({
      search: vi.fn<SearchEngine['search']>().mockRejectedValue(new Error('fail')),
    });
    const writer = createWriter();

    const searchTool = createSearchTool({ searchEngine, writer });
    if (!searchTool.execute) {
      throw new Error('Expected search tool to define execute');
    }

    // act
    const result = await searchTool.execute({ query: 'err' }, toolOptions);

    // assert
    expect(result).toEqual({ success: false, message: 'Search failed', results: [] });
  });
});

describe('createGetDocumentTool', () => {
  it('returns document details and writes source', async () => {
    // arrange
    const searchEngine = createSearchEngine({
      getDocument: vi.fn<SearchEngine['getDocument']>().mockReturnValue({
        id: '/doc',
        path: '/doc',
        content: {
          title: 'Doc',
          description: 'Doc description',
          content: 'Body',
          language: 'en',
        },
      }),
    });
    const writer = createWriter();

    const getTool = createGetDocumentTool({ searchEngine, writer });
    if (!getTool.execute) {
      throw new Error('Expected get document tool to define execute');
    }

    // act
    const result = await getTool.execute({ id: '/doc' }, toolOptions);

    // assert
    expect(writer.write).toHaveBeenCalledWith({
      type: 'source-url',
      sourceId: '/doc',
      url: '/doc',
      title: 'Doc',
    });
    expect(result).toEqual({
      success: true,
      message: 'Document retrieved successfully',
      document: { id: '/doc', path: '/doc', title: 'Doc', language: 'en', content: 'Body' },
    });
  });

  it('returns not found response when missing', async () => {
    // arrange
    const searchEngine = createSearchEngine({
      getDocument: vi.fn<SearchEngine['getDocument']>().mockReturnValue(null),
    });
    const writer = createWriter();

    const getTool = createGetDocumentTool({ searchEngine, writer });
    if (!getTool.execute) {
      throw new Error('Expected get document tool to define execute');
    }

    // act
    const result = await getTool.execute({ id: '/missing' }, toolOptions);

    // assert
    expect(result).toEqual({
      success: false,
      message: 'Document with ID "/missing" not found',
      document: null,
    });
  });

  it('handles get document errors', async () => {
    // arrange
    const searchEngine = createSearchEngine({
      getDocument: vi.fn<SearchEngine['getDocument']>(() => {
        throw new Error('fail');
      }),
    });
    const writer = createWriter();

    const getTool = createGetDocumentTool({ searchEngine, writer });
    if (!getTool.execute) {
      throw new Error('Expected get document tool to define execute');
    }

    // act
    const result = await getTool.execute({ id: '/doc' }, toolOptions);

    // assert
    expect(result).toEqual({ success: false, message: 'Failed to get document', document: null });
  });
});

describe('createListDocumentsTool', () => {
  it('lists documents and writes sources', async () => {
    // arrange
    const searchEngine = createSearchEngine({
      getAllDocuments: vi.fn<SearchEngine['getAllDocuments']>().mockReturnValue([
        {
          id: '/a',
          path: '/a',
          content: {
            title: 'A',
            description: 'Desc A',
            content: 'Content A',
          },
        },
        {
          id: '/b',
          path: '/b',
          content: {
            title: 'B',
            description: 'Desc B',
            content: 'Content B',
          },
        },
      ]),
    });
    const writer = createWriter();

    const listTool = createListDocumentsTool({ searchEngine, writer });
    if (!listTool.execute) {
      throw new Error('Expected list documents tool to define execute');
    }

    // act
    const result = await listTool.execute({}, toolOptions);

    // assert
    expect(writer.write).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      success: true,
      message: 'Found 2 page(s) in total',
      count: 2,
      documents: [
        { id: '/a', path: '/a', title: 'A', description: 'Desc A' },
        { id: '/b', path: '/b', title: 'B', description: 'Desc B' },
      ],
    });
  });

  it('handles list documents errors', async () => {
    // arrange
    const searchEngine = createSearchEngine({
      getAllDocuments: vi.fn<SearchEngine['getAllDocuments']>(() => {
        throw new Error('fail');
      }),
    });
    const writer = createWriter();

    const listTool = createListDocumentsTool({ searchEngine, writer });
    if (!listTool.execute) {
      throw new Error('Expected list documents tool to define execute');
    }

    // act
    const result = await listTool.execute({}, toolOptions);

    // assert
    expect(result).toEqual({ success: false, message: 'Failed to list documents', count: 0, documents: [] });
  });
});

describe('createSearchTools', () => {
  it('returns tool set with search, getDocument, and listDocuments', () => {
    // arrange
    const searchEngine = createSearchEngine();
    const writer = createWriter();

    // act
    const tools = createSearchTools({ searchEngine, writer });

    // assert
    expect(tools).toEqual({
      search: expect.any(Object),
      getDocument: expect.any(Object),
      listDocuments: expect.any(Object),
    });
  });
});
