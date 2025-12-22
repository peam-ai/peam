import type { NextConfig } from 'next';
import { PeamAdapterConfig } from './config';

/**
 * Wraps Next.js config to enable Peam content extraction during build.
 *
 * Uses Next.js experimental.adapterPath API to hook into the build process
 * and extract page content after compilation completes.
 *
 * @example
 * ```typescript
 * // next.config.ts
 * import { withPeam } from '@peamjs/next';
 *
 * export default withPeam()({
 *   // your Next.js config
 * });
 * ```
 */
export function withPeam(peamConfig?: PeamAdapterConfig) {
  return function (nextConfig: NextConfig = {}): NextConfig {
    if (peamConfig?.outputDir) {
      process.env.PEAM_OUTPUT_DIR = peamConfig.outputDir;
    }

    return {
      ...nextConfig,
      experimental: {
        ...nextConfig.experimental,
        adapterPath: require.resolve('../dist/peam.adapter.js'),
      },
    };
  };
}
