<script setup lang="ts">
const fileData = {
	id: 684,
	name: 'wx.png',
	path: '/nestTest/1',
	type: 'image/png',
	blurhash: 'LXQ9}}xb~qWUs;W-jujH~qjbD%a{',
	videoSrc: null,
	fileMd5: '867dea58972c942c44732a05375ed567',
	url: 'https://lpalette.oss-accelerate.aliyuncs.com/nestTest/1/1761513172023.png',
	size: 106660,
	userId: 1,
	createdAt: '2024-10-01T12:19:38.335Z',
	updatedAt: '2024-10-01T12:19:38.335Z',
	exif: {
		id: 684,
		name: 'wx.png',
		path: '/nestTest/1',
		type: 'image/png',
		blurhash: 'LXQ9}}xb~qWUs;W-jujH~qjbD%a{',
		videoSrc: null,
		fileMd5: '867dea58972c942c44732a05375ed567',
		fileType: 'IMAGE',
		url: 'https://lpalette.oss-accelerate.aliyuncs.com/nestTest/1/1761513172023.png',
		file: 'https://lpalette.oss-accelerate.aliyuncs.com/nestTest/1/1761513172023.png',
		size: 106660,
		userId: 1,
		createdAt: '2024-10-01T12:19:38.335Z',
		updatedAt: '2024-10-01T12:19:38.387Z',
		exif: '{"FileSize":{"value":"106660"},"Format":{"value":"png"},"FrameCount":{"value":"1"},"ImageHeight":{"value":"662"},"ImageWidth":{"value":"1190"}}',
	},
}
const isShowDrawer = defineModel({
	default: false,
})
const showWords = ref(`
	<a class="icon-link" href="https://open.weixin.qq.com/sns/getexpappinfo?appid=wxe04e1c650748514c&path=pages/index.html#wechat-redirect" target="_blank">Life Palette</a> 小程序正式版开放啦，扫描二维码体验!🎉
`)
</script>

<template>
	<el-drawer v-model="isShowDrawer" append-to-body title="小程序体验通知🎉">
		<div class="relative cursor-pointer overflow-hidden h-50vw">
			<h1 class="whitespace-break-spaces" v-html="showWords" />
			<div class="w-full mt-40">
				<l-p-image :data="fileData?.exif" is-show-base object-fit="contain" />
			</div>
		</div>
	</el-drawer>
</template>

<style lang="less" scoped></style>
