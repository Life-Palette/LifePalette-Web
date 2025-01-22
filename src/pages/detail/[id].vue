<script setup>
import { showPreView } from '@/utils/popup'
import { to } from '@iceywu/utils'
import {
	ElCarousel,
	ElCarouselItem,
	ElMessage,
	ElMessageBox,
} from 'element-plus'
// import { Starport } from 'vue-starport'
import { commentCreate } from '~/api/comment'
import { likeCreate, likeDelete, likeFindById } from '~/api/like'
import { messageCreate } from '~/api/message'
import { topicDelete, topicFindById } from '~/api/topic'
import BaseLike from '~/components/Base/Like.vue'
import PostForm from '~/components/post/index.vue'
import StarportCard from '~/components/StarportCard.vue'
import { useUserStore } from '~/stores/user'
import { formatTime } from '~/utils'
import { adjustImgData, getUserAvatar } from '~/utils/tools'

const props = defineProps({
	id: Number,
	data: Object,
})

const userStore = useUserStore()

const { userInfo } = storeToRefs(userStore)
const route = useRoute()
const router = useRouter()
const deId = ref('')
const dataDe = ref({})

const commentContent = ref('')
const tempFileUrl = ref('')

const fileList = ref([])
const isShowEdit = computed(() => {
	const { User } = dataDe.value
	return userInfo.value.id == User?.id
})
// 获取内容详情
async function getDataDe() {
	const parsms = {
		topicId: deId.value,
		exif: true,
	}
	isLogin.value && (parsms.userId = userInfo.value.id)
	const { code, msg, result } = ({} = await topicFindById(parsms))
	if (code === 200) {
		dataDe.value = result

		fileList.value
			= result?.fileList.map((item) => {
				return adjustImgData(item)
			}) || []
	}
 else {
	}
}

function onSwiper(swiper) {}
function onSlideChange() {}
const isInitDone = ref(false)
onMounted(() => {
	isInitDone.value = false

	const { id } = route.params
	const { imgCover } = route.query

	deId.value = id || props.id
	isInitDone.value = true
	dataDe.value = props.data
	fileList.value = props.data?.fileList
	getDataDe()
	getLikeData()
	getCommentData()
})

// 发送评论
const sendLoading = ref(false)
async function handleSendComment() {
	if (!commentContent.value || sendLoading.value)
return
	sendLoading.value = true
	const params = {
		content: commentContent.value,
		topicId: deId.value,
	}
	const { code, msg, result } = ({} = await commentCreate(params))
	if (code === 200) {
		commentContent.value = ''
		getCommentData()
	}
 else {
	}
	sendLoading.value = false
}
// 消息创建
async function handleMessageCreate() {
	const params = {
		receiverId: dataDe.value.userId,
		content: '点赞了你的文章',
		objId: deId.value,
		type: 'like',
	}
	const { code, msg, result } = ({} = await messageCreate(params))
	if (code === 200) {
	}
 else {
	}
}

const commentRef = ref(null)
// 获取评论
async function getCommentData() {
	if (!commentRef.value)
return
	await commentRef.value.getCommentData()
}
const comList = ref([])
const comNum = computed(() => {
	return comList.value.length || 0
})

async function handleLike() {
	const params = {
		topicId: deId.value,
	}
	const requestApi = dataDe.value.like ? likeDelete : likeCreate
	const { code, msg, result } = ({} = await requestApi(params))
	if (code === 200) {
		// getLikeData();
		if (dataDe.value.like) {
			dataDe.value.like = false
			likeList.value = likeList.value.filter(
				item => item.userId !== userInfo.value.id,
			)
		}
 else {
			dataDe.value.like = true
			likeList.value.push({
				userId: userInfo.value.id,
				topicId: deId.value,
			})
			ElMessage.success('点赞成功')
			// 消息创建
			handleMessageCreate()
		}
	}
 else {
		ElMessage.error('点赞失败')
	}
}
// 是否登录
const isLogin = computed(() => {
	return userInfo.value?.name
})
// 获取点赞信息
const likeList = ref([])
async function getLikeData() {
	const { code, msg, result } = ({} = await likeFindById({
		topicId: deId.value,
	}))
	if (code === 200) {
		likeList.value = result || []
	}
 else {
	}
}
// 标签信息
const tagDe = computed(() => {
	const tagNameList = dataDe.value?.tags || []
	return tagNameList.map(item => `#${item.title}`).join(' ')
})

