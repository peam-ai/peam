import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: {
      index: 'src/index.ts',
      client: 'src/client.ts',
      server: 'src/server.ts',
      logger: 'src/logger.ts',
      search: 'src/search.ts',
      builder: 'src/builder.ts',
    },
    format: ['cjs', 'esm'],
    dts: true,
    sourcemap: true,
    clean: true,
    treeshake: true,
    outDir: 'dist',
  },
  {
    entry: { cli: 'src/cli.ts' },
    format: ['cjs'],
    dts: true,
    sourcemap: true,
    clean: false,
    treeshake: true,
    outDir: 'dist',
    banner: {
      js: '#!/usr/bin/env node',
    },
  },
]);
