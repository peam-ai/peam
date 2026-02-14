import { describe, expect, it } from 'vitest';
import { normalizeDomain } from './normalizeDomain';

describe('normalizeDomain', () => {
  it('removes protocol and www prefix', () => {
    // arrange
    const input = 'https://www.example.com/path';

    // act
    const result = normalizeDomain(input);

    // assert
    expect(result).toBe('example.com/path');
  });

  it('removes http protocol only', () => {
    // arrange
    const input = 'http://example.com';

    // act
    const result = normalizeDomain(input);

    // assert
    expect(result).toBe('example.com');
  });
});
