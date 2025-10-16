<script setup lang="ts">
import { isObject } from '@iceywu/utils'
import { toast } from 'vue-sonner'
import Loginabout from '@/components/Login/Loginabout.vue'
import { getMyInfo, updateUserInfo } from '~/api/admin'
import ImgIcon5 from '~/assets/image/icons/collect.png'
import ImgIcon3 from '~/assets/image/icons/contribute.png'
import ImgIcon1 from '~/assets/image/icons/home.png'
import ImgIcon4 from '~/assets/image/icons/setof.png'
import ImgIcon7 from '~/assets/image/icons/setup.png'
import ImgIcon6 from '~/assets/image/icons/subscribe.png'
import ImgIcon2 from '~/assets/image/icons/trends.png'
// import Sexman from "~/assets/image/icons.man.png"
// import Sexgirl from "~/assets/image/icons.girl.png"
// import { uploadFile } from '~/utils/upload'
import { useUserStore } from '~/stores/user'
import UserBottom from './components/UserBottom.vue'

const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)
const sex = ref('未知')
const isRegist = ref(false)

const backgroundUrl = computed(() => {
  const { backgroundInfo, background } = userInfo.value as any
  return isObject(backgroundInfo) ? backgroundInfo?.url : background
})

onMounted(() => {
  getMyInfoFunc()
})
const navRef1 = ref(null)

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
const chooseNav = computed(() => {
  return navList.value[activeIndex.value]
})
const navLeft = computed(() => {
  // activeIndex之前所有的宽度
  let left = 0
  for (let i = 0; i < activeIndex.value; i++) {
    left += navList.value[i].width
  }
  return left
})
const activeIndex = ref(0)

const navList = ref([
  {
    name: '主页',
    width: 80,
    svg: ImgIcon1,
  },
  {
    name: '动态',
    width: 80,
    svg: ImgIcon2,
  },
  {
    name: '投稿',
    width: 80,
    svg: ImgIcon3,
  },
  {
    name: '合集和列表',
    width: 180,
    svg: ImgIcon4,
  },
  {
    name: '收藏',
    width: 80,
    svg: ImgIcon5,
  },
  {
    name: '订阅',
    width: 80,
    svg: ImgIcon6,
  },
  {
    name: '设置',
    width: 80,
    svg: ImgIcon7,
  },
])

// 上传背景图

// const getDataLoading = ref(false);
// const getPhoto = async () => {
// if (getDataLoading.value) return;
// getDataLoading.value = true;
// const params = {};
//  const { code, msg, result = [] } = ({} = await updateUserInfo(params));
//  if (code === 0 && result) {

//  } else {

//  }
//      getDataLoading.value = false;
//  };
// updateUserInfo
// 编辑
function edit() {
  isShowDialog.value = true
}
const isShowDialog = ref(false)
const userBackground = computed(() => {
  return (
    backgroundUrl.value || 'https://assets.codepen.io/605876/miami-sunrise.jpeg'
  )
})

const userheadUpload = computed(() => {
  const { avatarInfo, avatar } = userInfo.value as any
  return isObject(avatarInfo) ? avatarInfo?.url : avatar
})
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
const editTarget = ref(null)
const clipperRef = ref(null)
function openUpload() {
  editTarget.value = 'backgroundInfoFileMd5'
  if (clipperRef.value) {
    clipperRef.value.uploadFile()
  }
}
// 头像上传
// const headphoto =ref(null)
function headUpload() {
  editTarget.value = 'avatarFileMd5'
  if (clipperRef.value) {
    clipperRef.value.uploadFile()
  }
}
// 编辑资料
const showEditInfo = ref(false)
</script>

<template>
	<clipperDialog
ref="clipperRef" :type="clipperData.type" :allow-type-list="clipperData.allowTypeList"
		:limit-size="clipperData.limitSize" :preview-width="clipperData.previewWidth" @confirm="onConfirm"
/>
	<div class="test h-full w-full">
		<header
class="header-box cursor-pointer z-[99]" @click="openUpload" @mouseenter="showEditInfo = true"
			@mouseleave="showEditInfo = false"
>
			<!-- <header class="header-box z-99 cursor-pointer" @click="open"> -->
			<img :src="userBackground" alt="" class="backdrop">
			<transition name="fade">
				<div v-show="showEditInfo" class="edit-info" @click.stop="edit">编辑个人资料</div>
			</transition>
			<div class="header__cover" />
		</header>
		<div class="intro z-[99]">
			<!-- <img :src="userInfo?.avatar" alt="" class="avatar" @click="headUpload"/> -->
			<img :src="userheadUpload" alt="" class="avatar" @click="headUpload">
			<div class="title-wrapper">
				<div class="title">
					<p class="user-name">
						@{{ userInfo?.name }}
					</p>
					<p class="desc">
						Jhey ʕ •ᴥ•ʔ
					</p>
				</div>
			</div>
		</div>
		<main class="w-full z-[1]">
			<UserBottom />
		</main>
		<div>
			<Loginabout v-if="isShowDialog" v-model="isShowDialog" />
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

