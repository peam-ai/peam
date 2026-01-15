import { NextConfig } from 'next';

export interface PeamAdapterConfig {
  /**
   * Path to the search index file relative to the project root
   * @default '.peam/index.json'
   */
  indexPath?: string;
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
  indexPath: '.peam/index.json',
  respectRobotsTxt: true,
  robotsTxtPath: undefined,
  exclude: [],
} satisfies PeamAdapterConfig;

export const getConfig = (): ResolvedPeamAdapterConfig => {
  return {
    indexPath: process.env.PEAM_INDEX_PATH || defaultConfig.indexPath,
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
    PEAM_INDEX_PATH: peamConfig.indexPath,
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
