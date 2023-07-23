<script setup>
const props = defineProps({
  fileUrl: {
    type: String,
    default: "",
  },
  data: {
    type: Object,
    default: () => {},
  },
  isDetail: {
    type: Boolean,
    default: false,
  },
});

onMounted(() => {
  console.log("MyComponent Mounted");
});
const isactive = ref(false);
const videoRef = ref(null);
</script>

<template>
  <!-- 视频 -->
  <template v-if="data.fileType == 'VIDEO'">
    <template v-if="isDetail">
      <div class="w-full h-full relative flex justify-center items-center">
        <video
          ref="videoRef"
          class="w-full h-full transition-all duration-900"
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
          @click="videoRef.play()"
          v-show="isactive"
          class="absolute z-12 flex justify-center items-center"
        >
          <div class="i-carbon-play-outline-filled text-[#fff] text-7xl"></div>
        </div>
        <!-- <span class="totalTime" v-show="isactive">{{
          paramsdata.totalTime
        }}</span> -->
      </div>
    </template>

    <template v-else>
      <div class="relative w-full h-full">
        <el-image
          class="w-full h-full transition-all duration-900"
          fit="cover"
          :src="data.cover"
        >
          <template #placeholder>
            <div class="image-slot">Loading<span class="dot">...</span></div>
          </template>
        </el-image>
        <div class="play-icon">
          <div class="i-carbon-play-filled-alt text-[#fff] text-sm"></div>
        </div>
      </div>
    </template>
  </template>
  <!-- 图片 -->
  <template v-else>
    <el-image
      class="w-full h-full transition-all duration-900"
      fit="cover"
      :preview-src-list="[data.file]"
      preview-teleported
      :src="isDetail ? data.file : data.thumbnail"
    >
      <template #placeholder>
        <div class="image-slot">Loading<span class="dot">...</span></div>
      </template>
      <template #error>
        <div class="image-slot min-h-20 flex justify-center items-center">
          加载失败
        </div>
      </template>
    </el-image>
  </template>
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
