import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  target: 'ES2015',
  dts: {
    resolve: true
  },
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom'],
  treeshake: true,
  minify: true,
  injectStyle: true,
  onSuccess: 'node ./build/injectClientHeaders.js',
});
