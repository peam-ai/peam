import { loggers } from '@peam-ai/logger';
import * as fs from 'fs/promises';
import * as path from 'path';
import type { SearchIndexData } from '../indexBuilder';
import type { SearchIndexExporter } from './SearchIndexExporter';

const log = loggers.search;

export interface FileBasedSearchIndexExporterOptions {
  /**
   * The directory where the index file is located
   */
  baseDir: string;

  /**
   * The path to the index file relative to baseDir
   */
  indexPath: string;
}

/**
 * File-based implementation of SearchIndexExporter
 * Reads and writes search index data to/from a JSON file
 */
export class FileBasedSearchIndexExporter implements SearchIndexExporter {
  private baseDir: string;
  private indexPath: string;
  private cachedData: SearchIndexData | null = null;

  constructor(options: FileBasedSearchIndexExporterOptions) {
    this.baseDir = options.baseDir;
    this.indexPath = options.indexPath;
  }

  private getFullPath(): string {
    return path.join(this.baseDir, this.indexPath);
  }

  private async loadData(): Promise<SearchIndexData | null> {
    if (this.cachedData) {
      return this.cachedData;
    }

    const fullPath = this.getFullPath();

    try {
      const fileContent = await fs.readFile(fullPath, 'utf-8');
      const data = JSON.parse(fileContent) as SearchIndexData;

      if (!data || !data.keys || !Array.isArray(data.keys) || !data.data) {
        log.warn('Invalid search index structure in file:', fullPath);
        return null;
      }

      if (data.keys.length === 0) {
        log.debug('Search index is empty:', fullPath);
        return null;
      }

      this.cachedData = data;
      log.debug('Search index loaded from file:', fullPath, 'with', data.keys.length, 'keys');
      return data;
    } catch (error) {
      log.error('Failed to load search index from file:', fullPath, error);
      return null;
    }
  }

  async import(): Promise<SearchIndexData | null> {
    const data = await this.loadData();
    return data;
  }

  async export(data: SearchIndexData): Promise<void> {
    const fullPath = this.getFullPath();

    try {
      const dir = path.dirname(fullPath);
      await fs.mkdir(dir, { recursive: true });

      await fs.writeFile(fullPath, JSON.stringify(data, null, 2), 'utf-8');

      log.debug('Search index saved to file:', fullPath, 'with', data.keys.length, 'keys');
    } catch (error) {
      log.error('Failed to save search index to file:', fullPath, error);
      throw error;
    }
  }
}
