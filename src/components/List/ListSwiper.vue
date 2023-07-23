<template>
  <!-- {{ fileList }} -->
  <swiper
    class="box-width h-full"
    :modules="modules"
    :slides-per-view="1"
    :space-between="0"
    :pagination="{ clickable: true }"
    :keyboard="{ enabled: true }"
    :mousewheel="{ enabled: true }"
    @swiper="onSwiper"
    @slideChange="onSlideChange"
    :direction="direction"
  >
    <swiper-slide v-for="(item, index) in fileList" :key="index">
      <!-- {{ item }} -->
      <CardSwiper :data="item" />
    </swiper-slide>
  </swiper>
</template>

<script setup>
import CardSwiper from "~/components/Card/SwiperCard.vue";
// import Swiper core and required modules
import {
  Navigation,
  Pagination,
  Scrollbar,
  A11y,
  Keyboard,
  Mousewheel,
} from "swiper/modules";

// Import Swiper Vue.js components
import { Swiper, SwiperSlide } from "swiper/vue";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import "swiper/css/mousewheel";
import "swiper/css/keyboard";
import "swiper/css/mousewheel";

const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
  direction: {
    type: String,
    default: "horizontal",
  },
});

// Import Swiper styles
const onSwiper = (swiper) => {
  console.log(swiper);
};
const onSlideChange = () => {
  console.log("slide change");
};
const fileList = computed(() => {
  const { files = [] } = props.data || {};
  return files;
});

const modules = [Navigation, Scrollbar, A11y, Keyboard, Mousewheel];
</script>

<style lang="less" scoped>
.box-width{
    // width: calc(100% - 800px);
    width: 800px;
}
</style>
