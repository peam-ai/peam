import type { UIMessage } from '@ai-sdk/react';
import { act } from '@testing-library/react';
import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useChatPersistence } from './useChatPersistence';

const getDb = vi.fn();
const useLiveQuery = vi.fn();

vi.mock('@/lib/db', () => ({
  getDb: (...args: unknown[]) => getDb(...args),
}));

vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: (...args: unknown[]) => useLiveQuery(...args),
}));

vi.mock('@/hooks/useDebounceCallback', () => ({
  useDebounceCallback: (callback: unknown) => callback,
}));

describe('useChatPersistence', () => {
  beforeEach(() => {
    getDb.mockReset();
    useLiveQuery.mockReset();
  });

  it('returns default state when persistence is disabled', () => {
    // arrange
    useLiveQuery.mockReturnValueOnce([]).mockReturnValueOnce(undefined);

    const container = document.createElement('div');
    const root = createRoot(container);
    const onValue = vi.fn();

    const TestComponent = () => {
      const value = useChatPersistence(false);
      useEffect(() => {
        onValue(value);
      }, [value]);
      return null;
    };

    // act
    act(() => {
      root.render(<TestComponent />);
    });

    // assert
    const value = onValue.mock.calls[0][0];
    expect(value.isLoading).toBe(false);
    expect(value.initialMessages).toEqual([]);
    expect(value.summary).toBeUndefined();
    expect(value.lastSummarizedMessageId).toBeUndefined();
    expect(getDb).not.toHaveBeenCalled();
  });

  it('hydrates initial messages and summary when enabled', () => {
    // arrange
    const storedMessages = [
      { id: 'm1', role: 'user', content: 'Hello', timestamp: 1, sequence: 0 },
      { id: 'm2', role: 'assistant', content: 'Hi', timestamp: 2, sequence: 1 },
    ];
    const storedSummary = { summary: 'Summary', lastSummarizedMessageId: 'm2' };

    useLiveQuery.mockReturnValueOnce(storedMessages).mockReturnValueOnce(storedSummary);

    const db = {};
    getDb.mockReturnValue(db);

    const container = document.createElement('div');
    const root = createRoot(container);
    const onValue = vi.fn();

    const TestComponent = () => {
      const value = useChatPersistence(true);
      useEffect(() => {
        onValue(value);
      }, [value]);
      return null;
    };

    // act
    act(() => {
      root.render(<TestComponent />);
    });

    // assert
    const value = onValue.mock.calls[0][0];
    expect(value.isLoading).toBe(false);
    expect(value.initialMessages).toEqual(storedMessages);
    expect(value.summary).toBe('Summary');
    expect(value.lastSummarizedMessageId).toBe('m2');
  });

  it('sets loading state while messages are unresolved', () => {
    // arrange
    useLiveQuery.mockReturnValueOnce(undefined).mockReturnValueOnce(undefined);
    getDb.mockReturnValue({});

    const container = document.createElement('div');
    const root = createRoot(container);
    const onValue = vi.fn();

    const TestComponent = () => {
      const value = useChatPersistence(true);
      useEffect(() => {
        onValue(value);
      }, [value]);
      return null;
    };

    // act
    act(() => {
      root.render(<TestComponent />);
    });

    // assert
    const value = onValue.mock.calls[0][0];
    expect(value.isLoading).toBe(true);
  });

  it('saves messages with timestamps and sequence numbers', async () => {
    // arrange
    const baseTime = 1710000000000;
    vi.useFakeTimers();
    vi.setSystemTime(baseTime);

    const messagesTable = {
      clear: vi.fn(),
      bulkAdd: vi.fn(),
    };
    const summariesTable = {
      put: vi.fn(),
      delete: vi.fn(),
    };
    const transaction = vi.fn(async (_mode: string, _tables: unknown, callback: () => Promise<void>) => {
      await callback();
    });
    const db = {
      messages: messagesTable,
      summaries: summariesTable,
      transaction,
    };

    useLiveQuery.mockReturnValueOnce([]).mockReturnValueOnce(undefined);
    getDb.mockReturnValue(db);

    const container = document.createElement('div');
    const root = createRoot(container);
    const onValue = vi.fn();

    const TestComponent = () => {
      const value = useChatPersistence(true);
      useEffect(() => {
        onValue(value);
      }, [value]);
      return null;
    };

    // act
    act(() => {
      root.render(<TestComponent />);
    });

    const value = onValue.mock.calls[0][0];
    const messages: UIMessage[] = [
      { id: 'm1', role: 'user', content: 'Hello' } as unknown as UIMessage,
      { id: 'm2', role: 'assistant', content: 'Hi' } as unknown as UIMessage,
    ];

    await value.saveMessages(messages);

    // assert
    expect(transaction).toHaveBeenCalled();
    expect(messagesTable.clear).toHaveBeenCalled();
    expect(messagesTable.bulkAdd).toHaveBeenCalledWith([
      { id: 'm1', role: 'user', content: 'Hello', timestamp: baseTime, sequence: 0 },
      {
        id: 'm2',
        role: 'assistant',
        content: 'Hi',
        timestamp: baseTime + 1000,
        sequence: 1,
      },
    ]);

    // act
    vi.useRealTimers();
  });

  it('saves summaries and clears messages', async () => {
    // arrange
    const baseTime = 1720000000000;
    vi.useFakeTimers();
    vi.setSystemTime(baseTime);

    const messagesTable = {
      clear: vi.fn(),
      bulkAdd: vi.fn(),
    };
    const summariesTable = {
      put: vi.fn(),
      delete: vi.fn(),
    };
    const transaction = vi.fn(async (_mode: string, _tables: unknown, callback: () => Promise<void>) => {
      await callback();
    });
    const db = {
      messages: messagesTable,
      summaries: summariesTable,
      transaction,
    };

    useLiveQuery.mockReturnValueOnce([]).mockReturnValueOnce(undefined);
    getDb.mockReturnValue(db);

    const container = document.createElement('div');
    const root = createRoot(container);
    const onValue = vi.fn();

    const TestComponent = () => {
      const value = useChatPersistence(true);
      useEffect(() => {
        onValue(value);
      }, [value]);
      return null;
    };

    // act
    act(() => {
      root.render(<TestComponent />);
    });

    const value = onValue.mock.calls[0][0];

    await value.saveSummary('Summary', 'm2');

    // assert
    expect(summariesTable.put).toHaveBeenCalledWith({
      id: 'current',
      summary: 'Summary',
      lastSummarizedMessageId: 'm2',
      timestamp: baseTime,
    });

    // act
    await value.clearMessages();

    // assert
    expect(transaction).toHaveBeenCalled();
    expect(messagesTable.clear).toHaveBeenCalled();
    expect(summariesTable.delete).toHaveBeenCalledWith('current');

    // act
    vi.useRealTimers();
  });
});
