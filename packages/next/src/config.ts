import { NextConfig } from 'next';
import { createStoreFromConfig, type SearchIndexStore, type SearchStoreConfig } from 'peam/search';

export interface PeamConfig {
  /**
   * Search store configuration
   * @default { type: 'fileBased', config: { indexPath: '.peam/index.json' } }
   */
  searchStore?: SearchStoreConfig;

  /**
   * Path to a custom robots.txt file or false to disable robots.txt filtering
   * If undefined, the adapter will look for static or dynamic robots.txt files in standard locations
   * @example 'custom/robots.txt' or 'config/production-robots.txt'
   * @default undefined
   */
  robotsTxt?: string | boolean;

  /**
   * Array of wildcard patterns to exclude from indexing
   * Supports * (matches any characters except /), ** (matches any characters including /), and ? (single character)
   * @example ['/admin/**', '/api/*', '/private-*']
   * @default []
   */
  exclude?: string[];
}

export type ResolvedPeamAdapterConfig = Required<Omit<PeamConfig, 'robotsTxt'>> & {
  robotsTxt?: string | boolean;
  searchIndexStore: SearchIndexStore;
};

const defaultConfig = {
  searchStore: {
    type: 'fileBased' as const,
    config: { indexPath: '.peam/index.json' },
  },
  robotsTxt: undefined,
  exclude: [],
} satisfies PeamConfig;

export function setNextConfig(nextConfig: NextConfig, peamConfig?: PeamConfig): void {
  const envVars = {
    PEAM_SEARCH_STORE: JSON.stringify(peamConfig?.searchStore ? peamConfig.searchStore : defaultConfig.searchStore),
    PEAM_EXCLUDE: JSON.stringify(peamConfig?.exclude ? peamConfig.exclude : defaultConfig.exclude),
    PEAM_ROBOTS_TXT: '',
  };

  if (peamConfig?.robotsTxt !== undefined) {
    envVars.PEAM_ROBOTS_TXT = String(peamConfig.robotsTxt);
  }

  // Set build time vars
  Object.assign(process.env, envVars);

  // Set runtime vars
  nextConfig.env = {
    ...nextConfig.env,
    ...envVars,
  };
}

export const getConfig = (): ResolvedPeamAdapterConfig => {
  if (!process.env.PEAM_SEARCH_STORE) {
    throw new Error(
      'Peam configuration not found. Make sure withPeam() is properly configured in your next.config file.'
    );
  }

  const searchStoreConfig: SearchStoreConfig = JSON.parse(process.env.PEAM_SEARCH_STORE);

  const resolvedConfig = {
    searchStore: searchStoreConfig,
    searchIndexStore: createStoreFromConfig(searchStoreConfig),
    robotsTxt: parseRobotsTxtEnv(process.env.PEAM_ROBOTS_TXT),
    exclude: process.env.PEAM_EXCLUDE ? JSON.parse(process.env.PEAM_EXCLUDE) : [],
  };

  return resolvedConfig;
};

function parseRobotsTxtEnv(value: string | undefined): string | boolean | undefined {
  if (value === undefined || value === '') return undefined;
  if (value === 'false') return false;
  if (value === 'true') return true;
  return value;
}
