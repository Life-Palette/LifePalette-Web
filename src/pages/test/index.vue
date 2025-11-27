<script setup lang="ts">
import Dialog from '@/components/Dialog.vue'
import { useFlipDialog } from '@/hooks/useFlipDialog'
import { getObjVal } from '@iceywu/utils'
import { breakpointsTailwind } from '@vueuse/core'
import { useRequest } from 'vue-hooks-pure'
import { topicFindAll } from '~/api/topic'
import CoverCard from '~/components/Card/CoverCard.vue'
import { adjustImgData } from '~/utils/tools'

const breakpoints = useBreakpoints(breakpointsTailwind)

const cols = computed(() => {
	if (breakpoints.xl.value)
return 4
	if (breakpoints.lg.value)
return 3
	if (breakpoints.md.value)
return 2
	return 1
})

const parts = computed(() => {
	if (!listObj.value?.list?.length)
return []
	const result = Array.from(
		{ length: cols.value },
		() => [] as typeof listObj.value.list,
	)
	listObj.value.list.forEach((item, i) => {
		result[i % cols.value].push(item)
	})
	return result
})

const {
	onRefresh,
	onLoad,
	result: listObj,
	search,
	loading,
} = useRequest(topicFindAll, {
	target: 'list',
	// loadingDelay: 300,
	getVal: (res) => {
		const list = getObjVal(res, 'result.data', [])
		const baseList = list.map((item: any) => {
			// const fileList = adjustImgData(item.fileList)
		const	fileList = item.fileList.map((file: any) => {
				const tempData = adjustImgData(file)
				return tempData
			})
			return {
				...item,
				fileList,
			}
		})
		return baseList
	},
	listOptions: {
		defaultPageKey: 'page',
		defaultSizeKey: 'size',
		defaultDataKey: 'list',
		defaultPage: 0,
		getTotal: (data) => {
			const total = getObjVal(data, 'result.pagination.total', 0)
			return total
		},
	},
})

const route = useRoute()
const router = useRouter()
const { showMask, openDialog, closeDialog, mediaWidth, chooseImage }
	= useFlipDialog()

const chooseItem = ref({})
const chooseId = ref()
function handleClick(e: MouseEvent, item: any) {
	const { id, fileList } = item
	const tempData = adjustImgData(fileList[0])

	const { file, preSrc } = tempData
	chooseId.value = id
	chooseItem.value = item
	openDialog(e, preSrc)
	// router.push(`/test?${id}`)
	// const detailUrl = `${window.location.origin + window.location.pathname}#/test?id=${id}`
	//           // 使用 pushState 改变 URL 但不触发路由跳转
	//           history.pushState({ id }, '', detailUrl)
}
function handleClose() {
	closeDialog()
	// router.back()
	// const initialUrl = window.location.origin + window.location.pathname

	//       const originalState = history.state
	// history.replaceState(originalState, '', initialUrl)
}
onMounted(() => {
	onRefresh()
})
</script>

<template>
<div class="box-border h-90vh w-100vw p-5">
				<ScrollList v-model="listObj" @on-load="onLoad">
					<div grid="~ cols-1 md:cols-2 lg:cols-3 xl:cols-4  gap-6 ">
						<div
							v-for="(items, idx) of parts"
							:key="idx"
							flex="~ col  "
							space-y-4
>
							<CoverCard v-for="data of items" :key="data.id" :data @click="(e) => handleClick(e, data)" />
						</div>
					</div>
				</ScrollList>
			</div>

	<Dialog
		v-if="showMask"
		:id="chooseId"
		:data="chooseItem"
		@close="handleClose"
	/>
</template>

<style scoped>
.dialog {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: transparent;
	transition: background-color 0.4s;
	z-index: 9999;
	.dialog-content {
		display: flex;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%) scale(1);
		height: calc(100% - 64px);
		background-color: #fff;
		border-radius: 20px;
		overflow: visible;
		.left-container {
			flex-shrink: 0;
			flex-grow: 0;
			height: 100%;
			border-radius: 20px 0 0 20px;
			overflow: hidden;
			img {
				max-width: 100%;
				max-height: 100%;
				object-fit: contain;
			}
		}
		.right-container {
			width: 440px;
			flex-shrink: 0;
			flex-grow: 1;
			border-radius: 0 20px 20px 0;
			overflow: hidden;
			padding: 10px;
			img {
				max-width: 100%;
				max-height: 100%;
				object-fit: contain;
			}
		}
	}
}
</style>

<route lang="json">
{
	"meta": {
		"title": "Test",
		"layout": "noCom"
	}
}
</route>
