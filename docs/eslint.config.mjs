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
      // Allow non-null assertions in docs code
      '@typescript-eslint/no-non-null-assertion': 'off',
      // Allow unused vars with underscore prefix
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    // Relax rules for certain files
    files: ['lib/tsdoc/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    // Ignore generated, build files, and config files
    ignores: ['.next/**', '.source/**', 'out/**', 'dist/**', 'node_modules/**', '*.config.mjs', 'postcss.config.mjs'],
  },
];
