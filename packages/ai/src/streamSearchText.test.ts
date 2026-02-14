import { describe, expect, it, vi } from 'vitest';
import { streamSearchText } from './streamSearchText';

const convertToModelMessages = vi.hoisted(() => vi.fn());
const createUIMessageStream = vi.hoisted(() => vi.fn());
const streamText = vi.hoisted(() => vi.fn());
const stepCountIs = vi.hoisted(() => vi.fn());
const generateSearchSystemPrompt = vi.hoisted(() => vi.fn());
const createSearchTools = vi.hoisted(() => vi.fn());

vi.mock('ai', () => ({
  convertToModelMessages: (...args: unknown[]) => convertToModelMessages(...args),
  createUIMessageStream: (...args: unknown[]) => createUIMessageStream(...args),
  streamText: (...args: unknown[]) => streamText(...args),
  stepCountIs: (...args: unknown[]) => stepCountIs(...args),
}));

vi.mock('./prompts/search', () => ({
  generateSearchSystemPrompt: (...args: unknown[]) => generateSearchSystemPrompt(...args),
}));

vi.mock('./tools', () => ({
  createSearchTools: (...args: unknown[]) => createSearchTools(...args),
}));

describe('streamSearchText', () => {
  it('returns early when there are no messages', async () => {
    // arrange
    const writer = { merge: vi.fn() };

    convertToModelMessages.mockResolvedValue([]);
    createUIMessageStream.mockImplementation(
      ({ execute }: { execute: (args: { writer: unknown }) => Promise<void> }) => {
        return { execute };
      }
    );

    // act
    const stream = streamSearchText({
      model: {} as never,
      searchEngine: {} as never,
      messages: [],
    }) as unknown as { execute: (args: { writer: unknown }) => Promise<void> };

    await stream.execute({ writer });

    // assert
    expect(streamText).not.toHaveBeenCalled();
  });

  it('prepends summary and page context and merges stream', async () => {
    // arrange
    const writer = { merge: vi.fn() };
    const uiStream = { toUIMessageStream: vi.fn().mockReturnValue('ui-stream') };

    convertToModelMessages.mockResolvedValue([{ role: 'user', content: 'Hello' }]);
    generateSearchSystemPrompt.mockReturnValue('system');
    stepCountIs.mockReturnValue('stop');
    createSearchTools.mockReturnValue({ search: 'tool' });
    streamText.mockReturnValue(uiStream);
    createUIMessageStream.mockImplementation(
      ({ execute }: { execute: (args: { writer: unknown }) => Promise<void> }) => {
        return { execute };
      }
    );

    // act
    const stream = streamSearchText({
      model: {} as never,
      searchEngine: {} as never,
      messages: [{ id: '1' } as never],
      currentPage: { origin: 'https://www.example.com', path: '/docs', title: 'Docs' },
      summary: 'Previous summary',
    }) as unknown as { execute: (args: { writer: unknown }) => Promise<void> };

    await stream.execute({ writer });

    // assert
    expect(generateSearchSystemPrompt).toHaveBeenCalledWith({
      siteName: 'example.com',
      siteDomain: 'https://www.example.com',
    });
    expect(streamText).toHaveBeenCalledWith({
      model: {} as never,
      system: 'system',
      messages: [
        { role: 'system', content: 'Context summary of previous conversation: Previous summary' },
        { role: 'system', content: 'The user is currently viewing the page at /docs with title "Docs".' },
        { role: 'user', content: 'Hello' },
      ],
      stopWhen: 'stop',
      tools: { search: 'tool' },
      temperature: 0.2,
    });
    expect(writer.merge).toHaveBeenCalledWith('ui-stream');
  });
});
