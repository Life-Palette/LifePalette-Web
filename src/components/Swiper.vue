<script setup>
// import Swiper core and required modules
import {
  A11y,
  Keyboard,
  Mousewheel,
  Navigation,
  Scrollbar,
} from 'swiper/modules'

// Import Swiper Vue.js components
import { Swiper, SwiperSlide } from 'swiper/vue'
import CardSwiper from '~/components/Card/SwiperCard.vue'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/scrollbar'
import 'swiper/css/mousewheel'
import 'swiper/css/keyboard'

const props = defineProps({
  dataList: {
    type: Array,
    default: () => [],
  },
  direction: {
    type: String,
    default: 'vertical',
  },
})

// Import Swiper styles
function onSwiper(swiper) {
  console.log(swiper)
}
function onSlideChange() {
  console.log('slide change')
}

const modules = [Navigation, Scrollbar, A11y, Keyboard, Mousewheel]
</script>

<template>
  <Swiper
    :modules="modules"
    :slides-per-view="1"
    :space-between="0"
    :pagination="{ clickable: true }"
    :keyboard="{ enabled: true }"
    :mousewheel="{ enabled: true }"
    :direction="direction"
    @swiper="onSwiper"
    @slide-change="onSlideChange"
  >
    <SwiperSlide v-for="(item, index) in dataList" :key="index">
      <CardSwiper :data="item" />
    </SwiperSlide>
  </Swiper>
</template>

<style lang="less" scoped></style>
