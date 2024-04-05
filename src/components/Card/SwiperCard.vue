<template>
	<div v-if="coverUrl" class="card-box">
		<ImgCard :data="data" :is-show-pre-src="false" class="max-w-[80%]" />
		<div class="bg-cover-box">
			<img class="mian-img bg-cover-img" :src="coverUrl" />
			<div class="cover-box"></div>
		</div>
	</div>
</template>

<script setup>
import ImgCard from '~/components/Card/ImgCard.vue'
const props = defineProps({
	data: {
		type: Object,
		default: () => {},
	},
})
console.log()

// eslint-disable-next-line vue/return-in-computed-property
const coverUrl = computed(() => {
	const fileTemp = props.data || {}

	const { fileType, file, cover = 'IMAGE' } = fileTemp || {}
	if (fileType === 'IMAGE') {
		return file || ''
	} else if (fileType === 'VIDEO') {
		return cover || ''
	}
})
onMounted(() => {
	// console.log(props.data);
	// 创建
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
	max-height: 100vh;
	height: 100vh;
	.mian-img {
		align-self: flex-start;
		height: 100%;
		object-fit: cover;
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
