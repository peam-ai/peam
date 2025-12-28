import { NextConfig } from 'next';

export interface PeamAdapterConfig {
  /**
   * Directory where the search index and pages.json will be output
   * @default '.peam'
   */
  outputDir?: string;
}

export const defaultConfig = {
  outputDir: '.peam',
} satisfies PeamAdapterConfig;

export const getConfig = (): Required<PeamAdapterConfig> => {
  return {
    outputDir: (typeof process !== 'undefined' && process.env.PEAM_OUTPUT_DIR) || defaultConfig.outputDir,
  };
};

export function setNextConfig(nextConfig: NextConfig, peamConfig: PeamAdapterConfig): void {
  nextConfig.env = {
    ...nextConfig.env,
    PEAM_OUTPUT_DIR: peamConfig.outputDir,
  };
}
