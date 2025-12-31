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
  /**
   * Whether to respect robots.txt rules when indexing pages
   * @default true
   */
  respectRobotsTxt?: boolean;
  /**
   * Path to a custom robots.txt file relative to the project root
   * If not specified, the adapter will look for static or dynamic robots.txt files in standard locations
   * @example 'custom/robots.txt' or 'config/production-robots.txt'
   * @default undefined
   */
  robotsTxtPath?: string;
  /**
   * Array of wildcard patterns to exclude from indexing
   * Supports * (matches any characters except /), ** (matches any characters including /), and ? (single character)
   * @example ['/admin/**', '/api/*', '/private-*']
   * @default []
   */
  exclude?: string[];
}

export type ResolvedPeamAdapterConfig = Required<Omit<PeamAdapterConfig, 'robotsTxtPath'>> & {
  robotsTxtPath?: string;
};

export const defaultConfig = {
  outputDir: '.peam',
  indexFilename: 'index.json',
  respectRobotsTxt: true,
  robotsTxtPath: undefined,
  exclude: [],
} satisfies PeamAdapterConfig;

export const getConfig = (): ResolvedPeamAdapterConfig => {
  return {
    outputDir: process.env.PEAM_OUTPUT_DIR || defaultConfig.outputDir,
    indexFilename: process.env.PEAM_INDEX_FILENAME || defaultConfig.indexFilename,
    respectRobotsTxt:
      process.env.PEAM_RESPECT_ROBOTS_TXT !== undefined
        ? process.env.PEAM_RESPECT_ROBOTS_TXT === 'true'
        : defaultConfig.respectRobotsTxt,
    robotsTxtPath: process.env.PEAM_ROBOTS_TXT_PATH || defaultConfig.robotsTxtPath,
    exclude: process.env.PEAM_EXCLUDE ? JSON.parse(process.env.PEAM_EXCLUDE) : defaultConfig.exclude,
  };
};

export function setNextConfig(nextConfig: NextConfig, peamConfig: PeamAdapterConfig): void {
  const envVars = {
    PEAM_OUTPUT_DIR: peamConfig.outputDir,
    PEAM_INDEX_FILENAME: peamConfig.indexFilename,
    PEAM_RESPECT_ROBOTS_TXT: String(peamConfig.respectRobotsTxt),
    PEAM_EXCLUDE: JSON.stringify(peamConfig.exclude),
    PEAM_ROBOTS_TXT_PATH: '',
  };

  if (peamConfig.robotsTxtPath) {
    envVars.PEAM_ROBOTS_TXT_PATH = String(peamConfig.robotsTxtPath);
  }

  // Set build time vars
  Object.assign(process.env, envVars);

  // Set runtime vars
  nextConfig.env = {
    ...nextConfig.env,
    ...envVars,
  };
}
