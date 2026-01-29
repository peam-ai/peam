import { loggers } from '@peam-ai/logger';
import {
  loadRobotsTxt as baseLoadRobotsTxt,
  createRobotsParser,
  parseHTML,
  shouldIncludePath,
  type RobotsTxtResult,
  type StructuredPage,
} from '@peam-ai/parser';
import { buildSearchIndex, type SearchIndexData } from '@peam-ai/search';
import { readFileSync } from 'fs';
import type { SearchIndexBuilder } from './SearchIndexBuilder';

const log = loggers.builder;

/**
 * A page to be prerendered
 */
export interface PrerenderPage {
  pathname: string;
  fallback?: {
    filePath: string;
  };
}

/**
 * Configuration for prerender search index builder
 * @description Index prerendered pages
 */
export interface PrerenderSearchIndexBuilderOptions {
  /**
   * The prerender pages from the framework build
   * @description Array of prerendered pages (JSON)
   */
  prerenders: PrerenderPage[] | string;

  /**
   * The project directory
   * @description Project root directory
   */
  projectDir: string;

  /**
   * Whether to respect robots.txt
   * @description Respect robots.txt rules
   * @default true
   */
  respectRobotsTxt?: boolean;

  /**
   * Path to robots.txt file
   * @description Path to robots.txt file
   */
  robotsTxtPath?: string;

  /**
   * Patterns to exclude from indexing
   * @description Patterns to exclude (comma-separated)
   * @default []
   */
  exclude?: string[] | string;
}

/**
 * Prerender implementation of SearchIndexBuilder
 * Reads and parses HTML from prerendered pages to build search index
 */
export class PrerenderSearchIndexBuilder implements SearchIndexBuilder {
  private prerenders: PrerenderPage[];
  private projectDir: string;
  private respectRobotsTxt: boolean;
  private robotsTxtPath?: string;
  private exclude: string[];

  constructor(options: PrerenderSearchIndexBuilderOptions) {
    this.prerenders =
      typeof options.prerenders === 'string' ? (JSON.parse(options.prerenders) as PrerenderPage[]) : options.prerenders;
    this.projectDir = options.projectDir;
    this.respectRobotsTxt = options.respectRobotsTxt ?? true;
    this.robotsTxtPath = options.robotsTxtPath;
    if (Array.isArray(options.exclude)) {
      this.exclude = options.exclude.map((value) => value.trim()).filter(Boolean);
    } else if (typeof options.exclude === 'string') {
      this.exclude = options.exclude
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);
    } else {
      this.exclude = [];
    }
  }

  private extractRobotsFromPrerender(prerender: PrerenderPage): string | null {
    try {
      if (prerender.pathname !== '/robots.txt') {
        return null;
      }

      if (prerender.fallback?.filePath) {
        const content = readFileSync(prerender.fallback.filePath, 'utf-8');
        return content;
      }
    } catch (error) {
      log.error('Error extracting robots from prerender:', error);
    }

    return null;
  }

  private loadRobotsTxt(prerenders: PrerenderPage[]): RobotsTxtResult | null {
    try {
      let robotsContent: string | null = null;
      let foundPath: string | null = null;

      if (prerenders && prerenders.length > 0) {
        for (const prerender of prerenders) {
          const content = this.extractRobotsFromPrerender(prerender);
          if (content) {
            log.debug('Found dynamic robots.txt from prerenders');
            robotsContent = content;
            foundPath = prerender.pathname;
            break;
          }
        }
      }

      if (!robotsContent) {
        const searchPaths = ['public/robots.txt', 'app/robots.txt', 'src/app/robots.txt'];
        const result = baseLoadRobotsTxt(this.projectDir, searchPaths, this.robotsTxtPath);
        if (result) {
          log.debug('Loaded robots.txt from:', result.path);
          return result;
        }
        return null;
      }

      return {
        parser: createRobotsParser(robotsContent),
        path: foundPath || '',
      };
    } catch (error) {
      log.error('Error loading robots.txt:', error);
      return null;
    }
  }

  async build(): Promise<SearchIndexData | null> {
    try {
      log.debug('Building search index from prerender pages');

      log.debug('Total prerenders:', this.prerenders.length);

      const robotsResult = this.respectRobotsTxt ? this.loadRobotsTxt(this.prerenders) : null;

      if (robotsResult) {
        log.debug('Using robots.txt from:', robotsResult.path);
      }

      const pages: Array<{
        path: string;
        structuredPage: StructuredPage;
      }> = [];

      for (const prerender of this.prerenders) {
        const pathname = prerender.pathname;
        let fallbackFilePath = prerender.fallback?.filePath;

        if (!fallbackFilePath) {
          continue;
        }

        // Fix for Next.js 15
        if (fallbackFilePath?.endsWith('/.html')) {
          fallbackFilePath = fallbackFilePath.replace('/.html', '/index.html');
        }

        const filterResult = shouldIncludePath(
          pathname,
          robotsResult?.parser ?? null,
          this.exclude,
          this.respectRobotsTxt
        );

        if (!filterResult.included) {
          if (filterResult.reason === 'robots-txt') {
            log.debug('Path excluded by robots.txt:', pathname);
          } else if (filterResult.reason === 'exclude-pattern') {
            log.debug('Path excluded by user pattern:', pathname);
          }
          continue;
        }

        try {
          log.debug('Reading HTML from:', fallbackFilePath);

          const html = readFileSync(fallbackFilePath, 'utf-8');
          const structuredPage = parseHTML(html);

          if (!structuredPage) {
            log.warn('No content extracted from', pathname);
            continue;
          }

          log.debug('Successfully extracted content from', pathname);
          pages.push({
            path: pathname,
            structuredPage,
          });
        } catch (error) {
          log.error('Error processing', pathname, error);
        }
      }

      log.debug('Creating search index from', pages.length, 'pages');
      const searchIndexData = await buildSearchIndex(pages);

      return searchIndexData;
    } catch (error) {
      log.error('Failed to build search index from prerender pages:', error);
      return null;
    }
  }
}
