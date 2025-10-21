<script setup lang="ts">
import type { FileItem } from '~/utils/fileProcessor'
import { ElMessage } from 'element-plus'
import { tagFindAll } from '~/api/tag'
import { topicCreate, topicEdit } from '~/api/topic'
import StarportCard from '~/components/StarportCard.vue'
import { useFileUpload } from '~/composables/useFileUpload'
import {
	extractFileIds,
	processLivePhotoFiles,
	removeFileByIndex,
} from '~/utils/fileProcessor'

const props = defineProps({
	isShowDialog: {
		type: Boolean,
		default: true,
	},
	isNeedBack: {
		type: Boolean,
		default: true,
	},
	data: {
		type: Object,
		default: () => {},
	},
})
const emit = defineEmits(['update:isShowDialog'])

const router = useRouter()

// 使用文件上传 composable
const { uploadState, uploadMultipleFiles, updateFileVideoSrc } = useFileUpload()

const { files, open, reset, onChange } = useFileDialog({
	accept: 'image/*,video/*,image/heic,image/heif',
})

function closeDialog() {
	emit('update:isShowDialog', false)
}

const fileList = ref<FileItem[]>([])
const formData = reactive({
	content: '',
	title: '',
	files: [],
	tagIds: [],
})

// 直接使用 uploadState 中的值
const upPercent = computed(() => uploadState.value.percent)
const upText = computed(() => uploadState.value.text)
const showUploadLoading = computed(() => uploadState.value.showLoading)

/**
 * 删除文件
 */
function deleteItem(index: number) {
	fileList.value = removeFileByIndex(fileList.value, index)
}

/**
 * 处理文件变化
 */
onChange(async (selectedFiles) => {
	if (!selectedFiles || selectedFiles.length === 0)
		return

	// 上传所有选中的文件
	const uploadedFiles = await uploadMultipleFiles(Array.from(selectedFiles))

	// 处理 Live Photo 文件关联
	const processedFiles = await processLivePhotoFiles(
		uploadedFiles,
		updateFileVideoSrc,
	)

	// 添加到文件列表
	fileList.value.push(...processedFiles)
})

// 创建话题
const saveLoading = ref(false)
async function handleSave() {
	const { id } = props.data || {}
	if (id) {
		handleEdit()
		return
	}
	if (saveLoading.value) {
		return
	}
	if (!formData.content) {
		ElMessage.error('请输入内容')
		return
	}
	if (!formData.title) {
		ElMessage.error('请输入标题')
		return
	}
	if (fileList.value.length === 0) {
		ElMessage.error('请上传图片')
		return
	}
	saveLoading.value = true

	// 提取文件 ID 列表
	const fileIds = extractFileIds(fileList.value)

	const params: any = {
		content: formData.content,
		title: formData.title,
		fileIds: fileIds.reverse(),
	}
	if (chooseTagIds.value.length > 0) {
		params.tagIds = chooseTagIds.value
	}

	// return

	const { code, msg, result } = (await topicCreate(params)) as any
	if (code === 200) {
		ElMessage.success('创建话题成功')
		closeDialog()
		if (props.isNeedBack) {
			router.back()
		}
 else {
			window.location.reload()
		}
	}
 else {
		ElMessage.error('创建话题失败')
	}
	saveLoading.value = false
}
async function handleEdit() {
	if (saveLoading.value)
return
	saveLoading.value = true
	const { id } = props.data
	const gps_data = addDataForm.value
	const extraData = JSON.stringify({ gps_data })
	const params = {
		id,
		extraData,
	}

	// return

	const { code, msg, result } = (await topicEdit(params)) as any

	if (code === 200) {
		ElMessage.success('编辑话题成功')
		closeDialog()
		if (props.isNeedBack) {
			router.back()
		}
	}
 else {
		ElMessage.error('编辑话题失败')
	}
	saveLoading.value = false
}
// 内容校验
function validateContent(rule: any, value: any, callback: any) {
	if (!value) {
		return callback(new Error('请输入内容'))
	}
	callback()
}
// 获取标签列表
const tagList = ref<any[]>([])
// 选中的标签
const chooseTagIds = ref<string[]>([])
async function getTestData() {
	const params = {
		sort: 'asc,createdAt',
	}
	const { code, msg, result } = (await tagFindAll(params)) as any

	if (code === 200) {
		const { data = [] } = result
		tagList.value = data
	}
 else {
	}
}
function handleTagClick(item: any) {
	const { id } = item
	if (chooseTagIds.value.includes(id)) {
		chooseTagIds.value = chooseTagIds.value.filter(item => item !== id)
	}
 else {
		chooseTagIds.value.push(id)
	}
}
// 数据初始化
async function initData() {
	tagList.value = []
	await getTestData()
	initExtraData()
}
onMounted(() => {
	initData()
})
const addDataForm = ref({
	lng: '',
	lat: '',
})
function initExtraData() {
	const { extraData } = props.data || {}
	if (extraData) {
		const { gps_data } = JSON.parse(extraData)
		addDataForm.value.lng = gps_data.lng
		addDataForm.value.lat = gps_data.lat
	}
}
</script>

