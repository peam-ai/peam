import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: [
      { find: /^@\/ask-ai\//, replacement: `${resolve(__dirname, './src/components/ask-ai')}/` },
      { find: /^@\//, replacement: `${resolve(__dirname, './src')}/` },
    ],
  },
  test: {
    environment: 'happy-dom',
    globals: true,
  },
});
