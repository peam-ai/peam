import { LanguageModel, UIMessage, convertToModelMessages, generateText } from 'ai';
import { SUMMARIZATION_SYSTEM_PROMPT } from './prompts/summarize';

export interface SummarizeMessagesOptions {
  model: LanguageModel;
  messages: UIMessage[];
  previousSummary?: string;
}

const buildSummaryPrompt = async ({ messages, previousSummary }: Omit<SummarizeMessagesOptions, 'model'>) => {
  const modelMessages = await convertToModelMessages(messages);

  const conversationText = modelMessages
    .map((msg) => {
      const role = msg.role === 'user' ? 'User' : 'Assistant';
      const content =
        typeof msg.content === 'string'
          ? msg.content
          : Array.isArray(msg.content)
            ? msg.content
                .filter((part) => part.type === 'text')
                .map((part) => part.text)
                .join('\n')
            : '';
      return `${role}: ${content}`;
    })
    .join('\n\n');

  return previousSummary
    ? `Previous Summary:\n${previousSummary}\n\nNew Conversation:\n${conversationText}\n\nCreate an updated summary that incorporates both the previous summary and the new conversation.`
    : `Conversation:\n${conversationText}\n\nCreate a summary of this conversation.`;
};

/**
 * Generates a summary text for the provided messages.
 */
export async function summarizeMessages({ model, messages, previousSummary }: SummarizeMessagesOptions) {
  const summaryPrompt = await buildSummaryPrompt({ messages, previousSummary });

  const { text } = await generateText({
    model,
    system: SUMMARIZATION_SYSTEM_PROMPT,
    prompt: summaryPrompt,
    temperature: 0,
  });

  return text.trim();
}
