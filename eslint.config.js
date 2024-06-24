import antfu from '@antfu/eslint-config'

export default antfu(
  {},
  {
    ignores: [
      'dist',
      'node_modules',
      '.output',
      '.nuxt',
      'content/posts',
      'data',
      'uno.config.ts',
    ],
  },
  {
    rules: {
      'node/prefer-global/process': 'off',
      'no-console': 'off',
    },
  },
  {
    files: [
      '*.d.ts',
    ],
    rules: {
      'unused-imports/no-unused-vars': 'off',
      'eslint-comments/no-unlimited-disable': 'off',
    },
  },
)
