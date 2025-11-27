<script setup lang="ts">
import type { listParams } from 'presets/types/axios'
import Dialog from '@/components/Dialog.vue'
import { getObjVal } from '@iceywu/utils'
import { breakpointsTailwind } from '@vueuse/core'
import {
	A11y,
	Keyboard,
	Mousewheel,
	Navigation,
	Scrollbar,
	Virtual,
} from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { useRequest } from 'vue-hooks-pure'
import { tagFindAll } from '~/api/tag'

import { topicFindAll } from '~/api/topic'
import CoverCard from '~/components/Card/CoverCard.vue'
import CardSwiper from '~/components/Card/SwiperCard.vue'
import LottieNoData from '~/components/Lottie/NoData.vue'
import Skeleton from '~/components/skeleton'
import { useUserStore } from '~/stores/user'
import { formatTime } from '~/utils'
import { adjustImgData } from '~/utils/tools'

// Import Swiper Vue.js components

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/scrollbar'
import 'swiper/css/mousewheel'
import 'swiper/css/keyboard'

interface tagItem {
	id: number | null
	title: string
	cover?: string
	thumbnailPath?: string
	createdAt?: string
	updatedAt?: string
	coverPath?: string
	thumbnail?: string
}
interface topicListParams extends listParams {
	tagId?: number
}

