import { streamText, LanguageModel, ModelMessage, stepCountIs } from 'ai';
import {
  createSearchTool,
  createGetDocumentTool,
  createListDocumentsTool,
} from './tools';
import {generateSearchSystemPrompt} from './prompts/search';
import { SearchEngine } from '@peam/search';

type AsyncIterableStream<T> = AsyncIterable<T> & ReadableStream<T>;

type SearchStreamTextProps = {
  prompt: string;
  searchEngine: SearchEngine;
  model: LanguageModel;
  messages: ModelMessage[];
  currentPage: string,
  siteName: string,
  siteDomain: string,
  onStepFinish: (step: any) => void;
};

export const streamSearchText = function ({
    model,
    prompt,
    searchEngine,
    messages,
    currentPage,
    siteName,
    siteDomain,
    onStepFinish,
}: SearchStreamTextProps): AsyncIterableStream<string> {

    const tools = {
      search: createSearchTool({ searchEngine }),
      getDocument: createGetDocumentTool({ searchEngine }),
      listDocuments: createListDocumentsTool({ searchEngine }),
    };

    messages.push({
      role: 'user',
      content: `User query: ${prompt}`,
    });

    const { textStream } = streamText({
      model,
      system: generateSearchSystemPrompt({ currentPage, siteName, siteDomain }),
      messages,
      tools,
       providerOptions: {
          openai: {
            textVerbosity: 'medium',
            serviceTier: 'priority',
          },
        },
      stopWhen: stepCountIs(10),
      onStepFinish
    });

    return textStream;
};
