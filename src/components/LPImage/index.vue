<script lang="ts" setup>
import { isEmpty } from '@iceywu/utils'
import { decode } from 'blurhash'
import * as LivePhotosKit from 'livephotoskit'
import loadErrorData from '~/assets/lottie/img_err.json'
import { getDataUrlFromArr } from '~/utils/blurhash'

interface LPImageProps {
	data: ImgProps
	isNeedLivePhoto?: boolean
	width?: string | number
	height?: string | number
	lazyload?: 'lazy' | 'eager'
	isShowBase?: boolean
	isBlurhashMode?: boolean
	objectFit?: string
}
interface ImgProps {
	file: string
	fileType: string
	thumbnail: string
	videoSrc: string
	blurhash?: string | undefined
	cover?: string
	preSrc?: string
	alt?: string
	src?: string
	baseSrc?: string
}
const {
	data = {
		file: '',
		fileType: '',
		thumbnail: '',
		preSrc: '',
		videoSrc: '',
		cover: '',
		alt: '',
		blurhash: '',
	},
	lazyload = 'lazy',
	objectFit = 'cover',
	width = '100%',
	height = '100%',
	isNeedLivePhoto = true,
	isBlurhashMode = true,
	isShowBase = false,
} = defineProps<LPImageProps>()

const isLoading = ref(true)
const blurNumber = ref(30)
function onLoad(e: any) {
	const eObj = e.target
	const { videoSrc } = imgInfo.value

	setTimeout(() => {
		eObj.style.opacity = 1
		isShowPreImg.value = false
		if (isNeedLivePhoto && videoSrc) {
			initLivePhoto()
		}
	}, 700)
}
const isShowPreImg = ref(true)
// 递减
function decreaseBlurNumber() {
	if (blurNumber.value > 0) {
		blurNumber.value -= 2
	}
 else {
		clearInterval(IntervalObj.value)
	}
}
const IntervalObj = ref<any>(null)
// 开始递减mein
function startDecreaseBlurNumber() {
	if (IntervalObj.value) {
		clearInterval(IntervalObj.value)
	}
	IntervalObj.value = setInterval(() => {
		decreaseBlurNumber()
	}, 100)
}
function onLoadPreImg() {
	if (isBlurhashModeFlag.value) {
		isShowPreImg.value = true
		isLoading.value = false
	}
 else {
		isShowPreImg.value = true
		isLoading.value = false
		startDecreaseBlurNumber()
	}
}
const imgInfo = computed(() => {
	const { fileType, file, cover } = data || {}
	let addInfo = {}
	if (fileType === 'IMAGE') {
		let preSrc = `${file}?x-oss-process=image/resize,l_50`
		let src = `${file}?x-oss-process=image/resize,l_400`
		let baseSrc = file
		const fileSuffix = file.substring(file.lastIndexOf('.'))

		if (fileSuffix.toUpperCase() === '.HEIC') {
			baseSrc = `${file}?x-oss-process=image/format,jpg`
			preSrc = `${file}?x-oss-process=image/resize,l_800/format,jpg`
			src = `${file}?x-oss-process=image/resize,l_800/format,jpg`
		}
		addInfo = {
			src,
			baseSrc,
			preSrc,
		}
	}
 else if (fileType === 'VIDEO') {
		const srcT
			= cover
			|| `${file}?x-oss-process=video/snapshot,t_7000,f_jpg,w_0,h_0,m_fast`
		addInfo = {
			src: srcT,
			baseSrc: srcT,
			preSrc: srcT,
		}
	}
	return {
		...data,
		...addInfo,
		// preSrc: '',
	}
})
onMounted(() => {
	if (isBlurhashModeFlag.value) {
		const hashValue = imgInfo.value.blurhash || ''
		const pixels = decode(hashValue, 32, 32)
		placeholderSrc.value = getDataUrlFromArr(pixels, 32, 32)
	}
 else if (!imgInfo.value.preSrc) {
		isLoading.value = false
		isShowPreImg.value = false
	}
 else {
		isLoading.value = true
		isShowPreImg.value = true
	}
})
const livePhotoRef = ref()
async function initLivePhoto() {
	await nextTick()
	const { videoSrc } = imgInfo.value
	const player = LivePhotosKit.Player(livePhotoRef.value)
	player.photoSrc = showImgSrc.value
	player.videoSrc = videoSrc
}

const placeholderSrc = ref<string | any>()
const isBlurhashModeFlag = computed(() => {
	return isBlurhashMode && !isEmpty(data.blurhash)
})
const loadingImgSrc = computed(() => {
	if (isBlurhashModeFlag.value) {
		return placeholderSrc.value
	}
 else {
		return imgInfo.value.preSrc || imgInfo.value.src
	}
})
const showImgSrc = computed(() => {
	return isShowBase ? imgInfo.value.baseSrc : imgInfo.value.src
})
const loadError = ref(false)
function onLoadErrorPreImg(e: any) {
	console.log('💗onLoadErrorPreImg---------->', e)
	loadError.value = true
}
</script>

<template>
	<div
		class="relative cursor-pointer overflow-hidden"
		:style="{
			height,
			width,
		}"
	>
		<div
			v-show="isLoading"
			class="leff-0 absolute top-0 z-9 h-full w-full bg-[#f5f7fa] dark:bg-[#262727]"
		/>
		<img
			v-show="isShowPreImg"
			:style="{
				filter: `blur(${blurNumber}px)`,
				height,
				width,
			}"
			class="img-base previw-img"
			:src="loadingImgSrc"
			:loading="lazyload"
			@load="onLoadPreImg"
			@error="onLoadErrorPreImg"
		>

		<img
			ref="livePhotoRef"
			class="img-base loaded-img"
			:style="{
				height,
				width,
				objectFit,
			}"
			:loading="lazyload"
			:src="showImgSrc"
			@load="onLoad"
		>
		<div v-if="loadError" class="leff-0 absolute top-0 z-9 h-full w-full fcc">
			<Lottie width="20em" height="20em" :json-data="loadErrorData" />
		</div>
	</div>
</template>

<style lang="less" scoped>
.img-base {
	z-index: 99;
	width: 100%;
	height: 100%;
	object-fit: cover;
	object-position: center;
}
.previw-img {
	filter: blur(40px);
}
.loaded-img {
	opacity: 0;
}
</style>

<style>
.lpk-live-photo-player {
	.lpk-badge {
		top: 15px !important;
		left: 15px !important;
		z-index: 999 !important;
	}
	.lpk-live-photo-renderer {
		height: 100% !important;
		width: 100% !important;
		top: 0 !important;
		left: 0 !important;
		box-shadow: 0px 20px 40px rgba(0, 0, 0, 0.4);
		-webkit-box-shadow: 0px 20px 40px rgba(0, 0, 0, 0.4);
		-moz-box-shadow: 0px 20px 40px rgba(0, 0, 0, 0.4);
		.lpk-video {
			height: calc(100% + 20px) !important;
			width: calc(100% + 20px) !important;
		}
	}
}
.lpk-live-photo-renderer {
	canvas {
		object-fit: cover;
	}
}
</style>
