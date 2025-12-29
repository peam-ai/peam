import { SearchEngine } from '@peam/search';
import { 
  LanguageModel, 
  UIMessage,
  stepCountIs, 
  streamText, 
  createUIMessageStream,
  convertToModelMessages,
} from 'ai';
import { generateSearchSystemPrompt } from './prompts/search';
import { createSearchTools } from './tools';

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
  const stream = createUIMessageStream({
    originalMessages: messages,
    execute: async ({ writer }) => {
      const modelMessages = await convertToModelMessages(messages);
      
      const result = streamText({
        model,
        system: generateSearchSystemPrompt({ currentPage }),
        messages: modelMessages,
        stopWhen: stepCountIs(20),
        tools: createSearchTools( { searchEngine, writer }),
        onStepFinish,
      });

      writer.merge(result.toUIMessageStream());
    },
  });

  return stream;
};
