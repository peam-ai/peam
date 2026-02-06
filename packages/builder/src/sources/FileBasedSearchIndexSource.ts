import { loggers } from '@peam-ai/logger';
import fg from 'fast-glob';
import { existsSync } from 'fs';
import * as path from 'path';
import type { PageCandidate } from '../builder/types';
import type { SearchIndexSource } from './SearchIndexSource';

const log = loggers.builder;
const sourceDirsToProbe = ['.next', '.build', 'build', '.out', 'dist'];
const artifactPrefixes = [
  'server/pages/',
  'server/app/',
  'static/chunks/app/',
  'static/chunks/pages/',
  'static/',
  'server/',
  'client/',
];

function probeSourceDirectory(projectDir: string): string | undefined {
  log.debug('Probing for source directory in project:', projectDir);
  for (const dir of sourceDirsToProbe) {
    if (existsSync(path.join(projectDir, dir))) {
      log.debug('Using source directory:', dir);
      return dir;
    }
  }

  return undefined;
}

/**
 * Configuration for file-based search index source
 * @description Scan a directory for files
 */
export interface FileBasedSearchIndexSourceOptions {
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
   * Glob pattern for files
   * @description Glob pattern for files
   * @default **\/*.{html,htm}
   */
  glob?: string;
}

/**
 * File-based implementation of SearchIndexSource
 * Discovers files for indexing
 */
export class FileBasedSearchIndexSource implements SearchIndexSource {
  private readonly sourceDir: string;
  private readonly projectDir: string;
  private readonly glob: string;

  constructor(options: FileBasedSearchIndexSourceOptions) {
    this.projectDir = options.projectDir ?? process.cwd();
    const resolvedSourceDir = options.sourceDir ?? probeSourceDirectory(this.projectDir);
    if (!resolvedSourceDir) {
      throw new Error('sourceDir is required for FileBasedSearchIndexSource');
    }
    this.sourceDir = resolvedSourceDir;
    this.glob = options.glob ?? '**/*.{html,htm}';
  }

  getSourceDir(): string {
    return this.sourceDir;
  }

  getProjectDir(): string {
    return this.projectDir;
  }

  private async discoverFiles(): Promise<
    Array<{
      pathname: string;
      filePath: string;
      relativePath: string;
    }>
  > {
    const pages: Array<{
      pathname: string;
      filePath: string;
      relativePath: string;
    }> = [];

    try {
      const sourceFullPath = path.join(this.projectDir, this.sourceDir);

      const files = await fg(this.glob, {
        cwd: sourceFullPath,
        absolute: true,
        onlyFiles: true,
        dot: false,
      });

      for (const filePath of files) {
        const relativePath = path.relative(sourceFullPath, filePath);
        const pathname = this.filePathToPathname(relativePath);

        pages.push({
          pathname,
          filePath,
          relativePath,
        });
      }
    } catch (error) {
      log.warn('Error discovering files:', error);
    }

    return pages;
  }

  async discover(): Promise<PageCandidate[]> {
    log.debug('Discovering files from file system');

    const discoveredFiles = await this.discoverFiles();

    if (discoveredFiles.length === 0) {
      log.warn('No files found in', this.sourceDir);
      return [];
    }

    log.debug('Found', discoveredFiles.length, 'files');

    const uniquePages = new Map<string, (typeof discoveredFiles)[0]>();
    for (const page of discoveredFiles) {
      if (!uniquePages.has(page.pathname)) {
        uniquePages.set(page.pathname, page);
      }
    }

    log.debug('Processing', uniquePages.size, 'unique pages');

    return Array.from(uniquePages.values()).map((page) => ({
      path: page.pathname,
      filePath: page.filePath,
      source: 'fileBased',
    }));
  }

  private filePathToPathname(filePath: string): string {
    let pathname = filePath.split(path.sep).join('/');

    for (const prefix of artifactPrefixes) {
      if (pathname.startsWith(prefix)) {
        pathname = pathname.substring(prefix.length);
        break;
      }
    }

    pathname = pathname.replace(/\.html?$/, '');

    if (pathname === 'index' || pathname === '') {
      return '/';
    }

    if (pathname.endsWith('/index')) {
      pathname = pathname.slice(0, -5);
    }

    if (!pathname.startsWith('/')) {
      pathname = '/' + pathname;
    }

    return pathname;
  }
}
