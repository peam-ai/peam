import type { NextConfig } from 'next';
import { createStoreFromConfig, type SearchStoreConfig } from 'peam/search';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getConfig, setNextConfig } from './config';

vi.mock('peam/search', async () => {
  const actual = await vi.importActual<typeof import('peam/search')>('peam/search');

  return {
    ...actual,
    createStoreFromConfig: vi.fn(() => ({ kind: 'mock-store' })),
  };
});

const ORIGINAL_ENV = { ...process.env };

const resetEnv = () => {
  for (const key of Object.keys(process.env)) {
    if (!(key in ORIGINAL_ENV)) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete process.env[key];
    }
  }

  for (const [key, value] of Object.entries(ORIGINAL_ENV)) {
    process.env[key] = value;
  }
};

beforeEach(() => {
  resetEnv();
  vi.clearAllMocks();
});

describe('setNextConfig', () => {
  it('serializes default config into env and nextConfig.env', () => {
    // Arrange
    const nextConfig: NextConfig = { env: { EXISTING: '1' } };

    // Act
    setNextConfig(nextConfig);

    // Assert
    const defaultSearchStore = {
      type: 'fileBased',
      config: { indexPath: '.peam/index.json' },
    } satisfies SearchStoreConfig;

    expect(process.env.PEAM_SEARCH_STORE).toBe(JSON.stringify(defaultSearchStore));
    expect(process.env.PEAM_EXCLUDE).toBe(JSON.stringify([]));
    expect(process.env.PEAM_ROBOTS_TXT).toBe('');

    expect(nextConfig.env).toEqual({
      EXISTING: '1',
      PEAM_SEARCH_STORE: JSON.stringify(defaultSearchStore),
      PEAM_EXCLUDE: JSON.stringify([]),
      PEAM_ROBOTS_TXT: '',
    });
  });

  it('serializes custom config values and robotsTxt', () => {
    // Arrange
    const nextConfig: NextConfig = { env: {} };

    // Act
    setNextConfig(nextConfig, {
      searchStore: {
        type: 'fileBased',
        config: { indexPath: 'custom/index.json' },
      },
      exclude: ['/admin/**'],
      robotsTxt: false,
    });

    // Assert
    expect(process.env.PEAM_SEARCH_STORE).toBe(
      JSON.stringify({
        type: 'fileBased',
        config: { indexPath: 'custom/index.json' },
      })
    );
    expect(process.env.PEAM_EXCLUDE).toBe(JSON.stringify(['/admin/**']));
    expect(process.env.PEAM_ROBOTS_TXT).toBe('false');
  });
});

describe('getConfig', () => {
  it('throws when PEAM_SEARCH_STORE is missing', () => {
    // Arrange
    delete process.env.PEAM_SEARCH_STORE;

    // Act + Assert
    expect(() => getConfig()).toThrow(
      'Peam configuration not found. Make sure withPeam() is properly configured in your next.config file.'
    );
  });

  it('parses env values and resolves searchIndexStore', () => {
    // Arrange
    const searchStore: SearchStoreConfig = {
      type: 'fileBased',
      config: { indexPath: 'custom/index.json' },
    };

    process.env.PEAM_SEARCH_STORE = JSON.stringify(searchStore);
    process.env.PEAM_EXCLUDE = JSON.stringify(['/admin/**']);
    process.env.PEAM_ROBOTS_TXT = 'true';

    // Act
    const resolved = getConfig();

    // Assert
    expect(createStoreFromConfig).toHaveBeenCalledWith(searchStore);
    expect(resolved.searchStore).toEqual(searchStore);
    expect(resolved.searchIndexStore).toEqual({ kind: 'mock-store' });
    expect(resolved.exclude).toEqual(['/admin/**']);
    expect(resolved.robotsTxt).toBe(true);
  });

  it('treats empty robotsTxt and missing exclude as undefined/empty', () => {
    // Arrange
    const searchStore: SearchStoreConfig = {
      type: 'fileBased',
      config: { indexPath: '.peam/index.json' },
    };

    process.env.PEAM_SEARCH_STORE = JSON.stringify(searchStore);
    process.env.PEAM_ROBOTS_TXT = '';
    delete process.env.PEAM_EXCLUDE;

    // Act
    const resolved = getConfig();

    // Assert
    expect(resolved.robotsTxt).toBeUndefined();
    expect(resolved.exclude).toEqual([]);
  });
});
