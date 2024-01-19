<script setup>
import ImgCard from '~/components/Card/ImgCard.vue'
const props = defineProps({
	fileUrl: {
		type: String,
		default: '',
	},
	data: {
		type: Object,
		default: () => {},
	},
	isDetail: {
		type: Boolean,
		default: false,
	},
})

onMounted(() => {
	console.log('MyComponent Mounted')
})
const isactive = ref(false)
const videoRef = ref(null)
</script>

<template>
	<div class="h-full w-full">
		<!-- 视频 -->
		<template v-if="data.fileType == 'VIDEO'">
			<template v-if="isDetail">
				<div class="relative h-full w-full flex items-center justify-center">
					<video
						ref="videoRef"
						class="h-full w-full transition-all duration-900"
						:poster="data.cover"
						controls="controls"
						@loadstart="isactive = true"
						@play="isactive = false"
						@pause="isactive = true"
						@ended="isactive = false"
					>
						>
						<source :src="data.file" type="video/mp4" />
					</video>

					<div
						v-show="isactive"
						class="absolute z-12 flex items-center justify-center"
						@click="videoRef.play()"
					>
						<div
							class="i-carbon-play-outline-filled text-7xl text-[#fff]"
						></div>
					</div>
					<!-- <span class="totalTime" v-show="isactive">{{
          paramsdata.totalTime
        }}</span> -->
				</div>
			</template>

			<template v-else>
				<div class="relative h-full w-full">
					<ImgCard :data="data" />
					<div class="play-icon">
						<div class="i-carbon-play-filled-alt text-sm text-[#fff]"></div>
					</div>
				</div>
			</template>
		</template>
		<!-- 图片 -->
		<template v-else>
			<ImgCard :src="fileUrl" :data="data" />
		</template>
	</div>
</template>

<style lang="less" scoped>
.play-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	position: absolute;
	right: 14px;
	top: 14px;
	width: 30px;
	height: 30px;
	background: rgba(0, 0, 0, 0.3);
	border-radius: 30px;
}
</style>