<template>
	<div class="form-box">
		<div>发表</div>
		<template v-if="data?.id">
			<!-- 经度 -->
			<section class="post-item">
				<div class="post-title">经度</div>
				<div class="post-title-box">
					<input
						v-model="addDataForm.lng"
						type="text"
						class="input-title"
						maxlength="30"
						placeholder="请输入经度"
					>
				</div>
			</section>
			<!-- 纬度 -->
			<section class="post-item">
				<div class="post-title">纬度</div>
				<div class="post-title-box">
					<input
						v-model="addDataForm.lat"
						type="text"
						class="input-title"
						maxlength="30"
						placeholder="请输入纬度"
					>
				</div>
			</section>
		</template>
		<template v-else>
			<!-- 图片 -->
			<section class="post-item">
				<div class="post-title">图片</div>
				<div class="post-content">
					<div v-for="(item, index) in fileList" :key="index" class="img-item">
						<div class="upload-item relative">
							<!-- 删除按钮 -->
							<div
								class="i-carbon-delete absolute right-2 top-2 z-9999 cursor-pointer"
								@click="deleteItem(index)"
							/>
							<!-- live-tag -->
							<div class="absolute bottom-2 right-2 z-99 cursor-pointer">
								<el-tag v-if="item.videoSrc" round type="primary">
									live
								</el-tag>
							</div>
							<!-- 图片 -->
							<template v-if="item.type.includes('image')">
								<!-- <el-image class="h-full w-full" fit="cover" :src="item.file">
									<template #placeholder>
										<div class="image-slot">
											Loading<span class="dot">...</span>
										</div>
									</template>
								</el-image> -->
								<!-- {{ item }} -->
									<div class="h-full w-full">
<StarportCard :data="item" />
									</div>
							</template>
							<!-- 视频 -->
							<template v-else-if="item.type.includes('video')">
								<video
									class="h-full w-full"
									controls
									:src="item.file"
									type="video/mp4"
									:poster="item.cover"
								/>
							</template>
						</div>
					</div>

					<div class="add-icon">
						<button type="button" @click="() => open()">
							<div class="i-carbon-add text-5xl text-[#4c4d4f]" />
						</button>
					</div>
				</div>
			</section>
			<!-- 标题 -->
			<section class="post-item">
				<div class="post-title">标题</div>
				<div class="post-title-box">
					<input
						v-model="formData.title"
						type="text"
						class="input-title"
						maxlength="30"
						placeholder="请输入标题"
					>
				</div>
			</section>
			<!-- 内容 -->
			<section class="post-item">
				<div class="post-title">内容</div>
				<div class="post-conten-box">
					<textarea
						v-model="formData.content"
						type="textarea"
						class="input-textarea"
						placeholder="请输入内容"
					/>
				</div>
			</section>
			<!-- 标签 -->
			<section class="post-item">
				<div class="post-title">标签</div>
				<div class="post-tag-box">
					<div
						v-for="(item, index) in tagList"
						:key="index"
						class="tag-item"
						:class="{ 'tag-item-active': chooseTagIds.includes(item.id) }"
						@click="handleTagClick(item)"
					>
						{{ item.title }}
					</div>
				</div>
			</section>
		</template>

		<!-- 按钮 -->
		<section class="post-btn">
			<button class="overlay__btn overlay__btn--colors" @click="handleSave">
				<span>
					{{ data?.id ? "编辑" : "发布" }}
				</span>
				<span class="overlay__btn-emoji">💕</span>
			</button>
		</section>
	</div>

	<LoadingUpload
		v-model:percent="upPercent"
		v-model:text="upText"
		v-model:is-show="showUploadLoading"
	/>
