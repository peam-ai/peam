import { NextConfig } from 'next';
import { createExporterFromConfig, type SearchExporterConfig, type SearchIndexExporter } from 'peam/search';

export interface PeamConfig {
  /**
   * Search exporter configuration
   * @default { type: 'fileBased', config: { indexPath: '.peam/index.json' } }
   */
  searchExporter?: SearchExporterConfig;
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

export type ResolvedPeamAdapterConfig = Required<Omit<PeamConfig, 'robotsTxtPath'>> & {
  robotsTxtPath?: string;
  searchIndexExporter: SearchIndexExporter;
};

const defaultConfig = {
  searchExporter: {
    type: 'fileBased' as const,
    config: { indexPath: '.peam/index.json' },
  },
  respectRobotsTxt: true,
  robotsTxtPath: undefined,
  exclude: [],
} satisfies PeamConfig;

export function setNextConfig(nextConfig: NextConfig, peamConfig?: PeamConfig): void {
  const envVars = {
    PEAM_SEARCH_EXPORTER_TYPE: peamConfig?.searchExporter?.type ?? defaultConfig.searchExporter.type,
    PEAM_SEARCH_EXPORTER_CONFIG:
      JSON.stringify(peamConfig?.searchExporter?.config) ?? JSON.stringify(defaultConfig.searchExporter.config),
    PEAM_RESPECT_ROBOTS_TXT: String(peamConfig?.respectRobotsTxt ?? defaultConfig.respectRobotsTxt),
    PEAM_EXCLUDE: JSON.stringify(peamConfig?.exclude) ?? JSON.stringify(defaultConfig.exclude),
    PEAM_ROBOTS_TXT_PATH: '',
  };

  if (peamConfig?.robotsTxtPath) {
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

export const getConfig = (): ResolvedPeamAdapterConfig => {
  if (!process.env.PEAM_SEARCH_EXPORTER_TYPE || !process.env.PEAM_SEARCH_EXPORTER_CONFIG) {
    throw new Error(
      'Peam configuration not found. Make sure withPeam() is properly configured in your next.config file.'
    );
  }

  const searchExporterConfig: SearchExporterConfig = {
    type: process.env.PEAM_SEARCH_EXPORTER_TYPE as SearchExporterConfig['type'],
    config: JSON.parse(process.env.PEAM_SEARCH_EXPORTER_CONFIG),
  };

  const resolvedConfig = {
    searchExporter: searchExporterConfig,
    searchIndexExporter: createExporterFromConfig(searchExporterConfig),
    respectRobotsTxt: process.env.PEAM_RESPECT_ROBOTS_TXT === 'true',
    robotsTxtPath: process.env.PEAM_ROBOTS_TXT_PATH || undefined,
    exclude: process.env.PEAM_EXCLUDE ? JSON.parse(process.env.PEAM_EXCLUDE) : [],
  };

  return resolvedConfig;
};
