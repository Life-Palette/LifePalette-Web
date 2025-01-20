<script setup lang="ts">
import { adjustImgData, getUserAvatar } from '~/utils/tools'

const props = defineProps({

	data: Object,

})
</script>

<template>
	<div class="item-box min-h-80">
		<!-- 封面 -->
		<div class="img-cover max-h-100 flex-1">
			<Starport
				:port="`my-id${data.id}`"
				class="h-full w-full transition-all duration-800"
			>
				<StarportCard :data="data.fileList[0]" />
			</Starport>
		</div>
		<!-- 描述 -->
		<div class="content-desc">
			<div class="content-desc-title">
				{{ data.title }}
			</div>
			<div class="content-user">
				<img
					class="img-avatar"
					block
					h-full
					w-full
					bg-gray-400:20
					object-cover
					:src="getUserAvatar(data.User)"
				>
				<div class="user-name">
					{{ data.User.name }}
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="less" scoped>
	.item-box {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.img-cover {
		border-radius: 10px;
		overflow: hidden;
	}
	.content-desc {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 5px;
		.content-desc-title {
			text-align: left;
			font-weight: 500;
			font-size: 14px;
			// color: #333;
			// 最多显示两行
			overflow: hidden;
			text-overflow: ellipsis;
			display: -webkit-box;
			-webkit-line-clamp: 2;
			-webkit-box-orient: vertical;
		}
		.content-user {
			display: flex;
			align-items: center;
			gap: 6px;
			.img-avatar {
				width: 30px;
				height: 30px;
				border-radius: 20px;
				border: 0.5px solid #e6e6e6;
			}
			.user-name {
				color: #666;
				font-size: 16px;
			}
		}
	}
</style>
