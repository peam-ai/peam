import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    sourcemap: true,
    clean: true,
    treeshake: true,
    external: ['../dist/peam.adapter.js'],
  },
  {
    entry: ['src/route.ts'],
    format: ['cjs', 'esm'],
    dts: false,
    sourcemap: true,
    clean: true,
    treeshake: true,
  },
  {
    entry: ['src/peam.adapter.ts'],
    format: ['cjs'],
    dts: false,
    sourcemap: false,
    clean: true,
    treeshake: true,
    external: ['@peam-ai/parser', '@peam-ai/search', '@peam-ai/server'],
  },
]);
