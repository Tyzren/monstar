import js from '@eslint/js';
import globals from 'globals';
import importPlugin from 'eslint-plugin-import';
import prettierConfig from 'eslint-config-prettier';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
  js.configs.recommended,
  // Global ignores
  {
    ignores: [
      'eslint.config.mjs',
      'node_modules/',
      'dist/',
      'build/',
      'tests/',
    ],
  },
  // Configuration for CommonJS files (.js, .cjs)
  {
    files: ['**/*.js', '**/*.cjs'],
    plugins: {
      import: importPlugin,
    },
    languageOptions: {
      globals: globals.node,
      sourceType: 'commonjs',
    },
    rules: {
      'import/order': [
        'error',
        {
          groups: [
            'builtin', // Node.js built-in modules
            'external', // npm packages
            'internal', // @alias imports
            'parent', // ../
            'sibling', // ./
            'index', // ./index
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js', '.mjs', '.cjs'],
        },
      },
      'import/internal-regex':
        '^@(models|routes|middleware|utils|infra|services|constants|docs)/',
    },
  },
  // Configuration for TypeScript files (.ts)
  {
    files: ['**/*.ts'],
    plugins: {
      '@typescript-eslint': tseslint,
      import: importPlugin,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
      },
      globals: globals.node,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.ts', '.js', '.mjs', '.cjs'],
        },
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
      'import/internal-regex':
        '^@(models|routes|middleware|utils|infra|services|constants|docs)/',
    },
  },
  prettierConfig,
];