.test {
  background: var(--gray-2);
  display: grid;
  min-height: 80vh;
  justify-items: center;
  overflow-x: hidden;
  align-content: start;
  overflow-y: auto;
}
.header-box {
  background: var(--surface-2);
  background-size: cover;
  max-width: 100%;
  width: var(--size-md);
  aspect-ratio: var(--aspect-ratio);
  height: 16em;
  position: relative;
  width: 100%;
  position: sticky;
  // top: calc((var(--header-scroll) * -1) + var(--title-height));
  top: -8.8em;
  transition: all 0.4s ease;
  &:hover {
    // filter: blur(5px);
    height: 24em;
  }
  .edit-info {
    position: absolute;
    right: 319px;
    bottom: 30px;
    border-radius: 4px;
    border: 1px solid #e8d4c9;
    padding: 7px 12px;
    z-index: 999 !important;
    opacity: 1;
  }

  //   v2过渡类名
  // .fade-enter,
  // .fade-leave-to
  // /* .fade-leave-active in <2.1.8 */

  // v3过渡类名
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0; //初始透明
  }
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.4s ease;
  }
}

.header__wrap {
  position: relative;
  view-timeline-name: --header;
}

.header__cover {
  position: absolute;
  inset: 0;
  background: hsl(0 0% 0% / 0.25);
  opacity: 0;
  backdrop-filter: blur(10px);
  animation: fade-in both linear;
  animation-timeline: scroll();
  animation-range: var(--cover-range);
}

@keyframes fade-in {
  to {
    opacity: 1;
  }
}

.backdrop {
  height: 100%;
  width: 100%;
  object-fit: cover;
  clip-path: inset(0 0 0 0);
  animation: fade-in-bg both linear;
  animation-timeline: scroll();
}
@keyframes fade-in-bg {
  0%,
  60% {
    filter: blur(0px);
  }

  to {
    filter: blur(100px);
  }
}

.avatar {
  // width: var(--size-6);
  width: 200px;
  height: 200px;
  aspect-ratio: 1;
  border-radius: 50%;
  border: var(--size-2) solid var(--gray-2);
  position: absolute;
  top: 0%;
  left: var(--size-4);
  translate: 0 -100%;
  transform-origin: 0% 50%;
  animation:
    scale-down both ease-out,
    look-down both steps(20);
  animation-timeline: scroll();
  animation-range: var(--avatar-range);
  /*     calc((var(--header-scroll) * 0.25) calc((var(--header-scroll) + (var(--title-height) * 2.2))); */
  z-index: 2;
  object-position: 0 0;
  object-fit: cover;
  background: linear-gradient(hsl(10 80% 50%), hsl(280 80% 50%));
}
@keyframes scale-down {
  to {
    scale: 0.35;
    top: 50%;
    translate: 0 -50%;
  }
}

@keyframes look-down {
  to {
    object-position: 100% 0;
  }
}

.intro {
  max-width: 100vw;
  width: var(--size-md);
  position: sticky;
  top: 0;
  margin-top: calc(var(--size-12) * 0.5);
}

.title {
  color: var(--gray-11);
  width: var(--size-md);
  max-width: 100vw;
  height: var(--title-height);
  gap: var(--size-2);
  padding: var(--size-4);
  animation: slide both ease;
  animation-timeline: scroll();
  animation-range: var(--title-range);
  p {
    text-align: start;
  }
  .user-name {
    font-size: var(--size-6);
    font-weight: 700;
    margin-bottom: 20px;
  }
  .desc {
    font-size: var(--size-4);
    font-weight: 400;
    cursor: pointer;
  }
}

@keyframes slide {
  0%,
  45% {
    color: var(--gray-11);
  }
  to {
    color: var(--gray-1);
    translate: calc(var(--size-12) * 0.5) 0;
  }
}

.title-wrapper {
  position: relative;
  width: 100vw;
  left: 50%;
  transform: translateX(-50%);
  display: grid;
  justify-content: center;
  animation: shadow both;
  animation-timeline: scroll();
  animation-range: var(--shadow-range);
}

@keyframes shadow {
  to {
    box-shadow: var(--shadow-4);
  }
}
</style>
