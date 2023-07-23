<template>
  <div class="flex justify-center items-center flex-col " >
    <Lottie width="25em" height="25em" :jsonData="lottieNoData" />
    <div class="desc">
      {{ desc }}
    </div>
  </div>
</template>

<script setup>
import lottieNoData from "~/assets/lottie/no-data.json";
const props = defineProps({
  desc: {
    type: String,
    default: "暂无数据",
  },
});
</script>

<style lang="less" scoped></style>
