<script setup lang="ts">
import { Starport } from 'vue-starport'
import {
  A11y,
  Keyboard,
  Mousewheel,
  Navigation,
  Scrollbar,
} from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { breakpointsTailwind } from '@vueuse/core'
import InfiniteLoading from 'v3-infinite-loading'
import type { listParams } from 'presets/types/axios'
import { to } from '@iceywu/utils'
import { tagFindAll } from '~/api/tag'
import { topicFindAll } from '~/api/topic'
import { useUserStore } from '~/stores/user'

import StarportCard from '~/components/StarportCard.vue'

import LottieNoData from '~/components/Lottie/NoData.vue'
import Skeleton from '~/components/skeleton'
import CardSwiper from '~/components/Card/SwiperCard.vue'
import { formatTime } from '~/utils'

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

function onSwiper(swiper: any) {
  console.log(swiper)
}
function onSlideChange() {
  console.log('slide change')
}
const breakpoints = useBreakpoints(breakpointsTailwind)
const cols = computed(() => {
  if (breakpoints.isGreaterOrEqual('xl'))
    return 5
  if (breakpoints.xl.value)
    return 4
  if (breakpoints.lg.value)
    return 3
  if (breakpoints.md.value)
    return 1
  return 1
})
const modules = [Navigation, Scrollbar, A11y, Keyboard, Mousewheel]
const userStore = useUserStore()
const router = useRouter()
// 是否开启swiper布局
const isSwiperLayout = ref(false)

onMounted(async () => {
  await getTagData()
  await getConData()
})
const tagList = ref<Partial<tagItem>[]>([])
async function getTagData() {
  const params = {
    sort: 'asc,createdAt',
  }
  const { code, msg, result } = ({} = await tagFindAll(params))

  if (code === 200) {
    // console.log('get api test成功', result)
    const { data = [] } = result
    tagList.value = data
    // tagId.value = data[0].id
    // 新增最新
    const newPart = {
      id: null,
      title: '最新',
    }
    tagList.value.unshift(newPart)
  }
  else {
    console.log('get api test失败', msg)
  }
}

function handleClick(item: tagItem) {
  const { id } = item
  tagId.value = id
  initData()
  getConData()
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
  console.log('item', item)
  const { id, files } = item
  const imgCover = files[0].file
  router.push(`/detail/${id}?imgCover=${imgCover}`)
}
// 标签信息
function getTagDe(tags: any) {
  const tagNameList = tags || []
  return tagNameList.map((item: any) => `#${item.title}`).join(' ')
}
/** 加载更多 */
function handleLoadMore() {
  console.log('🎁-----handleLoadMore-----')
  getNext()
}
function getNext() {
  if (listObj.value.loading || listObj.value.finished)
    return
  dataParams.value.page++
  getConData()
}
function initData() {
  dataParams.value = {
    page: 1,
    size: 100,
  }
  listObj.value.list = []
  listObj.value.finished = false
  listObj.value.refreshing = false
  listObj.value.loading = true
}
const listObj = ref({
  list: [],
  loading: false,
  finished: false,
  refreshing: false,
})
const dataParams = ref({
  page: 1,
  size: 100,
})
async function getConData(readStatus, target) {
  listObj.value.loading = true
  const params = {
    page: dataParams.value.page,
    size: dataParams.value.size,
    sort: 'desc,createdAt',
  }
  if (tagId.value) {
    params.tagId = tagId.value
  }
  const [err, ReData] = ({} = await to(topicFindAll(params)))
  if (err) {
    listObj.value.finished = true
    listObj.value.loading = false
    return
  }

  const { code, msg, result } = ReData || {}
  if (code === 200) {
    const { data = [], meta = {} } = result
    const { totalPages } = meta || {}
    listObj.value.list.push(...data)
    listObj.value.finished = totalPages <= dataParams.value.page
    console.log('🐠-----totalPages-----', totalPages, dataParams.value.page)
    console.log('🍧-----listObj.value.list-----', listObj.value)
  }
  else {
    listObj.value.finished = true
  }
  setTimeout(() => {
    listObj.value.loading = false
  }, 500)
}
</script>

