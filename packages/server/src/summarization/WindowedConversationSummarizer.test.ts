import { summarizeMessages } from '@peam-ai/ai';
import type { LanguageModel, UIMessage } from 'ai';
import { describe, expect, it, vi } from 'vitest';
import { WindowedConversationSummarizer } from './WindowedConversationSummarizer';

vi.mock('@peam-ai/ai', () => ({
  summarizeMessages: vi.fn(),
}));

const mockSummarizeMessages = vi.mocked(summarizeMessages);

const createMessage = (id: string, text = `msg-${id}`): UIMessage => ({
  id,
  role: 'user',
  parts: [{ type: 'text', text }],
});

describe('WindowedConversationSummarizer', () => {
  it('returns null when below the max message threshold', async () => {
    // Arrange
    const model = {} as LanguageModel;
    const summarizer = new WindowedConversationSummarizer({ model, maxMessages: 3 });

    // Act
    const result = await summarizer.summarize({
      messages: [createMessage('1'), createMessage('2')],
    });

    // Assert
    expect(result).toBeNull();
    expect(mockSummarizeMessages).not.toHaveBeenCalled();
  });

  it('summarizes only messages since the last summary', async () => {
    // Arrange
    const model = {} as LanguageModel;
    const summarizer = new WindowedConversationSummarizer({ model, maxMessages: 2 });

    mockSummarizeMessages.mockResolvedValue('summary-text');

    const messages = [createMessage('1'), createMessage('2'), createMessage('3'), createMessage('4')];

    // Act
    const result = await summarizer.summarize({
      messages,
      previousSummary: { text: 'previous', lastSummarizedMessageId: '2' },
    });

    // Assert
    expect(mockSummarizeMessages).toHaveBeenCalledTimes(1);
    expect(mockSummarizeMessages).toHaveBeenCalledWith({
      model,
      messages: [messages[2], messages[3]],
      previousSummary: 'previous',
    });

    expect(result).toEqual({
      text: 'summary-text',
      lastSummarizedMessageId: '4',
    });
  });
});
