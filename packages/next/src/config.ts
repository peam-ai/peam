import { NextConfig } from 'next';

export interface PeamAdapterConfig {
  /**
   * Directory where the search index and pages.json will be output
   * @default '.peam'
   */
  outputDir?: string;
  /**
   * Filename for the search index
   * @default 'index.json'
   */
  indexFilename?: string;
}

export const defaultConfig = {
  outputDir: '.peam',
  indexFilename: 'index.json',
} satisfies PeamAdapterConfig;

export const getConfig = (): Required<PeamAdapterConfig> => {
  return {
    outputDir: process.env.PEAM_OUTPUT_DIR || defaultConfig.outputDir,
    indexFilename: process.env.PEAM_INDEX_FILENAME || defaultConfig.indexFilename,
  };
};

export function setNextConfig(nextConfig: NextConfig, peamConfig: PeamAdapterConfig): void {
  nextConfig.env = {
    ...nextConfig.env,
    PEAM_OUTPUT_DIR: peamConfig.outputDir,
    PEAM_INDEX_FILENAME: peamConfig.indexFilename,
  };
}
