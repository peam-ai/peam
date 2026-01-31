import type { LanguageModel, UIMessage } from 'ai';

/*
 * Represents a summary of a conversation.
 */
export interface Summary {
  text: string;
  lastSummarizedMessageId: string;
}

export interface SummarizationOptions {
  /**
   * The language model to use for summarization.
   */
  model: LanguageModel;

  /**
   * The maximum number of messages to retain before summarization is triggered.
   * @default 10
   */
  maxMessages?: number;
}

export interface SummarizerInput {
  messages: UIMessage[];
  previousSummary?: Summary;
}

export interface SummaryUpdate {
  text: string;
  lastSummarizedMessageId: string;
}

export interface ConversationSummarizer {
  summarize(input: SummarizerInput): Promise<SummaryUpdate | null>;
}
