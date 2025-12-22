export interface PeamAdapterConfig {
  outputDir: string;
}

export const defaultConfig: PeamAdapterConfig = {
  outputDir: '.peam',
};

export const config = () => {
  return {
    ...defaultConfig,
    outputDir: process.env.PEAM_OUTPUT_DIR || defaultConfig.outputDir,
  };
};
