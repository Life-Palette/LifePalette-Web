<script setup>
import { StarportCarrier } from 'vue-starport'
</script>

<template>
  <div
    font-sans
    text="center gray-700 dark:gray-200"
    class="h-screen w-full flex flex-col overscroll-auto"
  >
    <div class="sticky top-0 z-999">
      <TheHeader />
    </div>
    <div class="con-h box-border w-full flex px-5 <md:!h-auto">
      <div class="<md:hidden">
        <Slider />
        <div class="flex-1" />
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

<style lang="less" scoped>
// 隐藏滚动条
::-webkit-scrollbar {
  display: none;
}
.con-h {
  height: calc(100vh - 60px);
}
</style>
