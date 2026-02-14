// @vitest-environment happy-dom

import { act, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useDarkMode } from './useDarkMode';

type MediaQueryListener = (event: MediaQueryListEvent) => void;

describe('useDarkMode', () => {
  let listeners: MediaQueryListener[] = [];
  const createMatchMedia = (matches: boolean) =>
    vi.fn().mockImplementation(() => ({
      matches,
      addEventListener: (_event: 'change', listener: MediaQueryListener) => {
        listeners.push(listener);
      },
      removeEventListener: (_event: 'change', listener: MediaQueryListener) => {
        listeners = listeners.filter((current) => current !== listener);
      },
    }));

  beforeEach(() => {
    listeners = [];
  });

  it('returns initial preference from matchMedia', () => {
    // arrange
    window.matchMedia = createMatchMedia(true);

    const container = document.createElement('div');
    const root = createRoot(container);
    const onValue = vi.fn<(value: boolean) => void>();

    const TestComponent = () => {
      const value = useDarkMode();
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
    expect(onValue).toHaveBeenCalledWith(true);

    // act
    root.unmount();
  });

  it('updates when matchMedia emits change', () => {
    // arrange
    window.matchMedia = createMatchMedia(false);

    const container = document.createElement('div');
    const root = createRoot(container);
    const onValue = vi.fn<(value: boolean) => void>();

    const TestComponent = () => {
      const value = useDarkMode();
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
    expect(onValue).toHaveBeenCalledWith(false);

    // act
    act(() => {
      listeners.forEach((listener) => listener({ matches: true } as MediaQueryListEvent));
    });

    // assert
    expect(onValue).toHaveBeenCalledWith(true);

    // act
    root.unmount();
  });
});
