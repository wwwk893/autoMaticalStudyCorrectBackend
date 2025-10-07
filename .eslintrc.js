module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.base.json'],
    tsconfigRootDir: __dirname
  },
  plugins: ['@typescript-eslint', 'prettier', 'simple-import-sort'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended'
  ],
  rules: {
    'simple-import-sort/imports': 'warn',
    'simple-import-sort/exports': 'warn'
  },
  ignorePatterns: ['dist', 'node_modules']
};
