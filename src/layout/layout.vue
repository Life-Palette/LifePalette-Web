<template>
  <div
    font-sans
    text="center gray-700 dark:gray-200"
    class="w-full h-screen flex flex-col overscroll-auto"
  >
    <div class="sticky top-0 z-999"><TheHeader /></div>
    <div class="w-full box-border flex px-5 con-h">
      <Slider />
      <div class="flex-1"></div>
      <StarportCarrier>
        <!-- <router-view v-slot="{ Component }">
          <transition name="move" mode="out-in">
            <keep-alive>
              <component
                v-if="$route.meta.keepAlive"
                :is="Component"
                :key="$route.name"
              ></component>
            </keep-alive>
          </transition>
          <transition name="move" mode="out-in">
            <component
              v-if="!$route.meta.keepAlive"
              :is="Component"
              :key="$route.name"
            ></component>
          </transition>
        </router-view> -->
        <router-view />
      </StarportCarrier>
    </div>
    <!-- <div><TheFooter /></div> -->
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
