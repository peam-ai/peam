import { loggers } from '@peam/logger';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import robotsParser from 'robots-parser';

const log = loggers.adapter;

type RobotsParser = ReturnType<typeof robotsParser>;

function extractRobotsFromPrerender(prerender: {
  pathname: string;
  fallback?: { filePath?: string };
  data?: unknown;
}): string | null {
  try {
    const pathname = prerender.pathname;
    if (pathname !== '/robots.txt') {
      return null;
    }

    if (prerender.fallback?.filePath) {
      const content = readFileSync(prerender.fallback.filePath, 'utf-8');
      return content;
    }
  } catch (error) {
    log('Error extracting robots from prerender: %O', error);
  }

  return null;
}

/**
 * Loads and parses robots.txt from custom path, static files, or dynamic routes
 */
export function loadRobotsTxt(
  projectDir: string,
  prerenders?: Array<{ pathname: string; fallback?: { filePath?: string }; data?: unknown }>,
  robotsTxtPath?: string
): RobotsParser | null {
  try {
    let robotsContent: string | null = null;

    // First priority: try to load from custom path if provided
    if (robotsTxtPath) {
      try {
        const customPath = join(projectDir, robotsTxtPath);
        robotsContent = readFileSync(customPath, 'utf-8');
        log('Successfully loaded robots.txt from %s', customPath);
      } catch (error) {
        log('Error loading robots.txt from custom path: %O, falling back to local sources', error);
      }
    }

    // Second priority: try to extract from prerenders (dynamic robots.txt)
    if (!robotsContent && prerenders && prerenders.length > 0) {
      for (const prerender of prerenders) {
        const content = extractRobotsFromPrerender(prerender);
        if (content) {
          log('Found dynamic robots.txt from prerenders');
          robotsContent = content;
          break;
        }
      }
    }

    // Third priority: try static file locations
    if (!robotsContent) {
      const possiblePaths = [
        join(projectDir, 'public', 'robots.txt'),
        join(projectDir, 'app', 'robots.txt'),
        join(projectDir, 'src', 'app', 'robots.txt'),
      ];

      for (const robotsPath of possiblePaths) {
        try {
          if (existsSync(robotsPath)) {
            robotsContent = readFileSync(robotsPath, 'utf-8');
            log('Found static robots.txt at: %s', robotsPath);
            break;
          }
        } catch {
          continue;
        }
      }
    }

    if (!robotsContent) {
      log('No robots.txt found from any source');
      return null;
    }

    const robots = robotsParser('https://robots.invalid/robots.txt', robotsContent);
    return robots;
  } catch (error) {
    log('Error loading robots.txt: %O', error);
    return null;
  }
}

/**
 * Checks if a path is allowed by robots.txt rules
 */
export function isPathAllowedByRobots(path: string, robots: RobotsParser | null): boolean {
  if (!robots) {
    return true;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const testUrl = `https://robots.invalid${normalizedPath}`;
  const isAllowed = robots.isAllowed(testUrl, '*');

  return isAllowed !== false;
}
