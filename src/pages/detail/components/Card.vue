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
		class="my-component relative h-60 h-full w-30 w-full select-none overflow-hidden transition-all duration-900"
	>
		<img class="block h-full w-full bg-gray-400:20 object-cover" :src="src" />
		<div
			class="absolute bottom-0 left-0 right-0 flex items-center justify-center from-black:40 to-transparent bg-gradient-to-t pt-5 text-white font-mono"
		>
			1
		</div>
	</div>
</template>
