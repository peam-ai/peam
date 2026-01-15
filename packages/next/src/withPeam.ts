import type { NextConfig } from 'next';
import { PeamConfig, setNextConfig } from './config';

/**
 * Wraps Next.js config to enable Peam content extraction during build.
 *
 * @example
 * ```typescript
 * // next.config.ts
 * import { withPeam } from '@peam-ai/next';
 *
 * export default withPeam()({
 *   // your Next.js config
 * });
 * ```
 */
export function withPeam(peamConfig?: PeamConfig) {
  return function (nextConfig: NextConfig = {}): NextConfig {
    setNextConfig(nextConfig, peamConfig);

    return {
      ...nextConfig,
      experimental: {
        ...nextConfig.experimental,
        adapterPath: require.resolve('../dist/peam.adapter.js'),
      },
    };
  };
}
