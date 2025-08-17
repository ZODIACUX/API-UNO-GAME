module.exports = {
  parser: '@babel/eslint-parser',
  env: {
    node: true,
    es2021: true,
    jest: true
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    requireConfigFile: false,
    babelOptions: {
      plugins: [
        ['@babel/plugin-proposal-decorators', { legacy: true }],
        ['@babel/plugin-proposal-class-properties']
      ]
    }
  },
  rules: {
    'semi': ['error', 'never'],
    'quotes': ['error', 'single'],
    'indent': ['error', 2],
    'no-trailing-spaces': 'error',
    'eol-last': ['error', 'always'],
    'no-unused-vars': ['error', {
      'argsIgnorePattern': '^_',
      'varsIgnorePattern': '^_'
    }]
  }
}
