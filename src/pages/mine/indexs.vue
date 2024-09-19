<script setup lang="ts">
import Loginabout from '@/components/Login/Loginabout.vue'
import { isObject } from '@iceywu/utils'
import { ElMessage } from 'element-plus'
import { getMyInfo, updateUserInfo } from '~/api/admin'
import { useUserStore } from '~/stores/user'

const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)

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

// 上传背景图
const clipperRef = ref(null)
const editTarget = ref(null)
const backgroundUrl = computed(() => {
	const { backgroundInfo, background } = userInfo.value as any
	return isObject(backgroundInfo) ? backgroundInfo?.url : background
})

const userBackground = computed(() => {
	return (
		backgroundUrl.value || 'https://assets.codepen.io/605876/miami-sunrise.jpeg'
	)
})
function openUpload() {
	editTarget.value = 'backgroundInfoFileMd5'
	if (clipperRef.value) {
		clipperRef.value.uploadFile()
	}
}
const clipperData = {
	type: 'browserLogo', // 该参数可根据实际要求修改类型
	allowTypeList: ['png', 'jpg', 'jpeg', 'peeee'], // 允许上传的图片格式
	previewWidth: 100, // 预览宽度
}
async function onConfirm(data: any) {
	console.log('🐳-----data-----', data)
	const { fileMd5 } = data
	await updateUserInfoFunc(fileMd5)
	getMyInfoFunc()
}
// 更新用户信息
const updateLoading = ref(false)
async function updateUserInfoFunc(fileMd5: string) {
	if (updateLoading.value)
return
	updateLoading.value = true
	const params = {}
	params[editTarget.value] = fileMd5
	// console.log('🐳-----params-----', params);
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
// 上传头像
function headUpload() {
	editTarget.value = 'avatarFileMd5'
	if (clipperRef.value) {
		clipperRef.value.uploadFile()
	}
}
const userheadUpload = computed(() => {
	const { avatarInfo, avatar } = userInfo.value as any
	return isObject(avatarInfo) ? avatarInfo?.url : avatar
})
const headlist = ref([
	{
		name: '关注',
		number: 122,
	},
	{
		name: '粉丝',
		number: 123,
	},
	{
		name: '获赞',
		number: 0,
	},
])

// 编辑个人信息
const isShowDialog = ref(false)
function EditInfo() {
	isShowDialog.value = true
}
onMounted(() => {
	getMyInfoFunc()
})
</script>

<template>
	<!-- 更换背景 -->
	<clipperDialog
		ref="clipperRef"
		:type="clipperData.type"
		:allow-type-list="clipperData.allowTypeList"
		:limit-size="clipperData.limitSize"
		:preview-width="clipperData.previewWidth"
		@confirm="onConfirm"
	/>
	<!-- 编辑个人信息 -->
	 <Loginabout v-if="true" v-model="isShowDialog" />
	<div class="Personal-Center h-full w-full">
		<div class="Personal-content">
			<div class="PerCard">
				<div class="PerBox">
					<img
						:src="userheadUpload"
						alt=""
						class="headImg"
						@click="headUpload"
					>
					<div class="headright">
						<div class="headName">䯃</div>
						<div class="headlist">
							<div v-for="(item) in headlist">
								<div class="headitem">
									{{ item.name }}
									<span class="headitems">{{ item.number }}</span>
								</div>
							</div>
						</div>
						<div class="ifePa">IfePalette: {{ "#154D56F51" }}</div>
						<div class="sign">
							<span class="signtext">{{ "这个人很懒，什么都没有留下..." }}</span>
							<span class="InforData" @click="EditInfo">编辑个人资料</span>
						</div>
					</div>
				</div>
			</div>
			<div
				class="backgrImg"
				:style="{
					backgroundImage: `url('${userBackground}')`,
					backgroundSize: 'cover',
				}"
				@click="openUpload"
			>
				<div class="top_Gradient" />
				<div class="right_Gradient" />
				<div class="left_Gradient" />
				<div class="bottom_Gradient" />
			</div>
		</div>
	</div>
</template>

<style lang="less" scoped>
// @import 'https://unpkg.com/normalize.css';
// @import 'https://unpkg.com/open-props/normalize.min.css';
// @import 'https://unpkg.com/open-props/open-props.min.css';