</template>

<style lang="less" scoped>
.form-box {
	// height: 450px;
	display: flex;
	flex-direction: column;
	// align-items: center;
	box-sizing: border-box;
	gap: 15px;
	width: 100%;
	padding: 30px 30px;
	background: rgba(255, 255, 255, 0.775);
	box-shadow: 0 0.75rem 2rem 0 rgba(0, 0, 0, 0.1);
	border-radius: 15px;
	border: 1px solid rgba(255, 255, 255, 0.125);
	//   高斯模糊
	backdrop-filter: blur(10px);
	-webkit-backdrop-filter: blur(10px);
	position: relative;
	overflow: hidden;
	.post-item {
		display: flex;
		flex-direction: column;
		gap: 10px;
		.post-title {
			font-size: 20px;
			font-weight: 900;
		}
	}
	.post-btn {
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		.overlay__btn {
			margin-top: 6px;
			width: 100%;
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
	}
}
// 文件
.post-content {
	display: flex;
	flex-wrap: wrap;
	gap: 10px;
	.img-item {
		width: 150px;
		height: 200px;
		position: relative;
		border-radius: 10px;
		overflow: hidden;
		.upload-item {
			width: 100%;
			height: 100%;
			.el-image {
				width: 100%;
				height: 100%;
			}
		}
	}
	.add-icon {
		width: 150px;
		height: 200px;
		position: relative;
		border-radius: 10px;
		overflow: hidden;
		display: flex;
		justify-content: center;
		align-items: center;
		border: 1px dashed #4c4d4f;
		button {
			width: 100%;
			height: 100%;
			background: transparent;
			border: none;
			border-radius: 10px;
			cursor: pointer;
			display: flex;
			justify-content: center;
			align-items: center;
		}
	}
}
// 标题
.post-title-box {
	.input-title {
		box-sizing: border-box;
		border: 1px solid transparent;
		cursor: pointer;

		outline: none;
		width: 100%;
		padding: 16px 10px;
		background-color: rgba(247, 243, 243, 0.5);
		border-radius: 10px;
		box-shadow:
			12.5px 12.5px 10px rgba(0, 0, 0, 0.015),
			100px 100px 80px rgba(0, 0, 0, 0.03);
		&:focus {
			border: 1px solid rgb(23, 111, 211);
		}
	}
}
// 内容
.post-conten-box {
	.input-textarea {
		box-sizing: border-box;
		border: 1px solid transparent;
		cursor: pointer;
		outline: none;
		width: 100% !important;
		min-height: 100px;
		padding: 16px 10px;
		background-color: rgba(247, 243, 243, 0.5);
		border-radius: 10px;
		box-shadow:
			12.5px 12.5px 10px rgba(0, 0, 0, 0.015),
			100px 100px 80px rgba(0, 0, 0, 0.03);
		&:focus {
			border: 1px solid rgb(23, 111, 211);
		}
	}
}
// 标签
.post-tag-box {
	display: flex;
	flex-wrap: wrap;
	gap: 10px;
	.tag-item {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 0 10px;
		height: 30px;
		border-radius: 15px;
		background: #f5f5f5;
		cursor: pointer;
		&:hover {
			background: #e5e5e5;
		}
		&-active {
			background: #4c4d4f;
			color: #fff;
			&:hover {
				background: #4c4d4f;
			}
		}
	}
}
</style>

<style lang="less">
.no-dlg-bg-class {
	background: none !important;
	.el-dialog__header {
		display: none;
	}
	.el-dialog__body {
		padding: 0;
	}
}
</style>
