import { SearchEngine } from '@peam/search';
import { tool, ToolSet, type UIMessageStreamWriter } from 'ai';
import { z } from 'zod';
import { loggers } from '@peam/logger';

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
      log(`Searching for: "${query}"`);

      try {
        const results = await searchEngine.search(query);

        log(`Found ${results.length} results`);

        if (results.length === 0) {
          return {
            success: true,
            message: 'No matching content found.',
            results: [],
          };
        }

        for (const [index, doc] of results.entries()) {
          writer.write({
            type: 'source-url',
            sourceId: `search-${index}-${doc.id}`,
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
        log(`Search tool error: ${error}`);
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
      log(`Getting document: ${id}`);

      try {
        const doc = searchEngine.getDocument(id);

        if (!doc) {
          log(`Document with ID "${id}" not found`);
          return {
            success: false,
            message: `Document with ID "${id}" not found`,
            document: null,
          };
        }

        writer.write({
          type: 'source-url',
          sourceId: `doc-${doc.id}`,
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
            description: doc.content.description,
            author: doc.content.author,
            keywords: doc.content.keywords,
            textContent: doc.content.textContent,
            content: doc.content.content,
            language: doc.content.language,
            publishedTime: doc.content.publishedTime,
            headings: doc.content.headings,
            internalLinks: doc.content.internalLinks,
            externalLinks: doc.content.externalLinks,
          },
        };
      } catch (error) {
        log(`Get document tool error: ${error}`);
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
      log('Listing all documents');

      try {
        const documents = searchEngine.getAllDocuments();

        const summary = documents.map((doc) => ({
          id: doc.id,
          path: doc.path,
          title: doc.content.title,
          description: doc.content.description,
        }));

        for (const [index, doc] of summary.entries()) {
          writer.write({
            type: 'source-url',
            sourceId: `list-${index}-${doc.id}`,
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
        log(`List documents tool error: ${error}`);
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
  writer
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

