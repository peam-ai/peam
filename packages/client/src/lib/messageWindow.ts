import { UIMessage } from 'ai';

/**
 * Maximum number of messages before triggering summarization
 */
export const MAX_MESSAGES = 5;

/**
 * Get messages to send to backend after the last summarized message.
 * If lastSummarizedMessageId is not found (corrupted DB), send last MAX_MESSAGES as recovery.
 */
export function getRecentMessages(messages: UIMessage[], lastSummarizedMessageId: string | undefined): UIMessage[] {
  if (!lastSummarizedMessageId) {
    // No summary yet - send last MAX_MESSAGES messages
    return messages.slice(-MAX_MESSAGES);
  }

  const lastSummarizedIndex = messages.findIndex((m) => m.id === lastSummarizedMessageId);

  if (lastSummarizedIndex === -1) {
    return messages.slice(-MAX_MESSAGES);
  }

  const recentMessages = messages.slice(lastSummarizedIndex + 1);
  return recentMessages.slice(-MAX_MESSAGES);
}

/**
 * Determine if we should trigger summarization.
 */
export function shouldSummarize(messages: UIMessage[], lastSummarizedMessageId: string | undefined): boolean {
  if (!lastSummarizedMessageId) {
    return messages.length >= MAX_MESSAGES;
  }

  const lastSummarizedIndex = messages.findIndex((m) => m.id === lastSummarizedMessageId);

  if (lastSummarizedIndex === -1) {
    return messages.length >= MAX_MESSAGES;
  }

  const messagesSinceLastSummary = messages.length - lastSummarizedIndex - 1;
  return messagesSinceLastSummary >= MAX_MESSAGES;
}

/**
 * Get all messages to include in the summarization.
 */
export function getMessagesToSummarize(
  messages: UIMessage[],
  lastSummarizedMessageId: string | undefined
): UIMessage[] {
  if (!lastSummarizedMessageId) {
    return messages.slice(-MAX_MESSAGES);
  }

  const lastSummarizedIndex = messages.findIndex((m) => m.id === lastSummarizedMessageId);

  if (lastSummarizedIndex === -1) {
    return messages.slice(-MAX_MESSAGES);
  }

  return messages.slice(lastSummarizedIndex + 1);
}
