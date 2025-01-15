<script lang="ts" setup>
import Dialog from '@/components/Dialog.vue'
import { useFlipDialog } from '@/hooks/useFlipDialog'
import { nextTick, ref } from 'vue'

const route = useRoute()
const router = useRouter()
const { showMask, openDialog, closeDialog, mediaWidth, chooseImage } = useFlipDialog()

const list = ref([
	{
		file: 'http://nest-js.oss-accelerate.aliyuncs.com/nestTest/noId/_DSC0368.JPG',
		fileType: 'IMAGE',
		thumbnail:
			'http://nest-js.oss-accelerate.aliyuncs.com/nestTest/noId/_DSC0368.JPG?x-oss-process=image/resize,l_500',
	},
	{
    'file': 'http://nest-js.oss-accelerate.aliyuncs.com/nestTest/1/1730813577326.jpg',
    'fileType': 'IMAGE',
    'videoSrc': null,
    'thumbnail': 'http://nest-js.oss-accelerate.aliyuncs.com/nestTest/1/1730813577326.jpg?x-oss-process=image/resize,l_500',
},
	{
		file: 'http://nest-js.oss-accelerate.aliyuncs.com/nestTest/1/1710336302522.JPG',
		fileType: 'IMAGE',
		thumbnail:
			'http://nest-js.oss-accelerate.aliyuncs.com/nestTest/1/1710336302522.JPG?x-oss-process=image/resize,l_500',
	},
	{
		file: 'http://nest-js.oss-accelerate.aliyuncs.com/nestTest/1/1710336303551.JPG',
		fileType: 'IMAGE',
		thumbnail:
			'http://nest-js.oss-accelerate.aliyuncs.com/nestTest/1/1710336303551.JPG?x-oss-process=image/resize,l_500',
	},

])
function handleClick(e: MouseEvent, item: any) {
	const { file, id } = item
	openDialog(e, file)
	router.push(`/test?${id}`)
}
function handleClose() {
	closeDialog()
	router.back()
}
onMounted(() => {
	console.log('🌈------------------------------>')
})
</script>

<template>
	<div class="animation-page">
		<div class="left-side" />
		<div class="flip-animation">
			<div
				v-for="(item, index) in list"
				:key="index"
				class="flip-card"
				@click="(e) => handleClick(e, item)"
			>
			{{ mediaWidth }}
				<img :src="item.file" alt="">
			</div>
		</div>
		<Dialog
			v-if="showMask"
			:media-width="mediaWidth"
			:image-url="chooseImage"
			@close="handleClose"
		/>
	</div>
</template>

<style scoped>
.animation-page {
	display: flex;
	align-content: flex-start;
	width: 1650px;
	margin: 0 auto;
	padding-top: 120px;
	.left-side {
		width: 260px;
	}
	.flip-animation {
		display: grid;
		grid-template-columns: repeat(5, 250px);
		grid-gap: 10px;
	}
}
.flip-card {
	> img {
		width: 100%;
		border-radius: 20px;
	}
}
.dialog {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: transparent;
	transition: background-color 0.4s;
	z-index: 9999;
	.dialog-content {
		display: flex;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%) scale(1);
		height: calc(100% - 64px);
		background-color: #fff;
		border-radius: 20px;
		overflow: visible;
		.left-container {
			flex-shrink: 0;
			flex-grow: 0;
			height: 100%;
			border-radius: 20px 0 0 20px;
			overflow: hidden;
			img {
				max-width: 100%;
				max-height: 100%;
				object-fit: contain;
			}
		}
		.right-container {
			width: 440px;
			flex-shrink: 0;
			flex-grow: 1;
			border-radius: 0 20px 20px 0;
			overflow: hidden;
			padding: 10px;
			img {
				max-width: 100%;
				max-height: 100%;
				object-fit: contain;
			}
		}
	}
}
</style>

<route lang="json">
{
	"meta": {
		"title": "Test",
		"layout": "noCom"
	}
}
</route>
