import { describe, expect, it, vi } from 'vitest';
import type { PageCandidate } from '../builder/types';
import { RobotsTxtFilter } from './RobotsTxtFilter';

const fgSync = vi.hoisted(() => vi.fn().mockReturnValue([]));
const fg = vi.hoisted(() => Object.assign(vi.fn(), { sync: fgSync }));
const readFileSync = vi.hoisted(() => vi.fn());
const readFile = vi.hoisted(() => vi.fn());

vi.mock('fast-glob', () => ({
  default: fg,
}));

vi.mock('fs', () => ({
  readFileSync,
}));

vi.mock('fs/promises', () => ({
  readFile,
}));

vi.mock('@peam-ai/logger', () => ({
  loggers: {
    builder: {
      debug: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
  },
}));

describe('RobotsTxtFilter', () => {
  it('returns pages unchanged when robots.txt is disabled', async () => {
    // arrange
    const pages: PageCandidate[] = [
      { path: '/public', content: 'content', source: 'fileBased' },
      { path: '/private', content: 'content', source: 'fileBased' },
    ];
    const filter = new RobotsTxtFilter({ projectDir: '/project', robotsTxt: false });

    // act
    const result = await filter.filter(pages);

    // assert
    expect(result).toEqual(pages);
  });

  it('filters pages based on robots.txt content from candidates', async () => {
    // arrange
    const pages: PageCandidate[] = [
      {
        path: '/robots.txt',
        content: 'User-agent: *\nDisallow: /private',
        source: 'prerender',
      },
      { path: '/public', content: 'content', source: 'prerender' },
      { path: '/private', content: 'content', source: 'prerender' },
    ];
    const filter = new RobotsTxtFilter({ projectDir: '/project' });

    // act
    const result = await filter.filter(pages);

    // assert
    expect(result).toEqual([{ path: '/public', content: 'content', source: 'prerender' }]);
  });

  it('returns pages unchanged when no robots.txt is found', async () => {
    // arrange
    const pages: PageCandidate[] = [
      { path: '/public', content: 'content', source: 'fileBased' },
      { path: '/private', content: 'content', source: 'fileBased' },
    ];
    const filter = new RobotsTxtFilter({ projectDir: '/project' });

    fgSync.mockReturnValueOnce([]);
    readFileSync.mockReset();

    // act
    const result = await filter.filter(pages);

    // assert
    expect(result).toEqual(pages);
    expect(readFileSync).not.toHaveBeenCalled();
  });
});
