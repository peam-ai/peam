import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import robotsParser from 'robots-parser';

export type RobotsParser = ReturnType<typeof robotsParser>;

export interface RobotsTxtResult {
  parser: RobotsParser;
  path: string;
}

export function createRobotsParser(content: string): RobotsParser {
  return robotsParser('https://robots.invalid/robots.txt', content);
}

/**
 * Loads and parses robots.txt from custom path or standard locations
 * Returns the parser and the path where robots.txt was found
 */
export function loadRobotsTxt(
  projectDir: string,
  searchPaths: string[],
  robotsTxtPath?: string
): RobotsTxtResult | null {
  try {
    let robotsContent: string | null = null;
    let foundPath: string | null = null;

    if (robotsTxtPath) {
      const customPath = join(projectDir, robotsTxtPath);
      if (existsSync(customPath)) {
        robotsContent = readFileSync(customPath, 'utf-8');
        foundPath = customPath;
      }
    }

    if (!robotsContent) {
      for (const searchPath of searchPaths) {
        const fullPath = join(projectDir, searchPath);
        if (existsSync(fullPath)) {
          robotsContent = readFileSync(fullPath, 'utf-8');
          foundPath = fullPath;
          break;
        }
      }
    }

    if (!robotsContent) {
      return null;
    }

    return {
      parser: createRobotsParser(robotsContent),
      path: foundPath || '',
    };
  } catch (error) {
    throw error;
  }
}

export function isPathAllowedByRobots(path: string, robots: RobotsParser | null): boolean {
  if (!robots) {
    return true;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const testUrl = `https://robots.invalid${normalizedPath}`;
  const isAllowed = robots.isAllowed(testUrl, '*');

  return isAllowed !== false;
}
