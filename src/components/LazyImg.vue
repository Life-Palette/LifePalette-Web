<script setup lang="ts">
interface Props {
	src: string
	preSrc?: string
	alt?: string
	width?: string | number
	height?: string | number
	lazyload?: 'lazy' | 'eager'
	isImgMode?: boolean
}
withDefaults(defineProps<Props>(), {
	lazyload: 'lazy',
	width: '100%',
	height: '100%',
})
const isLoading = ref(true)
const blurNumber = ref(30)
const onLoad = (e: any) => {
	const eObj = e.target
	setTimeout(() => {
		eObj.style.opacity = 1
		isShowPreImg.value = false
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
onMounted(() => {})
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
			:lazyload="lazyload"
			@load="onLoadPreImg"
		/>
		<img
			class="img-base loaded-img"
			:style="{
				height: height,
				width: width,
			}"
			:lazyload="lazyload"
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
