// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Allow non-null assertions for utility functions
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
  {
    // Relax rules for docs-globals.d.ts - it's intentionally liberal with types
    files: ['src/docs-globals.d.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
