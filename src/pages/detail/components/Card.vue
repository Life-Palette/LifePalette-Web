<script setup>
const props = defineProps({
  index: {
    type: Number,
  },
});

const src = ref("https://w.wallhaven.cc/full/ex/wallhaven-ex3m8k.jpg");

onMounted(() => {
  console.log("MyComponent Mounted");
});
</script>

<template>
  <div
    class="my-component h-60 w-30 overflow-hidden w-full h-full transition-all duration-900 relative select-none"
  >
    <img class="object-cover block w-full h-full bg-gray-400:20" :src="src" />
    <div
      class="absolute pt-5 left-0 right-0 bottom-0 bg-gradient-to-t from-black:40 to-transparent text-white font-mono flex items-center justify-center"
    >
      1
    </div>
  </div>
</template>
