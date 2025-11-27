<script setup lang="ts">
import type { listParams } from 'presets/types/axios'
import { Starport } from 'vue-starport'
import { Waterfall } from 'vue-waterfall-plugin-next'
import { findLikeByUserId } from '~/api/like'
import { topicFindAll } from '~/api/topic'
import StarportCard from '~/components/StarportCard.vue'
import { useUserStore } from '~/stores/user'
import { getUserAvatar } from '~/utils/tools'
import UserMap from './UserMap.vue'
import 'vue-waterfall-plugin-next/dist/style.css'

interface tagItem {
  id: number | null
  title: string
  cover?: string
  thumbnailPath?: string
  createdAt?: string
  updatedAt?: string
  coverPath?: string
	com?: any
  thumbnail?: string
}
interface topicListParams extends listParams {
  tagId?: number
  userId?: number
}
const tagList = ref<Partial<tagItem>[]>([
  {
    id: 1,
    title: '轨迹',
		com: UserMap,
  },
  // {
  //   id: 1,
  //   title: '全部',
  // },
  // {
  //   id: 2,
  //   title: '点赞',
  // },
])

const chooseTabId = ref<number | null>(1)
function handleClick(item: tagItem) {
  chooseTabId.value = item.id
  getTopicList()
}
onMounted(async () => {
  // await getTopicList()
})
// 获取话题列表
const tagId = ref<number | null>(null)
const topicList = ref([])
const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)

const getDataLoading = ref(false)
async function getTopicList() {
  getDataLoading.value = true
  const params: topicListParams = {
    page: 1,
    size: 30,
    sort: 'desc,createdAt',
    userId: userInfo.value.id,
  }
  const requestApi = chooseTabId.value === 1 ? topicFindAll : findLikeByUserId
  // if (tagId.value) {
  // 	params.tagId = tagId.value
  // }
  const { code, msg, result } = ({} = await requestApi(params))
  if (code === 200) {
    console.log('getTopicList成功', result)
    const { list = [] } = result
    if (chooseTabId.value === 1) {
      topicList.value = list
    }
    else {
      topicList.value = list.map((item: any) => {
        return {
          ...item,
          ...item.topic,
        }
      })
    }
    console.log('🎉-----topicList.value-----', topicList.value)
  }
  else {
    console.log('getTopicList失败', msg)
  }
  setTimeout(() => {
    getDataLoading.value = false
  }, 500)
}
const currentObj = computed(() => {
	return tagList.value.find(item => item.id === chooseTabId.value)
})
</script>

<template>
  <div class="w-full flex flex-col items-center h-full">
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
              chooseTabId === item.id
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
    </div>

    <!-- 作品列表 -->
    <template v-if="true">
			<component :is="currentObj.com" />
      <div v-if="0" class="container-box w-[60vw]">
        <Waterfall

          :list="topicList"
          background-color="transparent"
          :width="340"
          :lazyload="false"
        >
          <template #item="{ item }">
            <div class="item-box min-h-50">
              <!-- 封面 -->
              <div class="img-cover max-h-100 flex-1">
                <Starport
                  :port="`my-id${item.id}`"
                  class="h-full w-full transition-all duration-800"
                >
                  <StarportCard :data="item.fileList[0]" />
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
                     :src="getUserAvatar(item.user)"
                  >
                  <div class="user-name">
                    {{ item.user.name }}
                  </div>
                </div>
              </div>
            </div>
          </template>
        </Waterfall>
      </div>
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
</style>
