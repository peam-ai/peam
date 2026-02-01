import withPeam from '@peam-ai/next';
import { createMDX } from 'fumadocs-mdx/next';
import type { NextConfig } from 'next';

const withMDX = createMDX();

const config: NextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/docs/:path*',
          destination: '/llms.mdx/:path*',
          has: [
            {
              type: 'header',
              key: 'Accept',
              // Have text/markdown or text/plain but before any text/html
              // Note, that Claude Code currently requests text/plain
              value: '(?=.*(?:text/plain|text/markdown))(?!.*text/html.*(?:text/plain|text/markdown)).*',
            },
          ],
        },
      ],
      afterFiles: [
        {
          source: '/docs/:path*.(mdx|md)',
          destination: '/llms.mdx/:path*',
        },
      ],
    };
  },
  redirects: () => {
    return [
      {
        source: '/err/:slug',
        destination: '/docs/errors/:slug',
        permanent: true,
      },
    ];
  },
};

export default withPeam({
  exclude: ['/api/*'],
})(withMDX(config)) as NextConfig;
