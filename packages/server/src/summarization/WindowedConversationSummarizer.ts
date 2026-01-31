import { summarizeMessages } from '@peam-ai/ai';
import type { UIMessage } from 'ai';
import type {
  ConversationSummarizer,
  SummarizationOptions,
  SummarizerInput,
  Summary,
  SummaryUpdate,
} from './ConversationSummarizer';

export class WindowedConversationSummarizer implements ConversationSummarizer {
  private readonly options: Required<SummarizationOptions>;

  constructor(options: SummarizationOptions) {
    this.options = {
      model: options.model,
      maxMessages: options.maxMessages ?? 10,
    };
  }

  async summarize({ messages, previousSummary }: SummarizerInput): Promise<SummaryUpdate | null> {
    if (!this.shouldSummarize(messages, previousSummary)) {
      return null;
    }

    const messagesToSummarize = this.getMessagesToSummarize(messages, previousSummary);

    if (messagesToSummarize.length === 0) {
      return null;
    }

    const updatedSummaryText = await summarizeMessages({
      model: this.options.model,
      messages: messagesToSummarize,
      previousSummary: previousSummary?.text,
    });

    const lastMessageId = messagesToSummarize[messagesToSummarize.length - 1]?.id;

    if (!updatedSummaryText || !lastMessageId) {
      return null;
    }

    return {
      text: updatedSummaryText,
      lastSummarizedMessageId: lastMessageId,
    };
  }

  private shouldSummarize(messages: UIMessage[], previousSummary?: Summary): boolean {
    const lastSummarizedMessageId = previousSummary?.lastSummarizedMessageId;
    const maxMessages = this.options.maxMessages;

    if (!lastSummarizedMessageId) {
      return messages.length >= maxMessages;
    }

    const lastSummarizedIndex = messages.findIndex((message) => message.id === lastSummarizedMessageId);

    if (lastSummarizedIndex === -1) {
      return messages.length >= maxMessages;
    }

    const messagesSinceLastSummary = messages.length - lastSummarizedIndex - 1;
    return messagesSinceLastSummary >= maxMessages;
  }

  private getMessagesToSummarize(messages: UIMessage[], previousSummary?: Summary): UIMessage[] {
    const lastSummarizedMessageId = previousSummary?.lastSummarizedMessageId;
    const maxMessages = this.options.maxMessages;

    if (!lastSummarizedMessageId) {
      return messages.slice(-maxMessages);
    }

    const lastSummarizedIndex = messages.findIndex((message) => message.id === lastSummarizedMessageId);

    if (lastSummarizedIndex === -1) {
      return messages.slice(-maxMessages);
    }

    return messages.slice(lastSummarizedIndex + 1);
  }
}