const currentPlayIndex = ref(0)
function handleSwiperChange(index) {
	currentPlayIndex.value = index
}
const currentPlayInfo = computed(() => {
	return `${currentPlayIndex.value + 1}/${fileList.value.length}`
})
const isLive = computed(() => {
	const { videoSrc, fileType } = fileList.value[currentPlayIndex.value] || {}

	return fileType === 'IMAGE' && !!videoSrc
})
const showViewer = ref(false)
function previewisShow(data, index) {
	initialIndex.value = index
	// showViewer.value = true
	showPreView({
		urlList: fileList.value,
		initialIndex: index,
	})
}
const initialIndex = ref(0)
const fileSrc = computed(() => {
	return fileList.value.map((item) => {
		return adjustImgData(item).file
	})
})
const isShowDialog = ref(false)
function handleEdit() {
	isShowDialog.value = true
}
// 删除
function open(id) {
	ElMessageBox.confirm('确定删除吗', {
		confirmButtonText: '删除',
		cancelButtonText: '取消',
		type: 'warning',
	})
		.then(() => {
			getDelete(id)
		})
		.catch(() => {
			ElMessage({
				type: 'info',
				message: '取消删除',
			})
		})
}

// 🌈 接口数据请求
const getDataLoading = ref(false)
async function getDelete(id) {
	if (getDataLoading.value)
return
	getDataLoading.value = true
	const params = { id }
	// to is a function form (@iceywu/utils)
	const [err, res] = await to(topicDelete(params))
	if (res) {
		const { code, msg, data = [] } = res || {}
		if (code === 200 && data) {
			ElMessage({
				type: 'success',
				message: '删除成功',
			})
			router.back()
		}
 else {
			ElMessage({
				type: 'info',
				message: '删除失败',
			})
		}
	}
	if (err) {
	}
	getDataLoading.value = false
}
</script>

<template>
	<PostForm
		v-if="isShowDialog"
		v-model:is-show-dialog="isShowDialog"
		:data="dataDe"
	/>
	<div class="box-border h-full w-full flex gap-5">
		<el-image-viewer
			v-if="showViewer"
			:initial-index="initialIndex"
			:url-list="fileSrc"
			@close="() => (showViewer = false)"
		/>
		<div class="conten-box <2xl:flex-col">
			<div
				style="flex-shrink: 0"
				class="img-con relative flex-1 flex-shrink-0 <xl:h-80 <xl:w-full <xl:flex-initial"
			>
				<div v-if="fileList.length > 0" class="fraction">
					{{ currentPlayInfo }}
				</div>
				<div :port="`my-id${deId}`" style="height: 100%">
					<div class="relative h-full">
						<component
							:is="fileList.length > 1 ? ElCarousel : 'div'"
							:disabled="true"
							:autoplay="false"
							class="h-full w-full"
							motion-blur
							@change="handleSwiperChange"
						>
							<component
								:is="fileList.length > 1 ? ElCarouselItem : 'div'"
								v-for="(item, index) in fileList"
								:key="index"
								class="h-full w-full"
							>
								<StarportCard
									:data="item"
									:index
									:img-list="fileList"
									is-detail
								/>
							</component>
						</component>
					</div>
				</div>
			</div>
			<div class="de-content overflow-auto flex-1 bg-[#fff]">
				<!-- 用户信息 -->
				<section>
					<div class="content-user">
						<img
							class="img-avatar"
							block
							h-full
							w-full
							bg-gray-400:20
							object-cover
							:src="getUserAvatar(dataDe.User)"
						>
						<div class="user-name">
							{{ dataDe?.User?.name }}
						</div>
						<div class="flex-1" />
						<div
							v-if="isShowEdit"
							class="i-carbon-trash-can mr-2 cursor-pointer text-xl"
							@click="open(dataDe?.id)"
						/>
						<div
							v-if="isShowEdit"
							class="i-carbon-edit cursor-pointer text-xl"
							@click="handleEdit"
						/>
					</div>
				</section>
				<!-- 标题 -->
				<section
					class="title-part flex flex-1 flex-col overflow-auto <md:overflow-initial"
				>
					<!-- 标题 -->
					<div class="title-desc py-5">
						{{ dataDe.title }}
					</div>
					<!-- 内容 -->
					<div class="title-content py-5 text-start text-[#333]">
						{{ dataDe.content }}
					</div>
					<!-- 标签 -->
					<div class="title-content py-5 text-start text-lg text-[#13386c]">
						{{ tagDe }}
					</div>
					<!-- 时间 -->
					<div
						class="title-content py-5 text-start text-sm text-[rgb(51,51,51,0.6)]"
					>
						{{ formatTime(dataDe.createdAt, "YYYY-MM-DD HH:mm") }}
					</div>

					<div class="box-border w-full">
						<div class="h-[1px] w-full bg-[rgb(0,0,0,0.1)]" />
					</div>
					<!-- 标签列表 -->
					<div class="flex-1">
						<Comment
							v-if="isInitDone"
							:id="deId"
							ref="commentRef"
							v-model:com-list="comList"
						/>
					</div>
				</section>

				<section class="w-full flex flex-col gap-6 bg-white">
					<!-- 基本信息 -->
					<div class="flex gap-4 text-[#333]">
						<!-- 点赞 -->
						<div class="flex items-end gap-2">
							<!-- <div
                v-if="dataDe.like"
                class="i-carbon-favorite-filled text-[#ff4d4f] text-xl"
              ></div>
              <div v-else class="i-carbon-favorite text-xl"></div> -->
							<BaseLike
								v-model:is-like-pro="dataDe.like"
								@like-change="handleLike"
							/>
							<div class="text-sm">
								{{ likeList.length }}
							</div>
						</div>
						<!-- 收藏 -->
						<!-- <div class="flex gap-2 items-end">
              <div class="i-carbon-star text-xl"></div>
              <div class="text-sm">{{ 0 }}</div>
            </div> -->
						<!-- 评论 -->
						<div class="flex items-end gap-2">
							<div class="i-carbon-chat text-xl" />
							<div class="text-sm">
								{{ comNum }}
							</div>
						</div>
						<div class="flex-" />
					</div>
					<!-- 评论 -->

					<div class="w-full flex gap-5">
						<div class="input-wrapper flex-1">
							<input
								v-model="commentContent"
								class="comment-input"
								type="textarea"
								placeholder="说点什么..."
								data-tribute="true"
							>
							<div class="input-buttons">
								<div
									class="186, 186)] text-[rgb(186, i-carbon-face-activated-filled"
								/>
							</div>
						</div>

						<button
							class="overlay__btn overlay__btn--colors"
							@click="handleSendComment"
						>
							发送
						</button>
					</div>
				</section>
			</div>
			<!-- 返回按钮 -->
			<div
				v-if="0"
				class="close-icon"
				:class="{ 'mt-10': isLive }"
				@click="router.back()"
			>
				<div class="i-carbon-arrow-left" />
			</div>
		</div>
	</div>
