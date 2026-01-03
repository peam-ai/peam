import { isMatch } from 'matcher';

/**
 * Checks if a path matches any of the given wildcard patterns
 * Uses the matcher library which supports:
 * - * (matches any characters except /)
 * - ** (matches any characters including /)
 * - ? (matches single character)
 * - ! (negation)
 * - [] (character ranges)
 */
export function matchesExcludePattern(path: string, patterns: string[]): boolean {
  if (!patterns || patterns.length === 0) {
    return false;
  }

  const normalize = (p: string) => (p.startsWith('/') ? p : `/${p}`);
  const normalizedPath = normalize(path);
  const normalizedPatterns = patterns.map(normalize);

  return isMatch(normalizedPath, normalizedPatterns);
}
