<script setup lang="ts">
import { isObject } from '@iceywu/utils'
import { usePopup } from 'vue-hooks-pure'
import { toast } from 'vue-sonner'
import Loginabout from '@/components/Login/Loginabout.vue'
import { getMyInfo, updateUserInfo } from '~/api/admin'
import { useUserStore } from '~/stores/user'

import UserBottom from './components/UserBottom.vue'

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
			toast.error('更新用户信息失败')
		},
	))
	if (code === 200) {
		toast.success('更新用户信息成功')
	}
 else {
		toast.error('更新用户信息失败')
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
	// isShowDialog.value = true
	usePopup(Loginabout)
		.then((res) => {
			console.log('🐳-----res-----', res)
		})
		.catch((err) => {
			console.log('🐳-----err-----', err)
		})
}
onMounted(() => {
	getMyInfoFunc()
})
</script>

<template>
	<!-- 更换背景 -->
	<clipperDialog
ref="clipperRef" :type="clipperData.type" :allow-type-list="clipperData.allowTypeList"
		:limit-size="clipperData.limitSize" :preview-width="clipperData.previewWidth" @confirm="onConfirm"
/>
	<!-- 编辑个人信息 -->
	<!-- <Loginabout v-if="true" v-model="isShowDialog" /> -->
	<div class="Personal-Center h-full w-full">
		<div class="Personal-content">
			<div class="PerCard">
				<div class="PerBox">
					<div class="image-container">
						<img
							:src="userheadUpload"
							alt=""
							class="headImg"
							@click="headUpload"
						>
						<div class="overlay">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="82"
								height="82"
								viewBox="0 0 24 24"
							>
								<path
									fill="#ffffff"
									d="M11.5 8C14 8 16 10 16 12.5S14 17 11.5 17S7 15 7 12.5S9 8 11.5 8m0 1A3.5 3.5 0 0 0 8 12.5a3.5 3.5 0 0 0 3.5 3.5a3.5 3.5 0 0 0 3.5-3.5A3.5 3.5 0 0 0 11.5 9M5 5h2l2-2h5l2 2h2a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3m4.41-1l-2 2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-2.41l-2-2z"
								/>
							</svg>
							<span class="text-[15px] text-white">修改我的头像</span>
						</div>
					</div>

					<div class="headright">
						<div class="headName">{{ userInfo.name }}</div>
						<!-- <div class="headlist">
							<div v-for="(item) in headlist">
								<div class="headitem">
									{{ item.name }}
									<span class="headitems">{{ item.number }}</span>
								</div>
							</div>
						</div> -->
						<div class="ifePa">
							ColourID: <span class="id-entifier">{{ "#154D56F51" }}</span>
						</div>
						<div class="sign">
							<span class="signtext">{{
								userInfo.signature || "这个人很懒，什么都没有留下..."
							}}</span>
							<span class="InforData" @click="EditInfo">编辑个人资料</span>
						</div>
					</div>
				</div>
			</div>
			<div
				class="backgrImg" :style="{
				backgroundImage: `url('${userBackground}')`,
				backgroundSize: 'cover',
			}" @click="openUpload"
>
				<div class="top_Gradient" />
				<div class="right_Gradient" />
				<div class="left_Gradient" />
				<div class="bottom_Gradient" />
			</div>
		</div>
		<!-- 地图 -->
		<main class="con-main-box z-[1]">
			<UserBottom />
		</main>
	</div>
</template>

<style lang="less" scoped>
.con-main-box {
  height: calc(100vh - 400px);
  // background: red;
  width: 100%;
}
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
  --cover-range: calc(var(--header-scroll) - (var(--title-height))) calc(var(--header-scroll) * 1);
  --title-range: calc((var(--header-scroll) - (var(--title-height) * 2)))
    calc((var(--header-scroll) - (var(--title-height) * -0.25)));
  --avatar-range:
    calc((var(--header-scroll) - (var(--title-height) * 1.5)))
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
    position: relative;
    /* 确保容器有相对定位 */
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
        .image-container {
          width: 170px;
          height: 170px;
          position: relative;
          // background-color: #374151;
        }
        .headImg {
          // width: 170px;
          // height: 170px;
          border-radius: 50%;
          object-fit: cover;
          cursor: pointer;
        }
        .overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          opacity: 0; /* 初始蒙层 */
          transition: opacity 0.3s ease;
          pointer-events: none; /* 防止蒙层干扰点击事件 */
        }

        .image-container:hover .overlay {
          opacity: 1;
        }
        .headright {
          text-align: left;
          min-height: 170px;
          margin-left: 15px;
          font-size: 18px;
          display: flex;
          flex-direction: column;
          justify-content: space-around;

          .headName {
            font-size: 26px;
            font-weight: 600;
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
            font-size: 18px;
            // color: #1d1f2b99;
            color: #556072;
            .id-entifier {
              font-size: 14px;
            }
          }

          .sign {
            font-size: 16px;
            color: #1d1f2b99;
            margin-top: 22px;
            display: flex;
            position: relative;

            .signtext {
              display: inline-block;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              width: 300px;
              color: #556072;
            }

            .InforData {
              position: absolute;
              right: -120px;
              bottom: 0;
              z-index: 2;
              border-radius: 4px;
              opacity: 1;
              z-index: 2;

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
      z-index: 1;

      .top_Gradient {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(to bottom, rgb(255, 255, 255) 0%, rgba(255, 255, 255, 0) 50%);
        z-index: 2;
      }

      .right_Gradient {
        position: absolute;
        top: 0;
        left: 0;
        right: -140px;
        bottom: 0;
        background: linear-gradient(to left, rgb(255, 255, 255) 0%, rgba(255, 255, 255, 0) 50%);
        z-index: 2;
      }

      .bottom_Gradient {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(to top, rgb(255, 255, 255) 0%, rgba(255, 255, 255, 0) 50%);
        z-index: 2;
      }

      .left_Gradient {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(to right, rgb(255, 255, 255) 0%, rgba(255, 255, 255, 0) 50%);
        z-index: 2;
      }
    }
  }
}
</style>
