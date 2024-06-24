<script setup>
import lottie from 'lottie-web'

const props = defineProps({
  width: {
    type: String,
    default: '100px',
  },
  height: {
    type: String,
    default: '100px',
  },
  src: {
    type: String,
    default: 'https://assets10.lottiefiles.com/packages/lf20_dyiqnus5.json',
  },
  jsonData: {
    type: Object,
    default: () => null,
  },
  autoplay: {
    type: Boolean,
    default: true,
  },
  loop: {
    type: Boolean,
    default: true,
  },
})

const animation = ref(null)
onMounted(() => {
  initAnim()
})

function initAnim() {
  if (animation.value) {
    lottie.loadAnimation({
      container: animation.value,
      renderer: 'svg',
      loop: props.loop,
      autoplay: props.autoplay,
      path: props.src,
      // animationData只能加载本地json，优先级高于path
      animationData: props.jsonData,
    })
  }
}
</script>

<template>
  <div ref="animation" :style="{ width, height }" />
</template>

<style scoped></style>
