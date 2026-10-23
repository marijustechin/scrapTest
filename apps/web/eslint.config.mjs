import { defineConfig, globalIgnores } from 'eslint/config';
import prettier from 'eslint-config-prettier';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.name='require']",
          message: 'ESM only: use `import` instead of `require()`.',
        },
        {
          selector: "MemberExpression[object.name='module'][property.name='exports']",
          message: 'ESM only: use `export` instead of `module.exports`.',
        },
        {
          selector: "Identifier[name='__dirname']",
          message: 'ESM only: use `import.meta.dirname` instead of `__dirname`.',
        },
        {
          selector: "Identifier[name='__filename']",
          message: 'ESM only: use `import.meta.filename` instead of `__filename`.',
        },
      ],
    },
  },
  prettier,
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'node_modules/**']),
]);
