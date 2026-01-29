import { loggers } from '@peam-ai/logger';
import {
  filePathToPathname,
  loadRobotsTxt,
  parseHTML,
  shouldIncludePath,
  type RobotsTxtResult,
  type StructuredPage,
} from '@peam-ai/parser';
import { buildSearchIndex, type SearchIndexData } from '@peam-ai/search';
import fg from 'fast-glob';
import { existsSync } from 'fs';
import * as fs from 'fs/promises';
import * as path from 'path';
import type { SearchIndexBuilder } from './SearchIndexBuilder';

const log = loggers.builder;
const sourceDirsToProbe = ['.next', '.build', '.out', 'dist'];

function probeSourceDirectory(projectDir: string): string | undefined {
  for (const dir of sourceDirsToProbe) {
    if (existsSync(path.join(projectDir, dir))) return dir;
  }
  return undefined;
}

/**
 * Configuration for file-based search index builder
 * @description Scan a directory for files
 */
export interface FileBasedSearchIndexBuilderOptions {
  /**
   * The source directory containing files to index  (auto-detected if not provided)
   * @description Directory containing files to index (auto-detected if not provided)
   */
  sourceDir?: string;

  /**
   * Project root directory
   * @description Project root directory
   */
  projectDir?: string;

  /**
   * Glob pattern for HTML files
   * @description Glob pattern for HTML files
   * @default **\/*.{html,htm}
   */
  glob?: string;

  /**
   * Whether to respect robots.txt rules
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
   * @description Patterns to exclude from indexing (comma-separated)
   * @default []
   */
  exclude?: string[] | string;
}

/**
 * File-based implementation of SearchIndexBuilder
 * Reads files from a directory and builds search index
 */
export class FileBasedSearchIndexBuilder implements SearchIndexBuilder {
  private sourceDir: string;
  private projectDir: string;
  private glob: string;
  private respectRobotsTxt: boolean;
  private robotsTxtPath?: string;
  private exclude: string[];

  constructor(options: FileBasedSearchIndexBuilderOptions) {
    this.projectDir = options.projectDir ?? process.cwd();
    const resolvedSourceDir = options.sourceDir ?? probeSourceDirectory(this.projectDir);
    if (!resolvedSourceDir) {
      throw new Error('sourceDir is required for FileBasedSearchIndexBuilder');
    }
    this.sourceDir = resolvedSourceDir;
    this.glob = options.glob ?? '**/*.{html,htm}';
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

  private async discoverHtmlFiles(): Promise<
    Array<{
      pathname: string;
      htmlFilePath: string;
      relativeHtmlPath: string;
    }>
  > {
    const pages: Array<{
      pathname: string;
      htmlFilePath: string;
      relativeHtmlPath: string;
    }> = [];

    try {
      const sourceFullPath = path.join(this.projectDir, this.sourceDir);

      const htmlFiles = await fg(this.glob, {
        cwd: sourceFullPath,
        absolute: true,
        onlyFiles: true,
        dot: false,
        ignore: ['**/_next/**', '**/_astro/**', '**/404.{html,htm}', '**/500.{html,htm}'],
      });

      for (const htmlFilePath of htmlFiles) {
        const relativePath = path.relative(sourceFullPath, htmlFilePath);
        const pathname = filePathToPathname(relativePath);

        pages.push({
          pathname,
          htmlFilePath,
          relativeHtmlPath: relativePath,
        });
      }
    } catch (error) {
      log.warn('Error discovering files:', error);
    }

    return pages;
  }

  async build(): Promise<SearchIndexData | null> {
    try {
      log.debug('Building search index from file system');

      const discoveredPages = await this.discoverHtmlFiles();

      if (discoveredPages.length === 0) {
        log.warn('No files found in', this.sourceDir);
        return null;
      }

      log.debug('Found', discoveredPages.length, 'files');

      // Remove duplicates
      const uniquePages = new Map<string, (typeof discoveredPages)[0]>();
      for (const page of discoveredPages) {
        if (!uniquePages.has(page.pathname)) {
          uniquePages.set(page.pathname, page);
        }
      }

      log.debug('Processing', uniquePages.size, 'unique pages');

      // Load robots.txt if needed
      const searchPaths = [path.join(this.sourceDir, 'robots.txt'), 'public/robots.txt', 'robots.txt'];
      const robotsResult: RobotsTxtResult | null = this.respectRobotsTxt
        ? loadRobotsTxt(this.projectDir, searchPaths, this.robotsTxtPath)
        : null;

      if (robotsResult) {
        log.debug('Loaded robots.txt from:', robotsResult.path);
      }

      const pages: Array<{
        path: string;
        structuredPage: StructuredPage;
      }> = [];

      for (const [pathname, page] of uniquePages) {
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
          const html = await fs.readFile(page.htmlFilePath, 'utf-8');
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
      log.error('Failed to build search index from file system:', error);
      return null;
    }
  }
}
