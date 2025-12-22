import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    sourcemap: true,
  },
  {
    entry: ['src/adapter.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    sourcemap: true,
  },
  {
    entry: ['src/peam.adapter.ts'],
    format: ['cjs'],
    dts: false,
    sourcemap: false,
    outExtension: () => ({ js: '.js' }),
    banner: {
      js: '// @ts-nocheck',
    },
    esbuildOptions(options) {
      options.footer = {
        js: 'module.exports = peam_adapter_default;',
      };
    },
  },
]);
