<script lang="ts" setup>
import { defineEmits, defineProps, ref } from 'vue'

const props = defineProps({
	mediaWidth: Number,
	images: {
		type: Array as PropType<string[]>,
		default: () => [],
	},
	content: {
		type: Object,
		default: () => ({
			title: '',
			description: '',
			likes: 0,
			isLiked: false,
			comments: [],
		}),
	},
})

const emit = defineEmits(['close', 'like', 'comment'])

const currentImageIndex = ref(0)
const commentText = ref('')

function close() {
	emit('close')
}

function nextImage() {
	if (currentImageIndex.value < props.images.length - 1) {
		currentImageIndex.value++
	}
}

function prevImage() {
	if (currentImageIndex.value > 0) {
		currentImageIndex.value--
	}
}

function handleLike() {
	emit('like')
}

function submitComment() {
	if (commentText.value.trim()) {
		emit('comment', commentText.value)
		commentText.value = ''
	}
}
</script>

<template>
	<div class="dialog" @click="close">
		<div class="dialog-content" @click.stop>
			<div class="left-container" :style="{ width: `${50}%` }">
				<div class="image-carousel">
					<button v-show="currentImageIndex > 0" class="carousel-btn prev" @click="prevImage">
						<i class="fas fa-chevron-left" />
					</button>
					<img :src="images[currentImageIndex]" alt="" class="dialog-image">
					<button
v-show="currentImageIndex < images.length - 1" class="carousel-btn next"
							@click="nextImage"
>
						<i class="fas fa-chevron-right" />
					</button>
					<div class="image-indicator">
						{{ currentImageIndex + 1 }}/{{ images.length }}
					</div>
				</div>
			</div>

			<div class="right-container">
				<div class="content-wrapper">
					<h2 class="title">{{ content.title }}</h2>

					<div class="description">
						{{ content.description }}
					</div>

					<div class="interaction-bar">
						<button class="like-btn" :class="{ active: content.isLiked }" @click="handleLike">
							<i class="fas" :class="content.isLiked ? 'fa-heart' : 'fa-heart-o'" />
							<span>{{ content.likes }}</span>
						</button>
					</div>

					<div class="comments-section">
						<h3>评论 ({{ content.comments.length }})</h3>
						<div class="comments-list">
							<div
v-for="(comment, index) in content.comments"
								 :key="index"
								 class="comment-item"
>
								<div class="comment-avatar">
									<img :src="comment.avatar" alt="">
								</div>
								<div class="comment-content">
									<div class="comment-user">{{ comment.username }}</div>
									<div class="comment-text">{{ comment.text }}</div>
									<div class="comment-time">{{ comment.time }}</div>
								</div>
							</div>
						</div>

						<div class="comment-input">
							<input
v-model="commentText"
									type="text"
									placeholder="添加评论..."
									@keyup.enter="submitComment"
>
							<button @click="submitComment">发送</button>
						</div>
					</div>
				</div>
			</div>

			<button class="close-btn" @click="close">
				<i class="fas fa-times" />
			</button>
		</div>
	</div>
</template>

<style scoped>
.dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: transparent;
  transition: background-color 0.4s;
  z-index: 9999;
}

.dialog-content {
  display: flex;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(1);
  height: calc(100% - 64px);
  background-color: #fff;
  border-radius: 20px;
  overflow: visible;
	width: 90vw;
	overflow: hidden;
}

.left-container {
	flex-shrink: 0;
	flex-grow: 0;
	height: 100%;
	position: relative;
}

.image-carousel {
	position: relative;
	width: 100%;
	height: 100%;
}

.dialog-image {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.carousel-btn {
	position: absolute;
	top: 50%;
	transform: translateY(-50%);
	background: rgba(255, 255, 255, 0.9);
	border: none;
	border-radius: 50%;
	width: 40px;
	height: 40px;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.2s;
}

.carousel-btn:hover {
	background: #fff;
}

.carousel-btn.prev {
	left: 20px;
}

.carousel-btn.next {
	right: 20px;
}

.image-indicator {
	position: absolute;
	bottom: 20px;
	right: 20px;
	background: rgba(0, 0, 0, 0.6);
	color: white;
	padding: 4px 12px;
	border-radius: 12px;
	font-size: 14px;
}

.right-container {
	width: 440px;
	flex-shrink: 0;
	flex-grow: 0;
	border-radius: 0 24px 24px 0;
	overflow: auto;
	background: #f8f9fa;
}

.content-wrapper {
	padding: 32px;
}

.title {
	font-size: 24px;
	font-weight: 600;
	margin-bottom: 16px;
	color: #1a1a1a;
}

.description {
	font-size: 16px;
	line-height: 1.6;
	color: #4a4a4a;
	margin-bottom: 24px;
}

.interaction-bar {
	display: flex;
	align-items: center;
	padding: 16px 0;
	border-bottom: 1px solid #eee;
	margin-bottom: 24px;
}

.like-btn {
	display: flex;
	align-items: center;
	gap: 6px;
	background: none;
	border: none;
	color: #666;
	cursor: pointer;
	padding: 8px 16px;
	border-radius: 20px;
	transition: all 0.2s;
}

.like-btn:hover {
	background: #f0f0f0;
}

.like-btn.active {
	color: #ff4757;
}

.comments-section {
	margin-top: 24px;
}

.comments-section h3 {
	font-size: 18px;
	margin-bottom: 16px;
	color: #1a1a1a;
}

.comments-list {
	margin-bottom: 24px;
}

.comment-item {
	display: flex;
	gap: 12px;
	margin-bottom: 20px;
}

.comment-avatar img {
	width: 40px;
	height: 40px;
	border-radius: 50%;
	object-fit: cover;
}

.comment-content {
	flex: 1;
}

.comment-user {
	font-weight: 600;
	margin-bottom: 4px;
	color: #1a1a1a;
}

.comment-text {
	color: #4a4a4a;
	line-height: 1.5;
	margin-bottom: 4px;
}

.comment-time {
	font-size: 12px;
	color: #999;
}

.comment-input {
	display: flex;
	gap: 12px;
	margin-top: 16px;
}

.comment-input input {
	flex: 1;
	padding: 12px 16px;
	border: 1px solid #ddd;
	border-radius: 20px;
	outline: none;
	transition: all 0.2s;
}

.comment-input input:focus {
	border-color: #666;
}

.comment-input button {
	padding: 8px 20px;
	background: #1a1a1a;
	color: white;
	border: none;
	border-radius: 20px;
	cursor: pointer;
	transition: all 0.2s;
}

.comment-input button:hover {
	background: #333;
}

.close-btn {
	position: absolute;
	top: 20px;
	right: 20px;
	background: rgba(255, 255, 255, 0.9);
	border: none;
	border-radius: 50%;
	width: 36px;
	height: 36px;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.2s;
}

.close-btn:hover {
	background: #fff;
}

@keyframes dialog-appear {
	from {
		opacity: 0;
		transform: scale(0.95);
	}
	to {
		opacity: 1;
		transform: scale(1);
	}
}
</style>
