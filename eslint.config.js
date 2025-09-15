// @ts-check
import antfu from '@antfu/eslint-config'
import oxlint from 'eslint-plugin-oxlint'

export default antfu(
  {
    formatters: true,
  },
  {
    rules: {
			'style/no-tabs': 'off',
			'style/quote-props': 'off',
			'vue/html-indent': 'off',
			'style/indent': 'off',
			'node/prefer-global/process': 'off',
			'node/prefer-global/buffer': 'off',
			'unused-imports/no-unused-vars': 'off',
			// 关闭会导致换行问题的规则
			'vue/singleline-html-element-content-newline': 'off',
			'vue/multiline-html-element-content-newline': 'off',
			'vue/html-closing-bracket-newline': 'off',
			'vue/max-attributes-per-line': 'off',
			'eqeqeq': 'off',
			'style/no-mixed-spaces-and-tabs': 'off',
			'regexp/no-unused-capturing-group': 'off',
			'regexp/no-legacy-features': 'off',
			'no-console': 'off',
			'ts/no-use-before-define': 'off',
			'no-empty': 'off',
			'vue/require-v-for-key': 'off',
			'vue/eqeqeq': 'off',
			'vue/no-unused-refs': 'off',
			'no-case-declarations': 'off',
			'unicorn/prefer-dom-node-text-content': 'off',
			'vue/no-required-prop-with-default': 'off',
			'node/handle-callback-err': 'off',
			'regexp/no-dupe-disjunctions': 'off',
			'vue/no-use-v-if-with-v-for': 'off',
			'ts/no-unsafe-function-type': 'off',
		},
  },
  // 集成 oxlint 插件，自动禁用与 oxlint 冲突的 ESLint 规则
  {
    plugins: {
      oxlint,
    },
    rules: {
      ...oxlint.configs.recommended.rules,
    },
  },
)
