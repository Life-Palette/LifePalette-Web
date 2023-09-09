<template>
  <div class="card-box" v-if="coverUrl">
    <el-image
      class="w-full "
      fit="contain"
      :src="coverUrl"
      :preview-src-list="[coverUrl]"
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
    <div class="bg-cover-box">
      <img class="bg-cover-img mian-img" :src="coverUrl" />
      <div class="cover-box"></div>
    </div>
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
    default: "",
  },
});

const coverUrl = computed(() => {
  if (props.src) {
    return props.src;
  }
  const fileTemp = props.data || {};

  const { fileType, file, thumbnail = "", cover = "IMAGE" } = fileTemp || {};
  if (fileType === "IMAGE") {
    return file || "";
  } else if (fileType === "VIDEO") {
    return cover || "";
  }
});
onMounted(() => {
  // console.log(props.data);
});
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

  height: 100%;
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
