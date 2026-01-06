import type { UIMessage } from '@ai-sdk/react';

/**
 * Maximum number of recent messages to send to the backend.
 * This includes both user and assistant messages.
 *
 * 10 messages = 5 turns of conversation
 */
const MAX_RECENT_MESSAGES = 10;

/**
 * Number of new messages required before triggering another summarization.
 * After summarizing, we wait until this many new messages accumulate.
 *
 * 20 messages = 10 turns of conversation before summarizing
 */
const NEW_MESSAGES_THRESHOLD = 20;

/**
 * Gets the recent messages to send to the backend.
 */
export function getRecentMessages(messages: UIMessage[]): UIMessage[] {
  console.log('>> getRecentMessages called with %d messages', messages.length);
  if (messages.length <= MAX_RECENT_MESSAGES) {
    return messages;
  }
  return messages.slice(-MAX_RECENT_MESSAGES);
}

/**
 * Gets only the new messages that haven't been summarized yet.
 * These are the messages after the last summarized message.
 *
 * If the last summarized message ID is not found (corrupted state),
 * it returns messages up to the current window to recover and fix the state.
 */
export function getMessagesToSummarize(messages: UIMessage[], lastSummarizedId?: string): UIMessage[] {
  if (!lastSummarizedId) {
    return messages;
  }

  const lastSummarizedIndex = messages.findIndex((m) => m.id === lastSummarizedId);

  // If we can't find the last summarized message, the DB is corrupted or messages were cleared
  // Recover by summarizing messages up to the recent window boundary
  if (lastSummarizedIndex < 0) {
    // If we have more messages than the recent window, summarize everything except the recent ones
    if (messages.length > MAX_RECENT_MESSAGES + NEW_MESSAGES_THRESHOLD) {
      const endIndex = messages.length - MAX_RECENT_MESSAGES;
      return messages.slice(0, endIndex);
    }

    // Otherwise return empty to wait for more messages
    return [];
  }

  // else return all messages after the last summarized one
  return messages.slice(lastSummarizedIndex + 1);
}

/**
 * Checks if summarization should be triggered.
 */
export function shouldSummarize(messages: UIMessage[], lastSummarizedId?: string): boolean {
  if (!messages || messages.length === 0) {
    return false;
  }

  const newMessages = getMessagesToSummarize(messages, lastSummarizedId);
  return newMessages.length >= NEW_MESSAGES_THRESHOLD;
}
