<script setup lang="ts">
import { useUserStore } from '~/stores/user'
import { formatChatTime } from '~/utils'

const props = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
  sendUserInfo: {
    type: Object,
    default: () => {},
  },
})
const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)

onMounted(() => {})

const handleLinkData = function (values: string) {
  let str = values
  const reg
		= /(https?|http|ftp|file):\/\/[-\w+&@#/%?=~|!:,.;]+[-\w+&@#/%=~|]/g
  const url = values.match(reg)
  if (url) {
    url.forEach((item: string) => {
      str = str.replace(item, `<a href="${item}" target="_blank">${item}</a>`)
    })
  }
  return str
}

// 是否是本人的消息
const isMyMessage = computed(() => {
  return props.data?.userId == userInfo.value.id
})
// 文件地址
const fileData = computed(() => {
  // 	{
  //     "id": 7,
  //     "url": "http://nest-js.oss-accelerate.aliyuncs.com/nestTest/noId/dy1.mp4",
  //     "name": "dy1.mp4",
  //     "path": "/nestTest/noId",
  //     "size": 904754,
  //     "type": "video/mp4",
  //     "userId": 1,
  //     "fileMd5": "0eedcb4ad72a352dd2231a2204c703e8",
  //     "blurhash": null,
  //     "videoSrc": null,
  //     "createdAt": "2024-04-14T01:57:09.965Z",
  //     "updatedAt": "2024-04-14T01:57:09.965Z"
  // }
  // return props.data?.file?.url || ''

  const { type, url } = props.data?.file || {}
  // 获取type前缀
  const prefix = type.split('/')[0]
  if (prefix === 'image') {
    return {
      type: 'image',
      url,
    }
  }
  else if (prefix === 'video') {
    return {
      type: 'video',
      url,
    }
  }
  else {
    return {
      type: 'file',
      url,
    }
  }
})
// 是否文件
const isFileMsg = computed(() => {
  return !!props.data?.file
})
</script>

<template>
  <div class="chat-box">
    <p v-show="data.isTimeOut" class="send-time">
      {{ formatChatTime(data?.createdAt) }}
    </p>
    <div class="message" :class="[isMyMessage ? 'my-msg' : 'other-msg']">
      <div class="avatar">
        <el-avatar
          round
          width="100%"
          height="100%"
          fit="cover"
          :src="data?.userInfo?.avatar"
        />
      </div>

      <div v-if="isFileMsg">
        <div class="msg-file">
          <template v-if="fileData.type === 'video'">
            <video
              :src="fileData.url"
              controls
              width="100%"
              height="100%"
              :poster="
                `${fileData.url
                }?x-oss-process=video/snapshot,t_7000,f_jpg,w_0,h_0,m_fast`
              "
            />
          </template>
          <template v-else-if="fileData.type === 'image'">
            <el-image
              preview-teleported
              :preview-src-list="[fileData.url]"
              height="100%"
              fit="contain"
              :src="fileData.url"
            />
            <!-- <LazyImg :src="fileData.url"></LazyImg> -->
          </template>
          <template v-else>
            <div>其他文件</div>
          </template>
        </div>
      </div>
      <!-- 文件信息 -->
      <div v-else class="msg-box">
        <div class="msg-text" v-html="handleLinkData(data.content)" />
        <!-- 文本信息 -->
        <!-- <div v-message="data.content" class="msg-text"></div> -->
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.chat-box {
	// padding: 0px 46px;
	box-sizing: border-box;

	.send-time {
		font-style: normal;
		font-weight: 400;
		font-size: 18px;
		text-align: center;
		color: #b9bcbf;
		// color: red;
		margin-bottom: 10px;
	}

	.message {
		display: flex;
		align-items: flex-start;
		// background: red;
		.avatar {
			flex-shrink: 0;
			width: 53px;
			height: 53px;
		}
		.msg-file {
			box-sizing: border-box;
			border-radius: 10px;
			overflow: hidden;
			// height: 300px;
			// width: 100%;
			max-width: 500px;
			margin-bottom: 50px;
		}
		.msg-box {
			box-sizing: border-box;
			background: #428ffc;
			border-radius: 8px;
			color: #ffffff;
			padding: 8px 12px;
			// min-height: 50px;
			.msg-text {
				font-style: normal;
				font-weight: 400;
				font-size: 20px;
				// line-height: 60px;
				word-break: break-all;
			}
		}
	}
	.my-msg {
		display: flex;

		flex-direction: row-reverse;
		.avatar {
			margin-left: 20px;
		}
	}
	.other-msg {
		display: flex;
		.avatar {
			margin-right: 20px;
		}
	}
}
</style>
