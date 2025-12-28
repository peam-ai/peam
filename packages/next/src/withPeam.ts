import type { NextConfig } from 'next';
import { defaultConfig, PeamAdapterConfig, setNextConfig } from './config';

/**
 * Wraps Next.js config to enable Peam content extraction during build.
 *
 * @example
 * ```typescript
 * // next.config.ts
 * import { withPeam } from '@peam/next';
 *
 * export default withPeam()({
 *   // your Next.js config
 * });
 * ```
 */
export function withPeam(peamConfig?: PeamAdapterConfig) {
  return function (nextConfig: NextConfig = {}): NextConfig {
    const config = {
      ...defaultConfig,
      ...peamConfig,
    };

    setNextConfig(nextConfig, config);

    return {
      ...nextConfig,
      experimental: {
        ...nextConfig.experimental,
        adapterPath: require.resolve('../dist/peam.adapter.js'),
      },
    };
  };
}
