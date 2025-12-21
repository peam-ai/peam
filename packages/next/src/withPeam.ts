import type { NextConfig } from 'next';

export interface PeamNextConfig {
  siteUrl?: string | 'auto'
  output?: string
}

const DEFAULTS: Required<PeamNextConfig> = {
  siteUrl: 'auto',
  output: 'src/peam',
}

export function withPeam(userConfig: PeamNextConfig = {}) {
  const config = { ...DEFAULTS, ...userConfig }

  if (
    config.siteUrl !== 'auto' &&
    typeof config.siteUrl !== 'string'
  ) {
    throw new Error(
      '[peam] siteUrl must be "auto" or a string'
    )
  }

  if (!config.output) {
    throw new Error('[peam] output path is required')
  }

  return function withPeamNext(
    nextConfig: NextConfig = {}
  ): NextConfig {
    return {
      ...nextConfig,

      /**
       * Expose Peam config to:
       * - CLI (build time)
       * - CI (Vercel)
       *
       * This does NOT expose anything to the browser.
       */
      env: {
        ...nextConfig.env,
        PEAM_SITE_URL: config.siteUrl,
        PEAM_OUTPUT_DIR: config.output,
        PEAM_FRAMEWORK: 'next',
      },
    }
  }
}
