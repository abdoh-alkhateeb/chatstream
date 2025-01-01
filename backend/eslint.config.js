import importPlugin from 'eslint-plugin-import';
import nodePlugin from 'eslint-plugin-node';
import promisePlugin from 'eslint-plugin-promise';
import jsdocPlugin from 'eslint-plugin-jsdoc';
import securityPlugin from 'eslint-plugin-security';

export default {
  plugins: {
    import: importPlugin,
    node: nodePlugin,
    promise: promisePlugin,
    jsdoc: jsdocPlugin,
    security: securityPlugin,
  },
  languageOptions: {
    globals: {
      node: true,
      es2022: true,
    },
  },
  rules: {
    indent: ['error', 2],
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
    'no-console': 'off',
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'import/no-unresolved': 'error',
    'import/named': 'error',
    'promise/always-return': 'warn',
    'promise/no-return-wrap': 'error',
    'jsdoc/check-alignment': 'warn',
    'jsdoc/check-indentation': 'warn',
    'security/detect-eval-with-expression': 'warn',
    'security/detect-object-injection': 'warn',
    'jsdoc/require-jsdoc': 'off',
  },
};