</template>

<style lang="less" scoped>
// 隐藏滚动条
::-webkit-scrollbar {
	display: none;
}
.conten-box {
	height: 100%;
	width: 100%;
	background: rgba(255, 255, 255, 0.775);
	box-shadow: 0 0.75rem 2rem 0 rgba(0, 0, 0, 0.1);
	border-radius: 15px;
	border: 1px solid rgba(255, 255, 255, 0.125);
	//   高斯模糊
	backdrop-filter: blur(10px);
	-webkit-backdrop-filter: blur(10px);
	box-sizing: border-box;
	overflow: hidden;

	display: flex;
	position: relative;
	.img-con {
		border-radius: 15px;
		overflow: hidden;
	}
	.de-content {
		box-sizing: border-box;
		padding: 20px 24px;
		display: flex;
		flex-direction: column;
		gap: 20px;
	}
	.close-icon {
		position: absolute;
		top: 10px;
		left: 10px;
		z-index: 99999;
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 100%;
		width: 40px;
		height: 40px;
		border-radius: 40px;
		background: #fff;
		border: 1px solid rgba(0, 0, 0, 0.08);
		box-shadow:
			0 1px 2px rgba(0, 0, 0, 0.025),
			0 2px 8px rgba(0, 0, 0, 0.05);
		cursor: pointer;
		transition: all 0.3s;
		// color: var(--color-secondary-label);
	}
}
:deep(.el-carousel) {
	height: 100%;
	.el-carousel__container {
		height: 100%;
	}
}

// 用户信息
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
// 标题
.title-part {
	margin: 0 10px;
	.title-desc {
		text-align: left;
		font-weight: 600;
		font-size: 20px;
		line-height: 32px;
		color: #333;
	}
}
.input-wrapper {
	display: flex;
	position: relative;
	width: 100%;
	flex-shrink: 0;
	transition: flex 0.3s;

	.comment-input {
		box-sizing: border-box;
		padding: 12px 92px 12px 36px;

		background-repeat: no-repeat;
		background-size: 16px 16px;
		background-position: 16px 12px;
		width: 100%;
		height: 40px;
		line-height: 16px;
		background: #f5f5f5;
		caret-color: #5b92e1;
		border-radius: 22px;
		border: none;
		outline: none;
		// resize: none;
	}
	.input-buttons {
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 0 10px;
		.i-carbon-send {
			font-size: 20px;
			color: #5b92e1;
			cursor: pointer;
		}
	}
}
.overlay__btn {
	width: 100px;
	margin-top: 6px;

	height: 2.5rem;
	display: flex;
	justify-content: center;
	align-items: center;
	font-size: 0.875rem;
	font-weight: 600;

	background: hsl(276, 100%, 9%);
	color: hsl(0, 0%, 100%);
	border: none;
	border-radius: 0.5rem;
	transition: transform 450ms ease;
}

.overlay__btn:hover {
	transform: scale(1.05);
	cursor: pointer;
}

.overlay__btn-emoji {
	margin-left: 0.375rem;
}
.fraction {
	position: absolute;
	right: 28px;
	top: 24px;
	padding: 6px 14px;
	text-align: center;
	font-weight: 500;
	font-size: 12px;
	line-height: 16px;
	border-radius: 12px;
	z-index: 2;
	color: #fff;
	background: rgbs(64, 64, 64, 0.25);
	-webkit-backdrop-filter: saturate(150%) blur(10px);
	backdrop-filter: saturate(150%) blur(10px);
	// opacity: 0;
	transition: all 0.3s;
	// z-index: 99;
}
</style>
