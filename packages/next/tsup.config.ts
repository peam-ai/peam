import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    sourcemap: true,
    target: 'es2020',
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
    target: 'es2020',
  },
  {
    entry: ['src/peam.adapter.ts'],
    format: ['cjs'],
    dts: false,
    sourcemap: false,
    target: 'es2020',
    clean: true,
    treeshake: true,
    external: ['@peam/parser', '@peam/search', '@peam/server'],
    esbuildOptions(options) {
      options.footer = {
        js: 'module.exports = peam_adapter_default;',
      };
    },
  },
]);
