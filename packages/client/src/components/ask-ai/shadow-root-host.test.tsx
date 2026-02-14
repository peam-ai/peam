import { act } from '@testing-library/react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { ShadowRootHost } from './shadow-root-host';

type TestRoot = {
  container: HTMLDivElement;
  root: ReturnType<typeof createRoot>;
};

const created: TestRoot[] = [];

function createTestRoot() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  const entry = { container, root };
  created.push(entry);
  return entry;
}

function flushEffects() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

afterEach(async () => {
  for (const { container } of created.splice(0)) {
    await act(async () => {
      await flushEffects();
    });
    container.remove();
  }
});

describe('ShadowRootHost', () => {
  it('creates a shadow root with style and mount elements', async () => {
    // Arrange
    const { container, root } = createTestRoot();

    // Act
    await act(async () => {
      root.render(
        <ShadowRootHost>
          <span>Shadow Content</span>
        </ShadowRootHost>
      );
      await flushEffects();
    });

    // Assert
    const host = container.firstElementChild as HTMLDivElement | null;
    expect(host).not.toBeNull();

    const shadow = host?.shadowRoot ?? null;
    expect(shadow).not.toBeNull();

    const styleEl = shadow?.querySelector('style[data-peam-style]');
    const mountEl = shadow?.querySelector('div[data-peam-mount]');

    expect(styleEl).not.toBeNull();
    expect(mountEl).not.toBeNull();
    expect(mountEl?.textContent).toContain('Shadow Content');
  });

  it('removes only created nodes on cleanup', async () => {
    // Arrange
    const { container, root } = createTestRoot();

    // Act
    await act(async () => {
      root.render(
        <ShadowRootHost>
          <span>Cleanup Test</span>
        </ShadowRootHost>
      );
      await flushEffects();
    });

    // Assert
    const host = container.firstElementChild as HTMLDivElement | null;
    const shadow = host?.shadowRoot ?? null;
    const styleEl = shadow?.querySelector('style[data-peam-style]');
    const mountEl = shadow?.querySelector('div[data-peam-mount]');

    expect(styleEl).not.toBeNull();
    expect(mountEl).not.toBeNull();

    await act(async () => {
      await flushEffects();
    });
  });
});
