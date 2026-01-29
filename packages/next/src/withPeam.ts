import type { NextConfig } from 'next';
import { createRequire } from 'node:module';
import * as path from 'path';
import { loggers } from 'peam/logger';
import { getConfig, PeamConfig, setNextConfig } from './config';

const require = createRequire(process.cwd() + '/');
const log = loggers.next;
const isProd = process.env.NODE_ENV === 'production';

function getNextVersion(): { major: number; minor: number } | undefined {
  try {
    const [major, minor] = require('next/package.json').version.split('.', 2).map(Number);

    return { major, minor };
  } catch (error) {
    log.error('Could not resolve Next.js version.', error);
    return undefined;
  }
}

function addStubIndex() {
  try {
    if (!isProd) {
      return;
    }

    const config = getConfig();

    if (config.searchStore?.type !== 'fileBased') {
      return;
    }

    const stubData = { keys: [], data: {} };
    config.searchIndexStore.exportSync?.(stubData, { override: false });
  } catch (error) {
    log.error('Failed to create stub index:', error);
  }
}

function addAdapter(config: NextConfig): NextConfig {
  const nextVersion = getNextVersion();

  if (!nextVersion || nextVersion.major < 16) {
    log.warn(
      'Peam adapter requires Next.js 16 or higher, skipping adapter configuration. Make sure the postbuild script is set up correctly, See more here: https://peam.ai/docs.'
    );
    return config;
  }

  return {
    ...config,
    experimental: {
      ...config.experimental,
      adapterPath: require.resolve(path.join(__dirname, 'peam.adapter.js')),
    },
  };
}

function addOutputFileTracing(nextConfig: NextConfig): NextConfig {
  const peamConfig = getConfig();

  if (peamConfig.searchStore?.type !== 'fileBased') {
    return nextConfig;
  }

  nextConfig = { ...nextConfig };

  const storeConfig = peamConfig.searchStore.config;
  const indexPath = storeConfig.indexPath ?? '.peam/index.json';
  const indexDir = path.dirname(indexPath);
  const tracingConfig = {
    '/api/peam': [`./${indexDir}/**/*`],
  };

  const nextVersion = getNextVersion();

  if (!nextVersion) {
    log.warn(
      'Could not determine Next.js version. Adding outputFileTracingIncludes to both experimental and root config.'
    );

    // Add to experimental (for Next.js 14.x)
    const existingExperimentalTracing =
      typeof nextConfig.experimental === 'object' && 'outputFileTracingIncludes' in nextConfig.experimental
        ? nextConfig.experimental.outputFileTracingIncludes
        : undefined;

    if (!nextConfig.experimental) {
      nextConfig.experimental = {};
    }

    Object.assign(nextConfig.experimental, {
      outputFileTracingIncludes: {
        ...(existingExperimentalTracing || {}),
        ...tracingConfig,
      },
    });

    // Add to root (for Next.js 15+)
    const existingRootTracing = nextConfig.outputFileTracingIncludes ?? {};

    Object.assign(nextConfig, {
      outputFileTracingIncludes: {
        ...existingRootTracing,
        ...tracingConfig,
      },
    });
  } else if (nextVersion.major < 15) {
    // For Next.js 14.x, add outputFileTracingIncludes in experimental
    const existingTracing =
      typeof nextConfig.experimental === 'object' && 'outputFileTracingIncludes' in nextConfig.experimental
        ? nextConfig.experimental.outputFileTracingIncludes
        : undefined;

    if (!nextConfig.experimental) {
      nextConfig.experimental = {};
    }

    Object.assign(nextConfig.experimental, {
      outputFileTracingIncludes: {
        ...(existingTracing || {}),
        ...tracingConfig,
      },
    });
  } else {
    // For Next.js 15+, add outputFileTracingIncludes at root
    const existingTracing = nextConfig.outputFileTracingIncludes ?? {};

    Object.assign(nextConfig, {
      outputFileTracingIncludes: {
        ...existingTracing,
        ...tracingConfig,
      },
    });
  }

  return nextConfig;
}

/**
 * Wraps Next.js config to enable Peam content extraction during build.
 *
 * @example
 * ```typescript
 * // next.config.ts
 * import withPeam from '@peam-ai/next';
 *
 * export default withPeam()({
 *   // your Next.js config
 * });
 * ```
 *
 * Or with `require()`:
 * ```javascript
 * // next.config.js
 * const withPeam = require('@peam-ai/next');
 *
 * module.exports = withPeam()({
 *   // your Next.js config
 * });
 * ```
 */
export function withPeam(peamConfig?: PeamConfig) {
  return function (nextConfig: NextConfig = {}): NextConfig {
    setNextConfig(nextConfig, peamConfig);
    addStubIndex();

    let updatedNextConfig: NextConfig = { ...nextConfig };
    updatedNextConfig = addAdapter(updatedNextConfig);
    updatedNextConfig = addOutputFileTracing(updatedNextConfig);

    return updatedNextConfig;
  };
}

export default withPeam;
