<template>
	<div v-if="coverUrl" class="card-box">
		<LazyImg :pre-src="coverUrl.preSrc" :src="coverUrl.src"></LazyImg>
	</div>
</template>

<script setup>
const props = defineProps({
	data: {
		type: Object,
		default: () => {},
	},
	src: {
		type: String,
		default: '',
	},
})

const coverUrl = computed(() => {
	if (props.src) {
		return props.src
	}
	const fileTemp = props.data || {}

	const { fileType, file, cover, thumbnail } = fileTemp || {}
	if (fileType === 'IMAGE') {
		const preSrc = file + '?x-oss-process=image/resize,l_50'
		// const src = file + '?x-oss-process=image/resize,l_400'
		const src = file
		return {
			src,
			preSrc,
		}
	} else if (fileType === 'VIDEO') {
		// const preSrc = cover + '?x-oss-process=image/resize,l_500'
		// console.log('🐬-----cover-----', cover);
		// const srcT = cover + '?x-oss-process=image/resize,l_450'
		const srcT =
			cover ||
			`${file}?x-oss-process=video/snapshot,t_7000,f_jpg,w_0,h_0,m_fast`
		return {
			src: srcT,
			preSrc: srcT,
		}
	}
})
onMounted(() => {
	// coverUrl.value && console.log(coverUrl.value)
	// console.log(props.data);
})
</script>

<style lang="less" scoped>
.card-box {
	align-items: center;
	display: flex;
	height: 100%;
	justify-content: center;
	overflow: hidden;
	position: relative;
	width: 100%;
	z-index: 0;

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