:root {
	--aspect-ratio: 4 / 1;
	--header-scroll: calc(max(100vw / 4, 200px));
	/*   --header-scroll: 300px; */
	--title-height: 300px;
	--shared-range: calc((var(--header-scroll) - var(--title-height)))
		calc((var(--header-scroll) + (var(--title-height) * 2)));
	--cover-range: calc(var(--header-scroll) - (var(--title-height)))
		calc(var(--header-scroll) * 1);
	--title-range: calc((var(--header-scroll) - (var(--title-height) * 2)))
		calc((var(--header-scroll) - (var(--title-height) * -0.25)));
	--avatar-range: calc((var(--header-scroll) - (var(--title-height) * 1.5)))
			calc((var(--header-scroll) + (var(--title-height) * 0.95))),
		calc((var(--header-scroll) - (var(--title-height) * 2.5)))
			calc((var(--header-scroll) + (var(--title-height) * 0.95)));
	--shadow-range: calc((var(--header-scroll) + var(--title-height)))
		calc((var(--header-scroll) + (var(--title-height) * 2)));
	--cover-range: var(--shadow-range);
}
.Personal-Center {
	background: var(--gray-2);
	display: grid;
	min-height: 80vh;
	justify-items: center;
	overflow-x: hidden;
	align-content: start;
	overflow-y: auto;
	.Personal-content {
		width: 100%;
		height: 310px;
		position: relative; /* 确保容器有相对定位 */
		display: flex;
		.PerCard {
			width: 60%;
			height: 100%;
			padding: 30px 27px;
			box-sizing: border-box;
			.PerBox {
				width: 100%;
				height: 100%;
				display: flex;
				align-items: center;
				.headImg {
					width: 170px;
					height: 170px;
					border-radius: 50%;
				}
				.headright {
					text-align: left;
					min-height: 170px;
					margin-left: 15px;
					font-size: 18px;
					display: flex;
					flex-direction: column;
					.headName {
						font-size: 20px;
					}
					.headlist {
						display: flex;
						margin-top: 22px;
						.headitem {
							color: #1d1f2b99;
							font-size: 16px;
							margin-right: 15px;
							//  font-family: PingFang SC, DFPKingGothicGB-Regular, sans-serif;;
						}
						.headitems {
							font-size: 16px;
							color: #374151;
						}
					}
					.ifePa {
						margin-top: 27px;
						font-size: 16px;
						color: #1d1f2b99;
					}
					.sign {
						font-size: 14px;
						color: #1d1f2b99;
						margin-top: 22px;
						display: flex;
						position: relative;
						.signtext{
							display: inline-block;
							overflow: hidden;
							text-overflow: ellipsis;
							white-space: nowrap;
							width: 300px;
						}
						.InforData {
							position: absolute;
							right: -120px;
							bottom: 0;
							z-index: 2;
							border-radius: 4px;
							opacity: 1;
							&:hover {
								color: #409eff;
								cursor: pointer;
							}
						}
					}
				}
			}
		}
		// 背景
		.backgrImg {
			width: 65%;
			height: 305px;
			cursor: pointer;
			margin-left: auto;
			position: relative;
			.top_Gradient {
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				bottom: 0;
				background: linear-gradient(
					to bottom,
					rgb(255, 255, 255) 0%,
					rgba(255, 255, 255, 0) 50%
				);
				z-index: 2;
			}
			.right_Gradient {
				position: absolute;
				top: 0;
				left: 0;
				right: -140px;
				bottom: 0;
				background: linear-gradient(
					to left,
					rgb(255, 255, 255) 0%,
					rgba(255, 255, 255, 0) 50%
				);
				z-index: 2;
			}
			.bottom_Gradient {
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				bottom: 0;
				background: linear-gradient(
					to top,
					rgb(255, 255, 255) 0%,
					rgba(255, 255, 255, 0) 50%
				);
				z-index: 2;
			}
			.left_Gradient {
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				bottom: 0;
				background: linear-gradient(
					to right,
					rgb(255, 255, 255) 0%,
					rgba(255, 255, 255, 0) 50%
				);
				z-index: 2;
			}
		}
	}
}
</style>
