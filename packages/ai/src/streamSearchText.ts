import { SearchEngine } from '@peam/search';
import { LanguageModel, UIMessage, convertToModelMessages, createUIMessageStream, stepCountIs, streamText } from 'ai';
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
  onStepFinish?: (step: any) => void;
};

export const streamSearchText = function ({
  model,
  searchEngine,
  messages,
  currentPage,
  onStepFinish,
}: SearchStreamTextProps) {
  const siteName = currentPage?.origin ? normalizeDomain(currentPage.origin) : 'unknown';
  const siteDomain = currentPage?.origin || 'unknown';

  const stream = createUIMessageStream({
    originalMessages: messages,
    execute: async ({ writer }) => {
      let modelMessages = await convertToModelMessages(messages);

      if (currentPage?.path && modelMessages.length > 0) {
        const lastMessage = modelMessages[modelMessages.length - 1];
        if (lastMessage.role === 'user') {
          const userQuestion =
            typeof lastMessage.content === 'string'
              ? lastMessage.content
              : Array.isArray(lastMessage.content)
                ? lastMessage.content
                    .filter((part) => part.type === 'text')
                    .map((part) => part.text)
                    .join('\n')
                : '';

          const contextText = `User is currently viewing the page at ${currentPage.path}${currentPage.title?.trim() ? ` with title "${currentPage.title}"` : ''}]

User question: ${userQuestion}`;

          modelMessages = [
            ...modelMessages.slice(0, -1),
            {
              ...lastMessage,
              content: contextText,
            },
          ];
        }
      }

      const result = streamText({
        model,
        system: generateSearchSystemPrompt({ siteName, siteDomain }),
        messages: modelMessages,
        stopWhen: stepCountIs(20),
        tools: createSearchTools({ searchEngine, writer }),
        onStepFinish,
      });

      writer.merge(result.toUIMessageStream());
    },
  });

  return stream;
};
