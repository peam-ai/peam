import { loggers } from '@peam-ai/logger';
import fg from 'fast-glob';
import { readFileSync } from 'fs';
import * as fs from 'fs/promises';
import { join } from 'path';
import robotsParser from 'robots-parser';
import type { PageCandidate } from '../builder/types';
import type { SearchIndexFilter } from './SearchIndexFilter';

const log = loggers.builder;

export interface RobotsTxtFilterOptions {
  /**
   * The project directory
   */
  projectDir: string;

  /**
   * Path to robots.txt file or false to disable
   * If set to false, the filter will not apply any robots.txt rules.
   * By default it looks for robots.txt in standard locations.
   */
  robotsTxt?: string | boolean;
}

type RobotsParser = ReturnType<typeof robotsParser>;

interface RobotsTxtResult {
  parser: RobotsParser;
  path: string;
}

export class RobotsTxtFilter implements SearchIndexFilter {
  private parserResult: RobotsTxtResult | null = null;

  constructor(private readonly options: RobotsTxtFilterOptions) {}

  private async loadParserFromCandidates(pages: PageCandidate[]): Promise<RobotsTxtResult | null> {
    // load from prerenders if available
    const robotsPage = pages.find((page) => page.path === '/robots.txt');
    if (!robotsPage) return null;

    if (robotsPage.content) {
      return { parser: this.createRobotsParser(robotsPage.content), path: robotsPage.path };
    }

    // else try find it on disk
    if (robotsPage.filePath) {
      try {
        const content = await fs.readFile(robotsPage.filePath, 'utf-8');
        return { parser: this.createRobotsParser(content), path: robotsPage.filePath };
      } catch (error) {
        log.error('Error reading robots.txt from prerender:', error);
      }
    }

    return null;
  }

  private async ensureParser(pages: PageCandidate[]): Promise<RobotsTxtResult | null> {
    if (this.parserResult) return this.parserResult;

    const fromCandidates = await this.loadParserFromCandidates(pages);
    if (fromCandidates) {
      log.debug('Loaded robots.txt from prerendered pages');
      this.parserResult = fromCandidates;
      return this.parserResult;
    }

    const robotsTxtPath = typeof this.options.robotsTxt === 'string' ? this.options.robotsTxt : undefined;
    const result = this.loadRobotsTxt(this.options.projectDir, robotsTxtPath);
    if (result) {
      log.debug('Loaded robots.txt from:', result.path);
    }

    this.parserResult = result;
    return this.parserResult;
  }

  async filter(pages: PageCandidate[]): Promise<PageCandidate[]> {
    if (this.options.robotsTxt === false) {
      return pages;
    }

    const parserResult = await this.ensureParser(pages);
    if (!parserResult?.parser) return pages;

    const filtered: PageCandidate[] = [];

    for (const page of pages) {
      if (page.path === '/robots.txt') {
        continue;
      }

      if (!this.isPathAllowedByRobots(page.path, parserResult.parser)) {
        log.debug('Path excluded by robots.txt:', page.path);
        continue;
      }

      filtered.push(page);
    }

    return filtered;
  }
  private createRobotsParser(content: string): RobotsParser {
    return robotsParser('https://robots.invalid/robots.txt', content);
  }

  private loadRobotsTxt(projectDir: string, robotsTxtPath?: string): RobotsTxtResult | null {
    let robotsContent: string | null = null;
    let foundPath: string | null = null;

    if (robotsTxtPath && robotsTxtPath.length > 0) {
      const customPath = join(projectDir, robotsTxtPath);
      try {
        robotsContent = readFileSync(customPath, 'utf-8');
        foundPath = customPath;
      } catch {
        log.error('Could not read robots.txt from custom path:', customPath);
        return null;
      }
    } else {
      const discoveredPath = this.findRobotsFile(projectDir);
      if (discoveredPath) {
        robotsContent = readFileSync(discoveredPath, 'utf-8');
        log.debug('Discovered robots.txt at:', discoveredPath);

        foundPath = discoveredPath;
      }
    }

    if (!robotsContent) {
      log.warn('No robots.txt file found in:', projectDir);
      return null;
    }

    return {
      parser: this.createRobotsParser(robotsContent),
      path: foundPath || '',
    };
  }

  private findRobotsFile(projectDir: string): string | null {
    return (
      fg.sync(['**/robots.txt', '**/robots.txt.body'], {
        cwd: projectDir,
        absolute: true,
        dot: true,
        onlyFiles: true,
        suppressErrors: true,
      })[0] ?? null
    );
  }

  private isPathAllowedByRobots(pathname: string, robots: RobotsParser | null): boolean {
    if (!robots) {
      return true;
    }

    const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
    const testUrl = `https://robots.invalid${normalizedPath}`;
    const isAllowed = robots.isAllowed(testUrl, '*');

    return isAllowed !== false;
  }
}
