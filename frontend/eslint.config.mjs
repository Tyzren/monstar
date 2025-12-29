// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import angular from '@angular-eslint/eslint-plugin';
import angularTemplateParser from '@angular-eslint/template-parser';
import angularTemplate from '@angular-eslint/eslint-plugin-template';
import tsParser from '@typescript-eslint/parser';
import prettierConfig from 'eslint-config-prettier';

export default [
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
    plugins: {
      '@angular-eslint': angular,
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      ...eslint.configs.recommended.rules,
      ...tseslint.configs.recommended.reduce((acc, config) => ({ ...acc, ...config.rules }), {}),
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
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
    files: ['**/*.html'],
    languageOptions: {
      parser: angularTemplateParser,
    },
    plugins: {
      '@angular-eslint/template': angularTemplate,
    },
    rules: {
      '@angular-eslint/template/click-events-have-key-events': 'warn',
      '@angular-eslint/template/interactive-supports-focus': 'warn',
    },
  },
  {
    ignores: [
      'dist/',
      'node_modules/',
      '.angular/',
      'coverage/',
      '*.spec.ts',
      '*.config.js',
      '*.config.mjs',
    ],
  },
  prettierConfig,
];
