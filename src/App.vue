<script setup>
import { Toaster } from 'vue-sonner'
import { useErudaStore } from '@/stores/eruda'
import { destroyEruda } from '@/utils/eruda'
import 'vue-sonner/style.css'
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
  <Toaster />
</template>
