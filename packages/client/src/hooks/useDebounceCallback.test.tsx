// @vitest-environment happy-dom

import { act, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDebounceCallback } from './useDebounceCallback';

describe('useDebounceCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('debounces callback and only fires with latest args', () => {
    // arrange
    const container = document.createElement('div');
    const root = createRoot(container);
    const onReady = vi.fn<(fn: (value: string) => void) => void>();
    const handler = vi.fn<(value: string) => void>();

    const TestComponent = () => {
      const debounced = useDebounceCallback(handler, 250);
      useEffect(() => {
        onReady(debounced);
      }, [debounced]);
      return null;
    };

    // act
    act(() => {
      root.render(<TestComponent />);
    });

    const debounced = onReady.mock.calls[0][0];

    // act
    act(() => {
      debounced('first');
      debounced('second');
    });

    act(() => {
      vi.advanceTimersByTime(249);
    });

    // assert
    expect(handler).not.toHaveBeenCalled();

    // act
    act(() => {
      vi.advanceTimersByTime(1);
    });

    // assert
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith('second');

    // act
    root.unmount();
  });
});
