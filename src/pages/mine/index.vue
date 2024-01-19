<script setup lang="ts">
import { getMyInfo, updateUserInfo } from '~/api/admin'
import { ElMessage } from 'element-plus'
import ImgIcon1 from '~/assets/image/icons/home.png'
import ImgIcon2 from '~/assets/image/icons/trends.png'
import ImgIcon3 from '~/assets/image/icons/contribute.png'
import ImgIcon4 from '~/assets/image/icons/setof.png'
import ImgIcon5 from '~/assets/image/icons/collect.png'
import ImgIcon6 from '~/assets/image/icons/subscribe.png'
import ImgIcon7 from '~/assets/image/icons/setup.png'
import ImgBackground from '~/assets/image/icons/sakura.jpg'
// import Sexman from "~/assets/image/icons.man.png"
// import Sexgirl from "~/assets/image/icons.girl.png"
import Loginabout from '~/components/Login/Loginabout.vue'
import UserBottom from './components/UserBottom.vue'
import { uploadFile } from '~/utils/upload'
import { useUserStore } from '~/stores/user'
import { uploadBase } from '~/api/ossUpload'
const userStore = useUserStore()
const sex = ref('未知')
const isRegist = ref(false)

const Background = ref()
// const backgroundBg = computed(()=>{
// const {background} = userInfo.value
//   return background || ImgBackground
// })

// const { getPhoto,  } = useFileDialog({    //更换背景
//   accept: "image/*",
// });

const { files, open, reset, onChange } = useFileDialog({
	//更换头像
	accept: 'image/*',
})
const upPercent = ref(0)
const showUploadLoading = ref(false)
onChange(async (file) => {
	// loading
	upPercent.value = 0
	showUploadLoading.value = true
	for (let i = 0; i < file.length; i++) {
		const data = new FormData()
		data.append('file', file[i])
		const { code, msg, result } = await await uploadBase(data)
		if (code === 200) {
			console.log('文件上传成功', result)
			showUploadLoading.value = false
			const { url } = result
			console.log('文件上传成功', url)
			await updateUserInfoFunc(url)
			getMyInfoFunc(0)
		} else {
			ElMessage.error(msg)
		}
	}
	showUploadLoading.value = false
})

onMounted(() => {
	getMyInfoFunc()
	console.log(Background.value)
})
const navRef1 = ref(null)

const userInfo = ref({})
//获取用户信息
const getMyInfoFunc = async () => {
	const params = {}
	const { code, msg, result } = ({} = await getMyInfo())
	if (code === 200) {
		console.log('获取标签列表成功', result)
		userInfo.value = result || {}
		userStore.setUserInfo(result)
		console.log('🌳-----result-----', result)
		const Background = result.background
		return Background
	} else {
		console.log('获取标签列表失败', msg)
	}
}

// 更新用户信息
const updateLoading = ref(false)
const updateUserInfoFunc = async (url) => {
	if (updateLoading.value) return
	updateLoading.value = true
	const params = {
		background: url,
		// name: "suan",
		// avatar,
		// // github: null,
		// // wakatime: null,
		// // wechat: null,
		// // gitee: null,
		// // qq: "3128006406@qq.com",
	}
	const { code, msg, result } = ({} = await updateUserInfo(params).catch(
		(err) => {
			console.log('err', err)
			updateLoading.value = false
			ElMessage.error('更新用户信息失败')
		},
	))
	if (code === 200) {
		console.log('更新用户信息成功', result)

		ElMessage.success('更新用户信息成功')
	} else {
		console.log('更新用户信息失败', msg)
		ElMessage.error('更新用户信息失败')
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
//  console.log('---数据请求成功---', result);
//  } else {
//    console.log('---数据请求失败---', msg);
//  }
//      getDataLoading.value = false;
//  };
// updateUserInfo
// 编辑
const edit = () => {
	isShowDialog.value = true
	console.log(1)
}
const isShowDialog = ref(false)
const userBackground = computed(() => {
	return (
		userInfo.value.background ||
		'https://assets.codepen.io/605876/miami-sunrise.jpeg'
	)
})
const clipperData = {
	type: 'browserLogo', // 该参数可根据实际要求修改类型
	allowTypeList: ['png', 'jpg', 'jpeg', 'peeee'], // 允许上传的图片格式
	previewWidth: 100, // 预览宽度
}
const onConfirm = async (data: any) => {
	console.log('onConfirm', data)
	const { url } = data
	// console.log('文件上传成功', url)
	await updateUserInfoFunc(url)
	getMyInfoFunc()
}
const clipperRef = ref(null)
const openUpload = () => {
	if (clipperRef.value) {
		clipperRef.value.uploadFile()
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
	<div class="test h-full w-full">
		<header class="header-box z-99 cursor-pointer" @click="openUpload">
			<!-- <header class="header-box z-99 cursor-pointer" @click="open"> -->
			<img :src="userBackground" alt="" class="backdrop" />
			<div class="header__cover"></div>
		</header>
		<div class="intro z-99">
			<img :src="userInfo.avatar" alt="" class="avatar" />
			<div class="title-wrapper">
				<div class="title">
					<p class="user-name">@{{ userInfo.name }}</p>
					<p class="desc">Jhey ʕ •ᴥ•ʔ</p>
					<!-- <h1>Jhey ʕ •ᴥ•ʔ</h1>
					<h4>@{{ userInfo.name }}</h4> -->
				</div>
			</div>
		</div>
		<main class="z-1 w-full">
			<UserBottom />
		</main>
	</div>
</template>

<style lang="less" scoped>
@import 'https://unpkg.com/normalize.css';
@import 'https://unpkg.com/open-props/normalize.min.css';
@import 'https://unpkg.com/open-props/open-props.min.css';

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
	width: var(--size-12);
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
