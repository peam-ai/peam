import { LanguageModel, UIMessage, convertToModelMessages, createUIMessageStream, streamText } from 'ai';
import { SUMMARIZATION_SYSTEM_PROMPT } from './prompts/summarize';

export interface StreamSummarizeOptions {
  model: LanguageModel;
  messages: UIMessage[];
  previousSummary?: string;
}

/**
 * Creates a streaming summary of messages.
 */
export function streamSummarize({ model, messages, previousSummary }: StreamSummarizeOptions) {
  const stream = createUIMessageStream({
    originalMessages: messages,
    execute: async ({ writer }) => {
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

      const summaryPrompt = previousSummary
        ? `Previous Summary:\n${previousSummary}\n\nNew Conversation:\n${conversationText}\n\nCreate an updated summary that incorporates both the previous summary and the new conversation.`
        : `Conversation:\n${conversationText}\n\nCreate a summary of this conversation.`;

      const result = streamText({
        model,
        system: SUMMARIZATION_SYSTEM_PROMPT,
        prompt: summaryPrompt,
        temperature: 0,
      });

      writer.merge(result.toUIMessageStream());
    },
  });

  return stream;
}
