<script setup>
import { commentFindById } from '~/api/comment'
import ImgNoData from '~/assets/image/noData/33.svg'
import { formatTime } from '~/utils'
import { getUserAvatar } from '~/utils/tools'

const props = defineProps({
  id: {
    type: [String, Number],
    default: 0,
  },
  comList: {
    type: Array,
    default: () => [],
  },
})
const emit = defineEmits(['update:comList'])
onMounted(() => {
  getCommentData()
})

const commentList = ref([])
const getDataLoaidng = ref(false)
// 获取评论
async function getCommentData() {
  if (getDataLoaidng.value)
    return
  getDataLoaidng.value = true
  const { code, msg, result } = ({} = await commentFindById({
    topicId: props.id,
  }))
  if (code === 200) {
    console.log('获取内容详情成功', result)
    commentList.value = result || []
    emit('update:comList', commentList.value)
  }
  else {
    console.log('获取内容详情失败', msg)
  }
  getDataLoaidng.value = false
}
// 有数据
const hasData = computed(() => {
  return commentList.value.length > 0 && !getDataLoaidng.value
})
// 方法导出
defineExpose({
  getCommentData,
})
</script>

<template>
  <div class="h-auto w-full flex flex-col items-center justify-center">
    <!-- 有数据 -->
    <template v-if="hasData">
      <div
        v-for="item in commentList"
        :key="item.id"
        class="comment-item box-border w-full"
      >
        <div class="comment-item__left">
          <img
            class="comment-item__left-avatar"
            :src="getUserAvatar(item.User)"
            alt=""
          >
        </div>
        <div class="comment-item__right">
          <div class="comment-item__right-top">
            <div class="comment-item__right-top-name">
              {{ item?.User?.name || '神秘人' }}
            </div>
            <div class="comment-item__right-top-time">
              {{ formatTime(item.createdAt, 'YYYY-MM-DD HH:mm') }}
            </div>
          </div>
          <div class="comment-item__right-content">
            {{ item.content }}
          </div>
        </div>
        <div class="absolute bottom-0 right-0 box-border w-full pl-15">
          <div class="h-[1px] w-full bg-[rgb(0,0,0,0.1)]" />
        </div>
      </div>
    </template>

    <!-- 无数据 -->
    <template v-else>
      <div class="animation_lkpkpzdn h-60 w-60">
        <img :src="ImgNoData" class="h-full w-full" alt="">
        <p>快来成为评论第一人吧！</p>
      </div>
    </template>
  </div>
</template>

<style lang="less" scoped>
// 隐藏滚动条
::-webkit-scrollbar {
  display: none;
}

.comment-item {
  display: flex;
  padding: 20px 10px;

  position: relative;

  .comment-item__left {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    overflow: hidden;

    .comment-item__left-avatar {
      width: 100%;
      height: 100%;
    }
  }

  .comment-item__right {
    flex: 1;
    padding-left: 10px;

    .comment-item__right-top {
      display: flex;
      justify-content: space-between;

      .comment-item__right-top-name {
        font-size: 16px;
        font-weight: bold;
        color: rgba(51, 51, 51, 0.6);
      }

      .comment-item__right-top-time {
        font-size: 12px;
        color: #999;
      }
    }

    .comment-item__right-content {
      text-align: start;
      font-size: 14px;
      color: #333;
      margin-top: 10px;
      word-break: break-all;
    }
  }
}
</style>
