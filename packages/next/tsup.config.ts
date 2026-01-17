import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    sourcemap: true,
    clean: true,
    treeshake: true,
    splitting: false,
    external: ['../dist/peam.adapter.js'],
  },
  {
    entry: ['src/route.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    sourcemap: true,
    clean: true,
    treeshake: true,
    splitting: false,
  },
  {
    entry: ['src/peam.adapter.ts'],
    format: ['cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    treeshake: true,
    splitting: false,
    external: ['@peam-ai/parser', '@peam-ai/search', '@peam-ai/server'],
  },
]);
