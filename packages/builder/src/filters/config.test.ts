import { describe, expect, it, vi } from 'vitest';
import { PrerenderSearchIndexSource } from '../sources/PrerenderSearchIndexSource';
import type { SearchIndexSource } from '../sources/SearchIndexSource';
import { CommonFilter } from './CommonFilter';
import { ExcludePatternFilter } from './ExcludePatternFilter';
import { PrerenderPathFilter } from './PrerenderPathFilter';
import { RobotsTxtFilter } from './RobotsTxtFilter';
import { createFiltersFromConfig } from './config';

vi.mock('@peam-ai/logger', () => ({
  loggers: {
    builder: {
      debug: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
  },
}));

describe('createFiltersFromConfig', () => {
  it('includes common and robots filters by default', () => {
    // arrange
    const sources: SearchIndexSource[] = [
      {
        getProjectDir: () => '/project',
        discover: vi.fn().mockResolvedValue([]),
      },
    ];

    // act
    const filters = createFiltersFromConfig(sources, undefined);

    // assert
    expect(filters.some((filter) => filter instanceof CommonFilter)).toBe(true);
    expect(filters.some((filter) => filter instanceof RobotsTxtFilter)).toBe(true);
  });

  it('keeps common filter when exclude config is an empty string', () => {
    // arrange
    const sources: SearchIndexSource[] = [
      {
        getProjectDir: () => '/project',
        discover: vi.fn().mockResolvedValue([]),
      },
    ];

    // act
    const filters = createFiltersFromConfig(sources, { exclude: '', robotsTxt: false });

    // assert
    expect(filters.some((filter) => filter instanceof CommonFilter)).toBe(true);
    expect(filters.some((filter) => filter instanceof RobotsTxtFilter)).toBe(false);
  });

  it('adds prerender and exclude filters when configured', () => {
    // arrange
    const sources: SearchIndexSource[] = [new PrerenderSearchIndexSource({ prerenders: [], projectDir: '/project' })];

    // act
    const filters = createFiltersFromConfig(sources, { exclude: ['/admin'], robotsTxt: false });

    // assert
    expect(filters.some((filter) => filter instanceof PrerenderPathFilter)).toBe(true);
    expect(filters.some((filter) => filter instanceof ExcludePatternFilter)).toBe(true);
  });
});
