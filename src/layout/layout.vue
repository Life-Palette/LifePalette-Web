<template>
  <div
    font-sans
    text="center gray-700 dark:gray-200"
    class="w-full h-screen flex flex-col overscroll-auto"
  >
    <div class="sticky top-0 z-999"><TheHeader /></div>
    <div class="w-full box-border flex px-5 con-h <md:!h-auto">
      <div class="<md:display-none">
        <Slider />
        <div class="flex-1"></div>
      </div>

      <StarportCarrier>
        <RouterView v-slot="{ Component }">
          <transition name="page-fade">
            <component :is="Component" />
          </transition>
        </RouterView>
      </StarportCarrier>
    </div>
  </div>
</template>
<script setup>
import { StarportCarrier } from "vue-starport";
</script>
<style lang="less" scoped>
// 隐藏滚动条
::-webkit-scrollbar {
  display: none;
}
.con-h {
  height: calc(100vh - 60px);
}
</style>
