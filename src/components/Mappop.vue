<script setup lang="ts">
import { api as viewerApi } from 'v-viewer'
import 'viewerjs/dist/viewer.css'

const props = defineProps<{
  data: object
  isSingle: boolean
}>()

const emit = defineEmits(['closePop'])
const fileList = computed(() => {
  if (props.isSingle) {
    return [props.data]
  }
  else {
    return props.data?.files || []
  }
})
function getCover(data: any) {
  const { fileType, file, cover } = data || {}
  if (fileType === 'IMAGE') {
    let preSrc = `${file}?x-oss-process=image/resize,l_100`
    // const preSrc = `${file}`;
    const fileSuffix = file.substring(file.lastIndexOf('.'))
    if (fileSuffix.toUpperCase() === '.HEIC') {
      preSrc = `${file}?x-oss-process=image/resize,l_100/format,jpg`
    }
    return preSrc
  }
  else if (fileType === 'VIDEO') {
    const srcT
      = cover
      || `${file}?x-oss-process=video/snapshot,t_7000,f_jpg,w_0,h_0,m_fast`
    return srcT
  }
}
function handleClosePop() {
  emit('closePop')
}
function showImgs(index: number) {
  // eslint-disable-next-line array-callback-return
  const images = fileList.value.map((item: any) => {
    const { fileType, file, cover } = item || {}
    if (fileType === 'IMAGE') {
      const fileSuffix = file.substring(file.lastIndexOf('.'))
      if (fileSuffix.toUpperCase() === '.HEIC') {
        return `${file}?x-oss-process=image/format,jpg`
      }
      return file
    }
    else if (fileType === 'VIDEO') {
      const srcT
        = cover
        || `${file}?x-oss-process=video/snapshot,t_7000,f_jpg,w_0,h_0,m_fast`
      return srcT
    }
  })
  viewerApi({
    images,
    options: {
      initialViewIndex: index,
    },
  })
}
</script>

<template>
  <div class="rounded-md bg p-5 w-fit shadow-lg">
    <!-- 头部 -->
    <header class="header-part relative">
      <h3 class="header-title">
        {{ data?.title }}
      </h3>
      <span class="header-subTitle">{{ data?.content }}</span>
      <button
        class="close i-carbon-close-large absolute right-0 top-0 text-xl"
        @click="handleClosePop"
      />
    </header>
    <!-- 内容 -->
    <div class="img-list">
      <div
        v-for="(item, index) in fileList"
        :key="item.id"
        class="img-item"
        @click="showImgs(index)"
      >
        <img
          :src="getCover(item)"
          class="w-full h-full object-cover cursor-pointer"
          alt=""
        >
      </div>
    </div>
  </div>
</template>

<style>
.mapboxgl-popup {
  z-index: 9999;
}
.mapboxgl-popup-tip {
  display: none;
}
.mapboxgl-popup-content {
  padding: 0;
  background: transparent;
}
.header-part {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 75px;
  padding-bottom: 10px;
}
.header-title {
  font-size: 20px;
  font-weight: 500;
  color: var(--vibrant-color);
  margin-bottom: 0.1em;
  font-weight: 700;
}
.img-list {
  width: fit-content;
  display: grid;
  grid-template-columns: repeat(3, 100px);
  grid-gap: 10px;
  /* background: red; */
}
.img-item {
  height: 100px;
  width: 100px;
}
</style>
