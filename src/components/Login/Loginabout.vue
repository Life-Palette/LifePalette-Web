<script setup lang="ts">
import { requestTo } from '@/utils/http/tool'
import { isObject, removeEmptyValues } from '@iceywu/utils'

import { updateUserInfo } from '~/api/admin'
import { useUserStore } from '~/stores/user'

const emit = defineEmits(['close', 'ok'])
const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)
const { name, signature } = userInfo.value

const dialogVisible = defineModel(false)

onMounted(() => {
	formData.value.name = name
	formData.value.signature = signature
})
const formData = ref({})
// 获取用户信息
async function getMyInfoFunc() {
	const params = {}
	const { code, msg, result } = ({} = await getMyInfo())
	if (code === 200) {
		userStore.setUserInfo(result)
	}
 else {
	}
}
async function onConfirm(data: any) {
	console.log('🐳-----data-----', data)

	const { fileMd5 } = data

	await updateUserInfoFunc(fileMd5)
	getMyInfoFunc()
}

// 上传头像
const editTarget = ref(null)
const clipperRef = ref(null)
const clipperData = {
	type: 'browserLogo', // 该参数可根据实际要求修改类型
	allowTypeList: ['png', 'jpg', 'jpeg', 'peeee'], // 允许上传的图片格式
	previewWidth: 100, // 预览宽度
}
// 回显
const userheadUpload = computed(() => {
	const { avatarInfo, avatar } = userInfo.value as any
	return isObject(avatarInfo) ? avatarInfo?.url : avatar
})
function headUpload() {
	editTarget.value = 'avatarFileMd5'
	if (clipperRef.value) {
		clipperRef.value.uploadFile()
	}
}

// 更新用户信息
const updateLoading = ref(false)
async function updateUserInfoFunc(fileMd5: string) {
	if (updateLoading.value)
return
	updateLoading.value = true
	const params = {
		// backgroundInfoFileMd5: fileMd5,
		// avatarFileMd5:
		// name: "suan",
		// avatar,
		// // github: null,
		// // wakatime: null,
		// // wechat: null,
		// // gitee: null,
		// // qq: "3128006406@qq.com",
	}
	// if(editTarget.value === 'background'){
	// 	params['backgroundInfoFileMd5'] = fileMd5
	// }
	// if(editTarget.value === 'avatar'){
	// 	params['avatarFileMd5'] = fileMd5
	// }
	params[editTarget.value] = fileMd5
	console.log('🐳-----params---77--', params)
	// return
	const { code, msg, result } = ({} = await updateUserInfo(params).catch(
		(err) => {
			updateLoading.value = false
			ElMessage.error('更新用户信息失败')
		},
	))
	if (code === 200) {
		ElMessage.success('更新用户信息成功')
	}
 else {
		ElMessage.error('更新用户信息失败')
	}
	updateLoading.value = false
}
function handleCancel() {
	console.log('💗handleCancel---------->')
	emit('close')
}
async function handleOk() {
	const params = removeEmptyValues(formData.value)
	console.log('🎁-----formData.value-----', formData.value)
	const [err, data] = await requestTo(updateUserInfo(params))
	if (!err) {
		console.log('🎉-----data-----', data)
		userStore.setUserInfo(data)
		// handleCancel()
		// emit('close')
		emit('close')
	}
}
</script>

<template>
	<clipperDialog
		ref="clipperRef"
		:type="clipperData.type"
		:allow-type-list="clipperData.allowTypeList"
		:limit-size="clipperData.limitSize"
		:preview-width="clipperData.previewWidth"
		@confirm="onConfirm"
	/>

	<div class="dialog-content">
		<div class="dialog-title">编辑资料</div>
		<div class="dialog-hadImg">
			<img :src="userheadUpload" alt="" class="item-img" @click="headUpload">
			<p class="item-txt">点击修改头像</p>
		</div>

		<div class="dialog-name">
			<div>名字</div>
			<el-input
				v-model="formData.name"
				placeholder="填写信息"
				maxlength="20"
				type="text"
				show-word-limit
			/>
		</div>

		<div class="dialog-Personality">
			<div>简介</div>
			<el-input
				v-model="formData.signature"
				placeholder="介绍一下你自己"
				type="textarea"
			/>
		</div>

		<div class="flex justify-between mt-[40px]">
			<button
				class="w-[100px] bg-gray-100 p-2 rounded-full shadow-sm shadow-gray-400 hover:bg-gray-200 duration-300 text-gray-400 font-bold font-mono"
				@click="handleCancel"
			>
				Esc
			</button>
			<button
				class="w-[100px] bg-gray-100 p-2 rounded-full shadow-sm shadow-gray-400 hover:bg-gray-200 duration-300 font-bold font-mono text-[#58636d]"
				@click="handleOk"
			>
				Yes
				<span
					class="absolute top-0 right-0 inline-block w-4 h-4 transition-all duration-500 ease-in-out rounded group-hover:-mr-4 group-hover:-mt-4 bg-gradient-to-br from-[#ffddef] via-[#faf0eb] to-[#f6fde7]"
					@click.stop
				>
					<span
						class="absolute top-0 right-0 w-5 h-5 rotate-45 translate-x-1/2 -translate-y-1/2 bg-white"
					/>
				</span>
			</button>
		</div>
	</div>
</template>

<style lang="less" scoped>
:deep(.el-dialog) {
	height: 550px;
}

.dialog-content {
	width: 25%;
	background: rgb(234, 234, 236);
	position: fixed;
	left: 50%;
	top: 50%;
	transform: translate(-50%, -50%);
	padding: 25px 25px;
	border-radius: 30px;
	// background: linear-gradient(to bottom right, #ffddef, #faf0eb, #f6fde7);
	background: rgba(255, 255, 255, 0.776);
	background: url("https://img.freepik.com/premium-photo/abstract-blurred-sky-colorful_40299-22.jpg")
		no-repeat;
	background-size: 100% 100%;

	.dialog-title {
		text-align: left;
		font-size: 20px;
		font-family: ui-rounded;
		color: white;
	}

	.dialog-hadImg {
		height: 120px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		margin-top: 10px;

		.item-img {
			width: 100px;
			height: 100px;
			border-radius: 50%;
			object-fit: cover;
		}

		.item-txt {
			margin-top: 5px;
			font-size: 12px;
			color: rgba(22 24 35 / 60%);
		}
	}

	.dialog-name {
		margin-top: 40px;
		text-align: left;
		color: white;

		:deep(.el-input__wrapper) {
			width: 100%;
			height: 32px;
			background: #f2f2f4;
			border: none;
			border-radius: 10px;
			outline: none;
			padding-left: 8px;
			font-size: 14px;
			line-height: 32px;
			box-shadow: none;
			margin-top: 10px;
		}

		:deep(.el-input__count-inner) {
			background: #f2f2f4;
		}
	}

	.dialog-Personality {
		text-align: left;
		margin-top: 40px;
		color: white;

		:deep(.el-textarea__inner) {
			width: 100%;
			height: 90px;
			max-height: 120px;
			background: #f2f2f4;
			border: none;
			border-radius: 10px;
			outline: none;
			padding-left: 8px;
			font-size: 14px;
			box-shadow: none;
			margin-top: 10px;
			scrollbar-width: none;
			/*firefox*/
			-ms-overflow-style: none;
			/*IE 10+ */
			overflow-x: hidden;
			overflow-y: auto;
		}

		:deep(.el-input__count-inner) {
			background: #f2f2f4;
		}
	}

	:deep(.el-textarea__inner)::-webkit-scrollbar {
		display: none;
		/*chrome safari */
	}
}
</style>
