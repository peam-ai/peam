import { describe, expect, it, vi } from 'vitest';
import { SUMMARIZATION_SYSTEM_PROMPT } from './prompts/summarize';
import { summarizeMessages } from './summarizer';

const generateText = vi.hoisted(() => vi.fn());
const convertToModelMessages = vi.hoisted(() => vi.fn());

vi.mock('ai', () => ({
  generateText: (...args: unknown[]) => generateText(...args),
  convertToModelMessages: (...args: unknown[]) => convertToModelMessages(...args),
}));

describe('summarizeMessages', () => {
  it('builds a prompt without previous summary and trims output', async () => {
    // arrange
    convertToModelMessages.mockResolvedValue([
      { role: 'user', content: 'Hello' },
      {
        role: 'assistant',
        content: [
          { type: 'text', text: 'Hi there' },
          { type: 'tool-call', toolName: 'search' },
        ],
      },
    ]);

    generateText.mockResolvedValue({ text: '  summary text  ' });

    // act
    const result = await summarizeMessages({
      model: {} as never,
      messages: [{ id: '1' } as never],
    });

    // assert
    expect(generateText).toHaveBeenCalledWith({
      model: {} as never,
      system: SUMMARIZATION_SYSTEM_PROMPT,
      prompt: expect.stringContaining('Conversation:\nUser: Hello\n\nAssistant: Hi there'),
      temperature: 0,
    });
    expect(result).toBe('summary text');
  });

  it('includes previous summary when provided', async () => {
    // arrange
    convertToModelMessages.mockResolvedValue([{ role: 'user', content: 'New question' }]);
    generateText.mockResolvedValue({ text: 'summary' });

    // act
    await summarizeMessages({
      model: {} as never,
      messages: [{ id: '1' } as never],
      previousSummary: 'Older summary',
    });

    // assert
    expect(generateText).toHaveBeenCalledWith({
      model: {} as never,
      system: SUMMARIZATION_SYSTEM_PROMPT,
      prompt: expect.stringContaining('Previous Summary:\nOlder summary'),
      temperature: 0,
    });
  });
});
