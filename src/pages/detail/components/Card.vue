<script setup>
const props = defineProps({
  index: {
    type: Number,
    default: 0,
  },
})

const src = ref('https://w.wallhaven.cc/full/ex/wallhaven-ex3m8k.jpg')

onMounted(() => {
  console.log('MyComponent Mounted')
})
</script>

<template>
  <div
    class="my-component h-60 h-full w-30 w-full select-none transition-all duration-900 relative overflow-hidden"
  >
    <img class="bg-gray-400/20 h-full w-full block object-cover" :src="src">
    <div
      class="text-white font-mono pt-5 flex items-center bottom-0 left-0 right-0 justify-center absolute bg-gradient-to-t from-black/40 to-transparent"
    >
      1
    </div>
  </div>
</template>