function onSwiper(swiper: any) {}
function onSlideChange() {}
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
const modules = [Navigation, Scrollbar, A11y, Keyboard, Mousewheel, Virtual]
const userStore = useUserStore()
const router = useRouter()
// 是否开启swiper布局
const isSwiperLayout = ref(false)
const { showMask, openDialog, closeDialog, mediaWidth, chooseImage }
	= useFlipDialog()
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
		const list = getObjVal(res, 'result.list', [])
		const baseList = list.map((item: any) => {
			// const fileList = adjustImgData(item.fileList)
			const fileList = item.fileList.map((file: any) => {
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

const chooseItem = ref({})
const chooseId = ref()
function handleClick(e: MouseEvent, item: any) {
	const { id, fileList } = item
	const tempData = adjustImgData(fileList[0])

	const { file, preSrc } = tempData
	chooseId.value = id
	chooseItem.value = item
	openDialog(e, preSrc)
}
const loaidngFlag = ref(true)
async function initData() {
	getTagData()
	onRefresh()
}

onMounted(() => {
	initData()
})
const tagList = ref<Partial<tagItem>[]>([])
async function getTagData() {
		loaidngFlag.value = true
	const params = {
		sort: 'asc,createdAt',
	}
	const { code, msg, result } = ({} = await tagFindAll(params))
	if (code === 200) {
		const { list = [] } = result
		tagList.value = list
		// tagId.value = data[0].id
		// 新增最新
		const newPart = {
			id: null,
			title: '最新',
		}
		tagList.value.unshift(newPart)
	}
 else {
	}
		loaidngFlag.value = false
}

function handleTagClick(item: tagItem) {
	const { id } = item
	tagId.value = id
	// initData()
	// getConData()
	search.value.tagId = tagId.value
	onRefresh()
}
// 获取话题列表
const tagId = ref<number | null>(null)
const parts = computed(() => {
	const result = Array.from({ length: cols.value }, () => [] as any)
	listObj.value.list.forEach((item, i) => {
		result[i % cols.value].push(item)
	})

	return result
})

function goDe(item: any) {
	// return
	const { id, fileList } = item
	const imgCover = adjustImgData(fileList[0]).cover
	router.push(`/detail/${id}?imgCover=${imgCover}`)
}
// 标签信息
function getTagDe(tags: any) {
	const tagNameList = tags || []
	return tagNameList.map((item: any) => `#${item.title}`).join(' ')
}

function goCreate() {
	router.push('/post')
}
function handleClose() {
	closeDialog()
	// router.back()
	// const initialUrl = window.location.origin + window.location.pathname

	//       const originalState = history.state
	// history.replaceState(originalState, '', initialUrl)
}
const [DefineTemplate, ReuseTemplate] = createReusableTemplate()
</script>

<template>
	<DefineTemplate>
		<Skeleton
			:loading="listObj.loading || loaidngFlag"
			:grid-cols="cols"
			:count="3"
		>
			<template #template>
				<el-skeleton-item
					variant="image"
					class="w-auto"
					style="height: 140px"
				/>
				<div class="mt-2">
					<el-skeleton-item variant="p" class="w-1/2" />
					<div
						style="
							display: flex;
							align-items: center;
							justify-items: space-between;
						"
					>
						<el-skeleton-item variant="text" class="mr-8" />
						<el-skeleton-item variant="text" class="w-3/10" />
					</div>
				</div>
			</template>

			<template #default />
		</Skeleton>
	</DefineTemplate>
	<div class="h-full flex flex-col gap-0 flex-1 overflow-auto">
		<div class="mb-4 mt-8 flex <md:flex-col">
			<!-- 标签列表 -->
			<div
				class="relative box-border flex items-center gap-1 overflow-auto px-10 <md:px-1"
			>
				<div
					v-for="(item, index) in tagList"
					:key="index"
					class="tag-list relative box-border flex cursor-pointer items-center justify-center whitespace-nowrap rounded-md"
					@click="handleTagClick(item)"
				>
					<div
						:class="[
							tagId === item.id
								? isDark
									? 'tag-item-active-dark'
									: 'tag-item-active '
								: '',
							isDark ? 'tag-item-dark' : 'tag-item',
						]"
					>
						{{ item.title }}
					</div>
				</div>
			</div>
			<!-- 测试图标 -->
			<div
				class="flex flex-1 cursor-pointer items-center justify-end gap-1 whitespace-nowrap <md:my-1 !<md:hidden hover:text-blue"
				@click="isSwiperLayout = !isSwiperLayout"
			>
				{{ isSwiperLayout ? "列表模式" : "卡片模式" }}

				<div
					:class="[
						isSwiperLayout
							? 'i-carbon-ibm-secure-infrastructure-on-vpc-for-regulated-industries'
							: 'i-carbon-show-data-cards',
					]"
				/>
			</div>
		</div>

		<!-- 内容列表 -->
		<div class="content-box box-border overflow-auto px-10 <md:px-1">
			<div class="h-full w-full overflow-auto rounded-md">
				<!-- 有数据 -->
				<template v-if="listObj?.list?.length > 0">
					<template v-if="isSwiperLayout">
						<Swiper
							class="h-full"
							:modules="modules"
							:slides-per-view="1"
							:space-between="0"
							:pagination="{ clickable: true }"
							:keyboard="{ enabled: true }"
							:mousewheel="{ enabled: true }"
							direction="vertical"
							virtual
							@swiper="onSwiper"
							@slide-change="onSlideChange"
						>
							<SwiperSlide
								v-for="(item, index) in listObj.list"
								:key="index"
								:virtual-index="index"
							>
								<div
									class="relative h-full w-full cursor-pointer"
									@click="goDe(item)"
								>
									<el-carousel :interval="5000" arrow="always">
										<el-carousel-item
											v-for="(item2, index2) in item.fileList"
											:key="index2"
										>
											<!-- <h3 text="2xl" justify="center">{{ item2 }}</h3> -->
											<CardSwiper :data="item2" />
										</el-carousel-item>
									</el-carousel>
									<!-- 信息 -->
									<div class="card-info-detail text-[#fff]">
										<div class="account-name">
											@{{ item?.user?.name }}
											<span>
												·
												{{
													formatTime(item.createdAt, "YYYY-MM-DD HH:mm")
												}}</span>
										</div>
										<div class="title">
											{{ item.title }}
											<span class="ml-3 text-[#face15]">{{
												getTagDe(item.tags)
											}}</span>
										</div>
									</div>
								</div>
							</SwiperSlide>
						</Swiper>
					</template>
					<template v-else>
						<div style="height: calc(100vh - 180px)">
							<ScrollList v-model="listObj" @on-load="onLoad">
								<template #loading>
									<ReuseTemplate />
								</template>
								<div grid="~ cols-1 md:cols-2 lg:cols-3 xl:cols-4  gap-6 ">
									<div
										v-for="(items, idx) of parts"
										:key="idx"
										flex="~ col  "
										space-y-4
									>
										<CoverCard
											v-for="data of items"
											:key="data.id"
											:data
											@click.stop="(e) => handleClick(e, data)"
										/>
									</div>
								</div>
							</ScrollList>
						</div>
					</template>
				</template>
				<template v-else-if="loaidngFlag || listObj.loading">
					<ReuseTemplate />
				</template>
				<!-- 无数据 -->
				<template v-else>
					<LottieNoData />
				</template>
			</div>
		</div>

		<!-- 发布按钮 -->
		<div
			v-if="!listObj.loading && cols === 1"
			class="fixed bottom-20 right-10 z-9999"
			@click="goCreate"
		>
			<div
				class="flex items-center justify-center w-12 h-12 rounded-full bg-bg_color shadow-lg"
			>
				<div class="i-carbon-add-large text-xl" />
			</div>
		</div>
	</div>
	<Dialog
		v-if="showMask"
		:id="chooseId"
		:data="chooseItem"
		@close="handleClose"
	/>
</template>

<style lang="less" scoped>
.tag-list {
	display: flex;
	// padding: 20px 0;
	// padding-top: 30px;
	// padding-bottom: 10px;
	.tag-item {
		font-size: 16px;
		color: rgba(51, 51, 51, 0.8);
		height: 40px;
		padding: 0 16px;
		display: flex;
		justify-content: center;
		align-items: center;
		&-dark {
			font-size: 16px;
			color: rgba(51, 51, 51, 0.8);
			height: 40px;
			padding: 0 16px;
			display: flex;
			justify-content: center;
			align-items: center;
			color: rgba(255, 255, 255, 0.8);
			&:hover {
				border-radius: 999px;
				color: #fff;
				background-color: #333;
			}
		}
		&-active {
			border-radius: 999px;
			color: #333;
			background-color: #f8f8f8;
			font-weight: 600;
			&-dark {
				border-radius: 999px;
				color: #fff;
				background-color: #333;
				font-weight: 600;
			}
		}
		&:hover {
			border-radius: 999px;
			color: #333;
			background-color: #f8f8f8;
		}
	}
}
.container-box {
	.item-box {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.img-cover {
		border-radius: 10px;
		overflow: hidden;
	}
	.content-desc {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 5px;
		.content-desc-title {
			text-align: left;
			font-weight: 500;
			font-size: 14px;
			// color: #333;
			// 最多显示两行
			overflow: hidden;
			text-overflow: ellipsis;
			display: -webkit-box;
			-webkit-line-clamp: 2;
			-webkit-box-orient: vertical;
		}
		.content-user {
			display: flex;
			align-items: center;
			gap: 6px;
			.img-avatar {
				width: 30px;
				height: 30px;
				border-radius: 20px;
				border: 0.5px solid #e6e6e6;
			}
			.user-name {
				color: #666;
				font-size: 16px;
			}
		}
	}
}
// 隐藏滚动条
::-webkit-scrollbar {
	display: none;
}
.content-box {
	// background: red;
	// height: calc(100% - 200px);
	// width: calc(100% - 200px);
	height: 100%;
	width: 100%;
	box-sizing: border-box;
	border-radius: 10px;
}
:deep(.el-carousel) {
	height: 100%;
	.el-carousel__container {
		height: 100%;
	}
}

.card-info-detail {
	position: absolute;
	bottom: 0;
	left: 0;
	width: 100%;
	// background: red;
	padding: 16px 95px 16px 16px;
	z-index: 2;
	.account-name {
		width: 100%;
		display: flex;

		justify-content: flex-start;
		align-items: center;
		font-size: 24px;
		line-height: 34px;
		font-weight: 500;
		span {
			font-size: 16px;
			line-height: 22px;
			margin-left: 5px;
			margin-top: 5px;
			text-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
		}
	}
	.title {
		width: 100%;
		display: flex;

		justify-content: flex-start;
		font-size: 18px;
		line-height: 26px;
		font-weight: 400;
	}
}
</style>
