import { describe, expect, it } from 'vitest';
import { FileBasedSearchIndexSource } from './FileBasedSearchIndexSource';
import { PrerenderSearchIndexSource } from './PrerenderSearchIndexSource';
import { createSourceFromConfig } from './config';

describe('createSourceFromConfig', () => {
  it('creates a file-based source when configured', () => {
    // arrange
    const config = {
      type: 'fileBased' as const,
      config: {
        projectDir: '/project',
        sourceDir: 'dist',
      },
    };

    // act
    const source = createSourceFromConfig(config);

    // assert
    expect(source).toBeInstanceOf(FileBasedSearchIndexSource);
  });

  it('creates a prerender source when configured', () => {
    // arrange
    const config = {
      type: 'prerender' as const,
      config: {
        projectDir: '/project',
        prerenders: [],
      },
    };

    // act
    const source = createSourceFromConfig(config);

    // assert
    expect(source).toBeInstanceOf(PrerenderSearchIndexSource);
  });
});
