<template>
	<div class="chat-box">
		<p v-show="data.isTimeOut" class="send-time">
			{{ formatChatTime(data?.createdAt) }}
		</p>
		<div :class="[isMyMessage ? 'my-msg' : 'other-msg', 'message']">
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
					<el-image
						preview-teleported
						:preview-src-list="[fileUrl]"
						height="100%"
						fit="contain"
						:src="fileUrl"
					/>
				</div>
			</div>
			<!-- 文件信息 -->
			<div v-else class="msg-box">
				<!-- 文本信息 -->
				<div v-message="data.content" class="msg-text"></div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { useUserStore } from '~/stores/user'
import { formatChatTime } from '~/utils'
const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)

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
onMounted(() => {})

// 是否是本人的消息
const isMyMessage = computed(() => {
	return props.data?.userId == userInfo.value.id
})
// 文件地址
const fileUrl = computed(() => {
	return props.data?.file?.file || ''
})
// 是否文件
const isFileMsg = computed(() => {
	return !!props.data?.file
})
</script>

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
