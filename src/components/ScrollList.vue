<script setup lang="ts">
interface Props {
	disAbleInfinite?: boolean
}
withDefaults(defineProps<Props>(), {
	disAbleInfinite: false,
})
const emit = defineEmits(['onRefresh', 'onLoad'])
const listObj = defineModel({
	type: Object,
	default: () => {
		return {
			loading: false,
			finished: false,
			list: [],
		}
	},
})
function load() {
	emit('onLoad')
}
const isEmpty = computed(() => {
	return listObj.value.list?.length === 0 && !listObj.value?.loading
})
</script>

<template>
	<div class="h-full" style="overflow: auto">
		<ul
			v-infinite-scroll="load"
			:infinite-scroll-distance="500"
			:infinite-scroll-disabled="
				(listObj.loading || listObj.finished) && !disAbleInfinite
			"
			class="m-0 list-none p-0"
		>
			<slot />
		</ul>

		<!-- loading -->
		<template v-if="listObj.loading">
			<!-- <p>Loading...</p> -->
			 <slot name="loading">
<el-skeleton style="text-align: start" :rows="2" animated />
			 </slot>
		</template>
		<!-- nomore -->
		<template v-if="listObj.finished && !isEmpty">
			<p class="mt-5 f-c-c">
到底啦~
</p>
		</template>
		<!-- empty -->
		<template v-if="isEmpty">
			<!-- <EmptyData title="暂无数据" /> -->
			<div>暂无数据</div>
		</template>
	</div>
</template>
