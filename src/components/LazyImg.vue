<script setup lang="ts">
import * as LivePhotosKit from 'livephotoskit'
interface Props {
	src: string
	preSrc?: string
	alt?: string
	videoSrc?: string
	width?: string | number
	height?: string | number
	lazyload?: 'lazy' | 'eager'
	isImgMode?: boolean
	isNeedLivePhoto?: boolean
}
const props = withDefaults(defineProps<Props>(), {
	preSrc: '',
	alt: '',
	videoSrc: '',
	lazyload: 'lazy',
	width: '100%',
	height: '100%',
	isNeedLivePhoto: true,
})
const isLoading = ref(true)
const blurNumber = ref(30)
const onLoad = (e: any) => {
	const eObj = e.target
	const { isNeedLivePhoto, videoSrc } = props
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
const decreaseBlurNumber = () => {
	if (blurNumber.value > 0) {
		blurNumber.value -= 2
	} else {
		clearInterval(IntervalObj.value)
	}
}
const IntervalObj = ref<any>(null)
// 开始递减mein
const startDecreaseBlurNumber = () => {
	if (IntervalObj.value) {
		clearInterval(IntervalObj.value)
	}
	IntervalObj.value = setInterval(() => {
		decreaseBlurNumber()
	}, 100)
}
const onLoadPreImg = () => {
	isShowPreImg.value = true
	isLoading.value = false
	startDecreaseBlurNumber()
}
onMounted(() => {
	if (!props.preSrc) {
		isLoading.value = false
		isShowPreImg.value = false
	} else {
		isLoading.value = true
		isShowPreImg.value = true
	}
})
const livePhotoRef = ref()
const initLivePhoto = async () => {
	await nextTick()
	const { src, videoSrc } = props
	const player = LivePhotosKit.Player(livePhotoRef.value)
	player.photoSrc = src
	player.videoSrc = videoSrc
}
</script>

<template>
	<div
		class="relative cursor-pointer overflow-hidden"
		:style="{
			height: height,
			width: width,
		}"
	>
		<div
			v-show="isLoading"
			class="leff-0 absolute top-0 z-9 h-full w-full bg-[#f5f7fa] dark:bg-[#262727]"
		></div>
		<img
			v-show="isShowPreImg"
			:style="{
				filter: 'blur(' + blurNumber + 'px)',
				height: height,
				width: width,
			}"
			class="img-base previw-img"
			:src="preSrc"
			:loading="lazyload"
			@load="onLoadPreImg"
		/>

		<img
			ref="livePhotoRef"
			class="img-base loaded-img"
			:style="{
				height: height,
				width: width,
			}"
			:loading="lazyload"
			:src="src"
			@load="onLoad"
		/>
	</div>
</template>

<style lang="less" scoped>
.img-base {
	z-index: 1;
	width: 100%;
	height: 100%;
	object-fit: cover;
	object-position: center;
	// transition: all 0.3s ease-in-out;
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
		z-index: 999999 !important;
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
</style>
