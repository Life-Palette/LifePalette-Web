<script setup>
import { useErudaStore } from '@/stores/eruda'
import { destroyEruda } from '@/utils/eruda'
// 页面卸载时
onUnmounted(() => {
  destroyEruda()
})
onMounted(() => {
  const erudaStore = useErudaStore()
  erudaStore.setActiveNum()
})
</script>

<template>
  <router-view />
</template>
