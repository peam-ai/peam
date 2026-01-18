import { SearchEngine } from '@peam-ai/search';
import {
  LanguageModel,
  ModelMessage,
  UIMessage,
  convertToModelMessages,
  createUIMessageStream,
  stepCountIs,
  streamText,
} from 'ai';
import { generateSearchSystemPrompt } from './prompts/search';
import { createSearchTools } from './tools';
import { normalizeDomain } from './utils/normalizeDomain';

export type CurrentPageMetadata = {
  origin: string;
  path: string;
  title?: string;
};

export type SearchStreamTextProps = {
  searchEngine: SearchEngine;
  model: LanguageModel;
  messages: UIMessage[];
  currentPage?: CurrentPageMetadata;
  summary?: string;
};

/**
 * Streams a response using the search engine to retrieve relevant information.
 */
export const streamSearchText = function ({
  model,
  searchEngine,
  messages,
  currentPage,
  summary,
}: SearchStreamTextProps) {
  const siteName = currentPage?.origin ? normalizeDomain(currentPage.origin) : 'unknown';
  const siteDomain = currentPage?.origin || 'unknown';

  const stream = createUIMessageStream({
    originalMessages: messages,
    execute: async ({ writer }) => {
      let modelMessages = await convertToModelMessages(messages);

      if (modelMessages.length === 0) {
        return;
      }

      if (currentPage?.path) {
        const currentPageContextMessage: ModelMessage = {
          role: 'system',
          content: `The user is currently viewing the page at ${currentPage.path}${
            currentPage.title?.trim() ? ` with title "${currentPage.title}"` : ''
          }.`,
        };
        modelMessages = [currentPageContextMessage, ...modelMessages];
      }

      if (summary) {
        const summaryMessage: ModelMessage = {
          role: 'system',
          content: `Context summary of previous conversation: ${summary}`,
        };
        modelMessages = [summaryMessage, ...modelMessages];
      }

      const result = streamText({
        model,
        system: generateSearchSystemPrompt({ siteName, siteDomain }),
        messages: modelMessages,
        stopWhen: stepCountIs(20),
        tools: createSearchTools({ searchEngine, writer }),
        temperature: 0.2,
      });

      writer.merge(result.toUIMessageStream());
    },
  });

  return stream;
};
