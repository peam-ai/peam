import { loggers } from '@peam-ai/logger';
import { SearchEngine } from '@peam-ai/search';
import { tool, ToolSet, type UIMessageStreamWriter } from 'ai';
import { z } from 'zod';

const log = loggers.ai;

export function createSearchTool({
  searchEngine,
  writer,
}: {
  searchEngine: SearchEngine;
  limit?: number;
  writer: UIMessageStreamWriter;
}) {
  return tool({
    description:
      'Search the website content for information. Use this tool to find relevant pages and content based on user queries. Returns matching documents with their titles, descriptions, and text content.',
    inputSchema: z.object({
      query: z.string().describe('The search query to find relevant content on the website'),
    }),
    execute: async ({ query }) => {
      log.debug('Searching for:', query);

      try {
        const results = await searchEngine.search(query);

        log.debug('Found', results.length, 'results');

        if (results.length === 0) {
          return {
            success: true,
            message: 'No matching content found.',
            results: [],
          };
        }

        for (const doc of results.values()) {
          writer.write({
            type: 'source-url',
            sourceId: doc.id,
            url: doc.path,
            title: doc.content.title,
          });
        }

        const formattedResults = results.map((doc) => ({
          id: doc.id,
          title: doc.content.title,
          url: doc.path,
        }));

        return {
          success: true,
          message: `Found ${results.length} relevant page(s)`,
          results: formattedResults,
        };
      } catch (error) {
        log.error('Search tool error:', error);
        return {
          success: false,
          message: 'Search failed',
          results: [],
        };
      }
    },
  });
}

export function createGetDocumentTool({
  searchEngine,
  writer,
}: {
  searchEngine: SearchEngine;
  writer: UIMessageStreamWriter;
}) {
  return tool({
    description:
      'Get the full content of a specific page by its ID (path). The ID must be the EXACT path returned from search results (e.g., "/contact", "/pricing", "/about"). Do not modify or shorten the path.',
    inputSchema: z.object({
      id: z.string().describe('The complete document path/ID to retrieve (e.g., "/contact", "/about")'),
    }),
    execute: async ({ id }: { id: string }) => {
      log.debug('Getting document:', id);

      try {
        const doc = searchEngine.getDocument(id);

        if (!doc) {
          log.warn('Document with ID not found:', id);
          return {
            success: false,
            message: `Document with ID "${id}" not found`,
            document: null,
          };
        }

        writer.write({
          type: 'source-url',
          sourceId: doc.id,
          url: doc.path,
          title: doc.content.title,
        });

        return {
          success: true,
          message: 'Document retrieved successfully',
          document: {
            id: doc.id,
            path: doc.path,
            title: doc.content.title,
            language: doc.content.language,
            content: doc.content.content,
          },
        };
      } catch (error) {
        log.error('Get document tool error:', error);
        return {
          success: false,
          message: 'Failed to get document',
          document: null,
        };
      }
    },
  });
}

export function createListDocumentsTool({
  searchEngine,
  writer,
}: {
  searchEngine: SearchEngine;
  writer: UIMessageStreamWriter;
}) {
  return tool({
    description:
      'List all available web pages in the knowledge base. Use this to get an overview of what pages are available.',
    inputSchema: z.object(),
    execute: async () => {
      log.debug('Listing all documents');

      try {
        const documents = searchEngine.getAllDocuments();

        const summary = documents.map((doc) => ({
          id: doc.id,
          path: doc.path,
          title: doc.content.title,
          description: doc.content.description,
        }));

        for (const doc of summary) {
          writer.write({
            type: 'source-url',
            sourceId: doc.id,
            url: doc.path,
            title: doc.title,
          });
        }

        return {
          success: true,
          message: `Found ${documents.length} page(s) in total`,
          count: documents.length,
          documents: summary,
        };
      } catch (error) {
        log.error('List documents tool error:', error);
        return {
          success: false,
          message: 'Failed to list documents',
          count: 0,
          documents: [],
        };
      }
    },
  });
}

export const createSearchTools = ({
  searchEngine,
  writer,
}: {
  searchEngine: SearchEngine;
  writer: UIMessageStreamWriter;
}) => {
  return {
    search: createSearchTool({ searchEngine, writer }),
    getDocument: createGetDocumentTool({ searchEngine, writer }),
    listDocuments: createListDocumentsTool({ searchEngine, writer }),
  } satisfies ToolSet;
};
