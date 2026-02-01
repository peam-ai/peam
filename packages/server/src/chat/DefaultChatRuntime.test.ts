import { describe, expect, it, vi } from 'vitest';
import { DefaultChatRuntime } from './DefaultChatRuntime';

vi.mock('ai', () => ({
  createUIMessageStream: vi.fn(() => new ReadableStream()),
  createUIMessageStreamResponse: vi.fn(() => new Response(null, { status: 200 })),
}));

type RuntimeInternals = {
  resolveExecutionContext: () => Promise<{ searchEngine: unknown }>;
  stream: () => ReadableStream;
};

const createMessage = (id: string, text = `msg-${id}`) => ({
  id,
  role: 'user',
  parts: [{ type: 'text', text }],
});

const createJsonRequest = (body: unknown, method = 'POST') =>
  new Request('http://localhost/api/peam', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

describe('DefaultChatRuntime', () => {
  it('returns 405 for non-POST requests', async () => {
    // Arrange
    const runtime = new DefaultChatRuntime();

    // Act
    const response = await runtime.handler(new Request('http://localhost/api/peam', { method: 'GET' }));

    // Assert
    expect(response.status).toBe(405);
  });

  it('returns 400 when no messages are provided', async () => {
    // Arrange
    const runtime = new DefaultChatRuntime();

    // Act
    const response = await runtime.handler(createJsonRequest({ messages: [] }));

    // Assert
    expect(response.status).toBe(400);
  });

  it('returns 400 when a message exceeds max length', async () => {
    // Arrange
    const runtime = new DefaultChatRuntime({ maxMessageLength: 5 });
    const messages = [createMessage('1', 'toolong')];

    // Act
    const response = await runtime.handler(createJsonRequest({ messages }));

    // Assert
    expect(response.status).toBe(400);
  });

  it('returns 200 for a valid request', async () => {
    // Arrange
    const runtime = new DefaultChatRuntime({ summarization: false });
    const messages = [createMessage('1', 'hello')];
    const runtimeInternals = runtime as unknown as RuntimeInternals;
    runtimeInternals.resolveExecutionContext = vi.fn().mockResolvedValue({
      searchEngine: {},
    });

    vi.spyOn(runtimeInternals, 'stream').mockReturnValue(new ReadableStream());

    // Act
    const response = await runtime.handler(createJsonRequest({ messages }));

    // Assert
    expect(response.status).toBe(200);
  });

  it('passes currentPage to stream when available', async () => {
    // Arrange
    const runtime = new DefaultChatRuntime({ summarization: false });
    const messages = [
      {
        ...createMessage('1', 'hello'),
        metadata: {
          currentPage: {
            title: 'Docs',
            origin: 'https://example.com',
            path: '/docs',
          },
        },
      },
    ];
    const runtimeInternals = runtime as unknown as RuntimeInternals;
    runtimeInternals.resolveExecutionContext = vi.fn().mockResolvedValue({
      searchEngine: {},
    });
    const streamSpy = vi.spyOn(runtimeInternals, 'stream').mockReturnValue(new ReadableStream());

    // Act
    await runtime.handler(createJsonRequest({ messages }));

    // Assert
    expect(streamSpy).toHaveBeenCalled();
    const streamCalls = (streamSpy.mock.calls as unknown[][]) ?? [];
    const streamInput = streamCalls[0]?.[0] as { currentPage?: unknown } | undefined;
    expect(streamInput?.currentPage).toEqual({
      title: 'Docs',
      origin: 'https://example.com',
      path: '/docs',
    });
  });
});
