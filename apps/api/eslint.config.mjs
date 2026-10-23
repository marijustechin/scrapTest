import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**', 'src/generated/**', 'eslint.config.mjs'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.lint.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-extraneous-class': 'off',
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: { arguments: false } },
      ],
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
);
