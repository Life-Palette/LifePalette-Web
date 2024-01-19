import { decode } from 'blurhash'
import { getDataUrlFromArr } from '~/utils/blurhash'

export default defineComponent({
	inheritAttrs: false,
	props: {
		// img or bg (background)
		mode: {
			type: String,
			default: 'img',
		},
		blurhash: {
			type: String,
			required: false,
		},
		src: {
			type: String,
			required: true,
		},
		srcset: {
			type: String,
			required: false,
		},
	},
	setup(props, { attrs }) {
		const placeholderSrc = ref<string>()
		const isLoaded = ref(false)
		const isImgMode = props.mode === 'img'

		onMounted(() => {
			const img = document.createElement('img')
			img.onload = () => {
				isLoaded.value = true
			}
			img.src = props.src
			if (props.srcset) img.srcset = props.srcset
			setTimeout(() => {
				isLoaded.value = true
			}, 3_000)

			if (props.blurhash) {
				const pixels = decode(props.blurhash, 32, 32)
				placeholderSrc.value = getDataUrlFromArr(pixels, 32, 32)
			}
		})

		const domTag = isImgMode ? 'img' : 'div'

		return () =>
			isLoaded.value || !placeholderSrc.value
				? h(domTag, {
						...attrs,
						...(isImgMode
							? {
									src: props.src,
									srcset: props.srcset,
							  }
							: {
									style: {
										backgroundImage: `url(${props.src})`,
										backgroundSize: 'cover',
									},
							  }),
				  })
				: h(domTag, {
						...attrs,
						...(isImgMode
							? {
									src: placeholderSrc.value,
							  }
							: {
									style: {
										backgroundImage: `url(${placeholderSrc.value})`,
										backgroundSize: 'cover',
									},
							  }),
				  })
	},
})
