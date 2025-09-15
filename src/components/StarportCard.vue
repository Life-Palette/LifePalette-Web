<script setup>
import { fileParse } from '@life-palette/utils'
import { Image } from 'l-preview'
import 'l-preview/dist/style.css'

const { index, data, imgList } = defineProps({
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
	isShowPreSrc: {
		type: Boolean,
		default: true,
	},
	index: {
		type: Number,
		default: 0,
	},
	imgList: {
		type: Array,
		default: () => [],
	},
})

onMounted(() => {})
const isactive = ref(false)
const videoRef = ref(null)
const showMap = ref(true)
function reShowMap() {
	showMap.value = false
	setTimeout(() => {
		showMap.value = true
	}, 0)
}
// 监听index
// watch(() => props.index, () => {

// 	reShowMap()
// })
// watch不失效，优化一下
watch(
	() => index,
	(newIndex, oldIndex) => {
		if (newIndex !== oldIndex) {
			reShowMap()
		}
	},
)

const coverUrl = computed(() => {
	const baseData = fileParse(data, {
          resize: 100,
        })
	return baseData?.thumbnailUrl
})
</script>

<template>
	<div class="img-box h-full w-full">
		<div v-if="isDetail" class="bg-cover-box">
			<img class="mian-img bg-cover-img" :src="coverUrl">
			<div class="cover-box" />
		</div>
		<!-- 视频 -->
		<template v-if="data?.fileType == 'VIDEO'">
			<template v-if="isDetail">
				<div class="flex h-full w-full items-center justify-center relative">
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
						<source :src="data.file" type="video/mp4">
					</video>

					<div
						v-show="isactive"
						class="flex items-center justify-center absolute z-[12]"
						@click="videoRef.play()"
					>
						<div class="i-carbon-play-outline-filled text-7xl text-[#fff]" />
					</div>
					<!-- <span class="totalTime" v-show="isactive">{{
          paramsdata.totalTime
        }}</span> -->
				</div>
			</template>

			<template v-else>
				<div class="h-full w-full relative">
					<l-p-image :data="data" :is-show-base="isDetail" />

					<div class="play-icon">
						<div class="i-carbon-play-filled-alt text-sm text-[#fff]" />
					</div>
				</div>
			</template>
		</template>
		<!-- 图片 -->
		<template v-else>
			<Image
				v-if="isDetail"
				:data="imgList"
				:initial-index="index"
				style="object-fit: contain"
				is-need-meta-panel
				is-need-preview
				:is-need-origin="false"
				:parse-options="{
					resize: 800,
				}"
			>
				<template #location="{ data: tData }">
					<card-map-card v-if="showMap" ref="mapCardRef" :data="tData" />
				</template>
			</Image>
			<template v-else>
				<l-p-image :data="data" :is-show-base="isDetail" />
				<!-- <Image :src="data.preSrc" style="object-fit: cover" /> -->
			</template>
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
.img-box {
  // align-items: center;
  // display: flex;
  // height: 100%;
  // justify-content: center;
  // overflow: hidden;
  // width: 100%;
  // z-index: 0;
  // max-height: 100vh;
  // height: 100vh;
  position: relative;

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
