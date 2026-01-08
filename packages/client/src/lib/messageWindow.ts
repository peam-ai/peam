import { UIMessage } from 'ai';

/**
 * Default maximum number of messages before triggering summarization
 */
export const MAX_MESSAGES = 10;

/**
 * Get messages to send to backend after the last summarized message.
 * If lastSummarizedMessageId is not found (corrupted DB), send last maxMessages as recovery.
 */
export function getRecentMessages(
  messages: UIMessage[],
  lastSummarizedMessageId: string | undefined,
  maxMessages: number = MAX_MESSAGES
): UIMessage[] {
  if (!lastSummarizedMessageId) {
    // No summary yet - send last maxMessages messages
    return messages.slice(-maxMessages);
  }

  const lastSummarizedIndex = messages.findIndex((m) => m.id === lastSummarizedMessageId);

  if (lastSummarizedIndex === -1) {
    return messages.slice(-maxMessages);
  }

  const recentMessages = messages.slice(lastSummarizedIndex + 1);
  return recentMessages.slice(-maxMessages);
}

/**
 * Determine if we should trigger summarization.
 */
export function shouldSummarize(
  messages: UIMessage[],
  lastSummarizedMessageId: string | undefined,
  maxMessages: number = MAX_MESSAGES
): boolean {
  if (!lastSummarizedMessageId) {
    return messages.length >= maxMessages;
  }

  const lastSummarizedIndex = messages.findIndex((m) => m.id === lastSummarizedMessageId);

  if (lastSummarizedIndex === -1) {
    return messages.length >= maxMessages;
  }

  const messagesSinceLastSummary = messages.length - lastSummarizedIndex - 1;
  return messagesSinceLastSummary >= maxMessages;
}

/**
 * Get all messages to include in the summarization.
 */
export function getMessagesToSummarize(
  messages: UIMessage[],
  lastSummarizedMessageId: string | undefined,
  maxMessages: number = MAX_MESSAGES
): UIMessage[] {
  if (!lastSummarizedMessageId) {
    return messages.slice(-maxMessages);
  }

  const lastSummarizedIndex = messages.findIndex((m) => m.id === lastSummarizedMessageId);

  if (lastSummarizedIndex === -1) {
    return messages.slice(-maxMessages);
  }

  return messages.slice(lastSummarizedIndex + 1);
}
