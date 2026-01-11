import { defineConfig } from 'tsup';

// IMPORTANT:
// Build all library entrypoints in a single config. When we split into multiple
// configs all writing to the same outDir with `clean: true`, tsup can end up
// deleting artifacts from sibling entries (especially DTS), causing e.g.
// dist/search.d.ts to disappear.
export default defineConfig([
  {
    entry: {
      index: 'src/index.ts',
      client: 'src/client.ts',
      server: 'src/server.ts',
      logger: 'src/logger.ts',
      parser: 'src/parser.ts',
      search: 'src/search.ts',
    },
    format: ['cjs', 'esm'],
    dts: true,
    sourcemap: true,
    clean: true,
    treeshake: true,
    outDir: 'dist',
  },
  // CLI: separate build so we can emit a shebang, but DON'T clean the outDir.
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
