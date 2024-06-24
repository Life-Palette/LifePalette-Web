<script setup>
import lottieNoData from '~/assets/lottie/no-data.json'

const props = defineProps({
  desc: {
    type: String,
    default: '暂无数据',
  },
})
</script>

<template>
  <div class="flex flex-col items-center justify-center">
    <Lottie width="25em" height="25em" :json-data="lottieNoData" />
    <div class="desc">
      {{ desc }}
    </div>
  </div>
</template>

<style lang="less" scoped></style>
