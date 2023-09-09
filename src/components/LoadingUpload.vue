<template>
  <Teleport to="body">
    <div v-if="isShow" class="loading-box flex flex-col">
      <div class="upload-text">{{ `上传中...${percent}%` }}</div>
      <Lottie width="25em" height="25em" :jsonData="lottieUpload" />
    </div>
  </Teleport>
</template>

<script setup>
// import lottieUpload from "~/assets/lottie/upload.json";
import lottieUpload from "~/assets/lottie/animation_lkpkpzdn.json";
const emit = defineEmits(["update:percent", "update:isShow"]);
const props = defineProps({
  percent: {
    type: [Number, String],
    default: 0,
  },
  isShow: {
    type: Boolean,
    default: false,
  },
});
</script>

<style lang="less" scoped>
.loading-box {
  height: 100vh;
  width: 100vw;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2003;
  margin: 0;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  position: fixed;

  .upload-text {
    margin-top: 2em;
    margin-left: 2em;
    color: #fff;
    font-size: 1.5em;
    margin-bottom: 1em;
  }
}
</style>
