<script setup>
import { adjustImgData } from '~/utils/tools'

const props = defineProps({
	data: {
		type: Object,
		default: () => {},
	},
	src: {
		type: String,
		default: '',
	},
	isShowPreSrc: {
		type: Boolean,
		default: true,
	},
})

const coverUrl = computed(() => {
	const baseData = adjustImgData(props.data)
	return baseData.cover
})
onMounted(() => {
	// coverUrl.value && console.log(coverUrl.value)
	// console.log(props.data);
})
</script>

<template>
	<div v-if="coverUrl" class="card-box">
		<!-- {{ isShowPreSrc }} -->
		<LazyImg
			:pre-src="isShowPreSrc ? coverUrl.preSrc : null"
			:src="isShowPreSrc ? coverUrl.src : coverUrl.baseSrc"
			:video-src="coverUrl.videoSrc"
		/>
	</div>
</template>

<style lang="less" scoped>
.card-box {
	align-items: center;
	display: flex;
	height: 100%;
	justify-content: center;
	overflow: hidden;
	position: relative;
	width: 100%;
	z-index: 999;

	.mian-img {
		// align-self: flex-start;
		height: 100%;
		// width: 100%;
		object-fit: contain;
	}

	.bg-cover-box {
		bottom: 0;
		left: 0;
		overflow: hidden;
		position: absolute;
		right: 0;
		top: 0;
		z-index: -1;

		.bg-cover-img {
			filter: blur(60px);
			height: 100%;
			width: 100%;
		}

		.cover-box {
			background-color: var(--player-background);
			bottom: 0;
			left: 0;
			position: absolute;
			right: 0;
			top: 0;
		}
	}
}
</style>
