module.exports = {
  root: true,
  env: { browser: true, es2020: true, node: true, jest: true },
  extends: [
    'eslint:recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', 'node_modules', '.github'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  plugins: ['react-refresh'],
  rules: {
    'no-unused-vars': 'off',
    'no-empty': 'off',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
  },
};