<template>
  <div class="h-full w-full flex flex-col gap-0">
    <div class="mb-4 mt-8 flex <md:flex-col">
      <!-- 标签列表 -->
      <div
        class="relative box-border flex items-center gap-1 overflow-auto px-10"
      >
        <div
          v-for="(item, index) in tagList"
          :key="index"
          class="tag-list relative box-border flex cursor-pointer items-center justify-center whitespace-nowrap rounded-md"
          @click="handleClick(item)"
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
        class="flex flex-1 cursor-pointer items-center justify-end gap-1 whitespace-nowrap <md:my-1 <md:hidden hover:text-blue"
        @click="isSwiperLayout = !isSwiperLayout"
      >
        {{ isSwiperLayout ? '列表模式' : '卡片模式' }}

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
    <div
      v-if="!listObj.loading"
      class="content-box box-border overflow-auto px-10"
    >
      <div class="h-full w-full overflow-auto rounded-md">
        <!-- 有数据 -->
        <template v-if="listObj.list.length > 0">
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
              @swiper="onSwiper"
              @slide-change="onSlideChange"
            >
              <SwiperSlide v-for="(item, index) in listObj.list" :key="index">
                <div
                  class="relative h-full w-full cursor-pointer"
                  @click="goDe(item)"
                >
                  <el-carousel :interval="5000" arrow="always">
                    <el-carousel-item
                      v-for="(item2, index2) in item.files"
                      :key="index2"
                    >
                      <!-- <h3 text="2xl" justify="center">{{ item2 }}</h3> -->
                      <CardSwiper :data="item2" />
                    </el-carousel-item>
                  </el-carousel>
                  <!-- 信息 -->
                  <div class="card-info-detail text-[#fff]">
                    <div class="account-name">
                      @{{ item?.User?.name }}
                      <span>
                        ·
                        {{
                          formatTime(item.createdAt, 'YYYY-MM-DD HH:mm')
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
            <el-scrollbar max-height="calc(100vh - 180px)">
              <div
                class="container-box"
                grid="~ cols-1 md:cols-1 lg:cols-3 xl:cols-4 2xl:cols-5 gap-4"
              >
                <div
                  v-for="(items, idx) of parts"
                  :key="idx"
                  flex="~ col gap-4"
                >
                  <div
                    v-for="(item, idx2) of items"
                    :key="idx2"
                    class="item-box min-h-80"
                    @click="goDe(item)"
                  >
                    <!-- 封面 -->
                    <div class="img-cover max-h-100 flex-1">
                      <Starport
                        :port="`my-id${item.id}`"
                        class="h-full w-full transition-all duration-800"
                      >
                        <StarportCard :data="item.files[0]" />
                      </Starport>
                    </div>
                    <!-- 描述 -->
                    <div class="content-desc">
                      <div class="content-desc-title">
                        {{ item.title }}
                      </div>
                      <div class="content-user">
                        <img
                          class="img-avatar"
                          block
                          h-full
                          w-full
                          bg-gray-400:20
                          object-cover
                          :src="item.User.avatar"
                        >
                        <div class="user-name">
                          {{ item.User.name }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <!-- 加载更多 -->
              <InfiniteLoading :firstload="false" @infinite="handleLoadMore" />
            </el-scrollbar>
          </template>
        </template>
        <!-- 无数据 -->
        <template v-else>
          <LottieNoData />
        </template>
      </div>
    </div>
    <template v-else>
      <Skeleton :loading="listObj.loading" :grid-cols="4" :count="3">
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
    </template>
  </div>
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
  .itemT {
    cursor: pointer;
    // background: red;
    // max-height: 300px;
    // overflow: hidden;
    // &:hover {
    //   .item-box {
    //     box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
    //   }
    // }
  }
  .item-box {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .img-cover {
    // height: 200px;
    // min-height: 200px;
    // max-height: 300px;
    cursor: pointer;
    border-radius: 10px;
    overflow: hidden;
    &:hover {
      //   box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
      // 遮罩层
      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        // background-color: rgba(0, 0, 0, 0.1);
        border-radius: 10px;
      }
    }
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
