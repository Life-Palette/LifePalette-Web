import {
	type CSSObject,
	defineConfig,
	presetAttributify,
	presetIcons,
	presetTypography,
	presetUno,
	transformerCompileClass,
	transformerDirectives,
	transformerVariantGroup,
} from 'unocss'
import { presetUseful } from 'unocss-preset-useful'

const typographyCssExtend: Record<string, CSSObject> = {
	a: {
		display: 'inline-block',
		'line-height': '1.5',
		'border-bottom': '1px dashed rgba(var(--c-context), 0.5)',
		'text-decoration': 'none',
		transition: 'all 0.3s ease-in-out',
	},
	'a:hover': {
		'border-bottom': '1px solid rgba(var(--c-context), 1)',
	},
	pre: {
		background: '#eee !important',
		'font-family': 'dm',
	},
	'.dark pre': {
		background: '#222 !important',
	},
	blockquote: {
		'border-left': '0.1em solid rgba(168,85,247,.4)',
	},
}

export default defineConfig({
	rules: [],
	shortcuts: [
		['text', 'text-primary-text'],
		['bg', 'bg-primary-bg'],
		// ['u-prose', 'prose prose-reading'],

		['linear-text', 'text-transparent bg-clip-text bg-gradient-to-r'],
		['text-p-r', 'linear-text from-purple to-red'], // test case

		[
			'btn',
			'hover-scale-101 hover-shadow-xl inline-block cursor-pointer rounded from-[#4facfe]  to-[#00f2fe] bg-gradient-to-r px-8 py-2 text-sm font-medium text-white transition !border-0 !outline-none disabled:cursor-default disabled:bg-gray-600 disabled:opacity-50',
		],

		[
			'icon-btn',
			'text-[1.2em] inline-block cursor-pointer select-none opacity-75 transition duration-200 ease-in-out hover:opacity-100 hover:text-sky-400 hover:scale-130 !outline-none',
		],
		[
			'icon-link',
			'color-inherit op64 hover:op100 hover-text-sky-600 dark-hover-color-inherit',
		],
		[
			'icon-text',
			'color-inherit op64 hover:op100 hover-text-purple dark-hover-color-inherit',
		],
		['linkInProse', 'trans c-context'],

		[
			'header-anchor',
			'float-left mt-[0.125em] ml-[-0.8em] pr-[0.2em] text-[0.85em] op-0 group-hover-op-60 fw-600',
		],

		[/^badge-(.*)$/, ([, c]) => `bg-${c}4:10 text-${c}5 rounded`],
		[/^badge-xs-(.*)$/, ([, c]) => `badge-${c} text-xs px2 py0.5`],
		[/^badge-sm-(.*)$/, ([, c]) => `badge-${c} text-sm px3 py0.6`],
		[/^badge-lg-(.*)$/, ([, c]) => `badge-${c} px3 py0.8`],
		[
			/^badge-square-(.*)$/,
			([, c]) =>
				`badge-${c} w-7 h-7 text-lg font-200 flex flex-none items-center justify-center`,
		],
	],
	theme: {
		animation: {
			keyframes: {
				shape:
					'{0%,100%{border-radius: 42% 58% 70% 30% / 45% 45% 55% 55%;transform: translate3d(0,0,0) rotateZ(0.01deg);}34%{border-radius: 70% 30% 46% 54% / 30% 29% 71% 70%;transform:  translate3d(0,5px,0) rotateZ(0.01deg);}50%{transform: translate3d(0,0,0) rotateZ(0.01deg);}67%{border-radius: 100% 60% 60% 100% / 100% 100% 60% 60% ;transform: translate3d(0,-3px,0) rotateZ(0.01deg);}}',
			},
		},
		fontFamily: {
			dm: 'dm',
			craft: 'MonoCraft',
		},
		colors: {
			bg_color: 'var(--el-bg-color)',
			context: 'rgba(var(--c-context),%alpha)',
			primary: {
				DEFAULT: 'rgba(var(--text),%alpha)',
				text: 'rgba(var(--text),%alpha)',
				bg: 'rgba(var(--bg),%alpha)',
			},
			level: {
				0: 'var(--gc-level-0)',
				1: 'var(--gc-level-1)',
				2: 'var(--gc-level-2)',
				3: 'var(--gc-level-3)',
				4: 'var(--gc-level-4)',
			},
		},

	},
	presets: [
		presetAttributify(),
		presetIcons({
			scale: 1.2,
		}),
		presetUno(),
		presetTypography(),
		presetUseful({
			icons: {
				extraProperties: {
					display: 'inline-block',
					height: '1.2em',
					width: '1.2em',
					'vertical-align': 'text-bottom',
				},
			},
			typography: { cssExtend: typographyCssExtend },
		}),
	],
	transformers: [
		transformerDirectives(),
		transformerVariantGroup(),
		transformerCompileClass(),
	],
	safelist: [
		Array.from({ length: 5 }, (j, i) => `fill-level-${i}`),
		'sm-fsc max-w-75'.split(' '),
	].flat(),
})
