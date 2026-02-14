import { act } from '@testing-library/react';
import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('debounces value updates until delay passes', () => {
    // arrange
    const container = document.createElement('div');
    const root = createRoot(container);
    const onChange = vi.fn<(value: string) => void>();

    const TestComponent = ({ value, delay }: { value: string; delay: number }) => {
      const debouncedValue = useDebounce(value, delay);
      useEffect(() => {
        onChange(debouncedValue);
      }, [debouncedValue]);
      return null;
    };

    // act
    act(() => {
      root.render(<TestComponent value="first" delay={200} />);
    });

    // assert
    expect(onChange).toHaveBeenCalledWith('first');

    // act
    act(() => {
      root.render(<TestComponent value="second" delay={200} />);
    });

    act(() => {
      vi.advanceTimersByTime(199);
    });

    // assert
    expect(onChange).not.toHaveBeenCalledWith('second');

    // act
    act(() => {
      vi.advanceTimersByTime(1);
    });

    // assert
    expect(onChange).toHaveBeenCalledWith('second');
  });
});
