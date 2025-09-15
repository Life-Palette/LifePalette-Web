<script setup lang="ts">
const fileData = {
	id: 684,
	name: 'wx.png',
	path: '/nestTest/1',
	type: 'image/png',
	blurhash: 'LOEh]h60E_}cGWr?wNK49=o|X8n4',
	videoSrc: null,
	fileMd5: '867dea58972c942c44732a05375ed567',
	url: 'http://nest-js.oss-accelerate.aliyuncs.com/nestTest/1/1727785177394.png',
	size: 106660,
	userId: 1,
	createdAt: '2024-10-01T12:19:38.335Z',
	updatedAt: '2024-10-01T12:19:38.335Z',
	exif: {
		id: 684,
		name: 'wx.png',
		path: '/nestTest/1',
		type: 'image/png',
		blurhash: 'LOEh]h60E_}cGWr?wNK49=o|X8n4',
		videoSrc: null,
		fileMd5: '867dea58972c942c44732a05375ed567',
		fileType: 'IMAGE',
		url: 'http://nest-js.oss-accelerate.aliyuncs.com/nestTest/1/1727785177394.png',
		file: 'http://nest-js.oss-accelerate.aliyuncs.com/nestTest/1/1727785177394.png',
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
	<a class="icon-link" href="https://open.weixin.qq.com/sns/getexpappinfo?appid=wxe04e1c650748514c&path=pages/index.html#wechat-redirect" target="_blank">Life Palette</a> 小程序体验版开放啦，扫描二维码体验!🎉
	1.支持扫描登录web端
	2.支持微信直接发送动态（全端同步）
	（Tip: 因为还没上正式版，所以扫码后需要点击一下申请体验哦！😊）
`)
</script>

<template>
	<el-drawer v-model="isShowDrawer" append-to-body title="小程序体验通知🎉">
		<div class="h-[50vw] cursor-pointer relative overflow-hidden">
			<h1 class="whitespace-break-spaces" v-html="showWords" />
			<div class="mt-40 w-full">
				<l-p-image :data="fileData?.exif" is-show-base object-fit="contain" />
			</div>
		</div>
	</el-drawer>
</template>

<style lang="less" scoped></style>
