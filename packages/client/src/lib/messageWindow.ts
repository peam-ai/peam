import { UIMessage } from 'ai';

/**
 * Get messages to send to backend after the last summarized message.
 * If lastSummarizedMessageId is not found (corrupted DB), send last fallbackMaxMessages as recovery.
 * @param messages All messages in the conversation
 * @param lastSummarizedMessageId ID of the last summarized message
 * @param fallbackMaxMessages Number of messages to send if lastSummarizedMessageId is not found
 */
export function getRecentMessages(
  messages: UIMessage[],
  lastSummarizedMessageId: string | undefined,
  fallbackMaxMessages: number = 50
): UIMessage[] {
  if (!lastSummarizedMessageId) {
    // No summary yet, send all messages
    return messages;
  }

  const lastSummarizedIndex = messages.findIndex((m) => m.id === lastSummarizedMessageId);

  // If last summarized message ID is not found, return last fallbackMaxMessages messages
  if (lastSummarizedIndex === -1) {
    return messages.slice(-fallbackMaxMessages);
  }

  return messages.slice(lastSummarizedIndex + 1);
}
