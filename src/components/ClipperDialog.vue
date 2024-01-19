<template>
	<el-dialog
		v-model="dialogVisible"
		append-to-body
		:title="'图片裁剪'"
		:width="'40%'"
		:z-index="99999"
		@close="dialogVisible = false"
	>
		<template #default>
			<div class="cropper">
				<div class="cropper_left">
					<vueCropper
						ref="cropperRef"
						:style="{ width: '400px' }"
						:img="options.img"
						:info="true"
						:info-true="options.infoTrue"
						:auto-crop="options.autoCrop"
						:fixed-box="options.fixedBox"
						:can-move="options.canMoveBox"
						:can-scale="options.canScale"
						:fixed-number="options.fixedNumber"
						:fixed="options.fixed"
						:full="options.full"
						:center-box="options.centerBox"
						@real-time="previewHandle"
					/>
					<div class="reupload_box">
						<div class="reupload_text" @click="uploadFile('reload')">
							重新上传
						</div>
						<div flex gap-2>
							<div
								i-carbon-intent-request-scale-out
								icon-btn
								@click="changeScale(1)"
							></div>
							<div
								i-carbon-intent-request-scale-in
								icon-btn
								@click="changeScale(-1)"
							></div>
							<div i-carbon-reset icon-btn @click="rotateRight"></div>
						</div>
					</div>
				</div>
				<div class="cropper_right">
					<div class="preview_text">预览</div>
					<div :style="getStyle" class="previewImg">
						<div :style="previewFileStyle">
							<img :style="previews.img" :src="previews.url" alt="" />
						</div>
					</div>
				</div>
			</div>
		</template>
		<template #footer>
			<span class="dialog-footer">
				<el-button @click="dialogVisible = false">取消</el-button>
				<el-button type="" @click="refreshCrop">重置</el-button>
				<el-button :loading="uploadLoading" type="primary" @click="onConfirm">
					确认
				</el-button>
			</span>
		</template>
	</el-dialog>
</template>
<script lang="ts" setup>
// 需要引入的库
import 'vue-cropper/dist/index.css'
import { VueCropper } from 'vue-cropper'
import { ref, watch, reactive } from 'vue'
// import TipsDialog from '~/components/TipsDialog/TipsDialog.vue' // 封装的dialog组件
import { ElMessage } from 'element-plus'
// import { commonApi } from '../../api' // 封装的api
const dialogVisible = ref<boolean>(false) // dialog的显示与隐藏
const emits = defineEmits(['confirm']) // 自定义事件
// 裁剪组件需要使用到的参数
interface Options {
	img: string | ArrayBuffer | null // 裁剪图片的地址
	info: true // 裁剪框的大小信息
	outputSize: number // 裁剪生成图片的质量 [1至0.1]
	outputType: string // 裁剪生成图片的格式
	canScale: boolean // 图片是否允许滚轮缩放
	autoCrop: boolean // 是否默认生成截图框
	autoCropWidth: number // 默认生成截图框宽度
	autoCropHeight: number // 默认生成截图框高度
	fixedBox: boolean // 固定截图框大小 不允许改变
	fixed: boolean // 是否开启截图框宽高固定比例
	fixedNumber: Array<number> // 截图框的宽高比例  需要配合centerBox一起使用才能生效
	full: boolean // 是否输出原图比例的截图
	canMoveBox: boolean // 截图框能否拖动
	original: boolean // 上传图片按照原始比例渲染
	centerBox: boolean // 截图框是否被限制在图片里面
	infoTrue: boolean // true 为展示真实输出图片宽高 false 展示看到的截图框宽高
	accept: string // 上传允许的格式
}
// 父组件传参props
interface IProps {
	type: string // 上传类型, 企业logo / 浏览器logo
	allowTypeList: string[] // 接收允许上传的图片类型
	limitSize: number // 限制大小
	fixedNumber?: number[] // 截图框的宽高比例
	fixedNumberAider?: number[] // 侧边栏收起截图框的宽高比例
	previewWidth: number // 预览宽度
	title?: string // 裁剪标题
}
// 预览样式
interface IStyle {
	width: number | string
	height: number | string
}
/* 父组件传参 */
const props = withDefaults(defineProps<IProps>(), {
	type: 'systemLogo',
	allowTypeList: () => ['jpg', 'png', 'jpeg'],
	limitSize: 1,
	fixedNumber: () => [3, 1],
	// fixedNumberAider: () => [3, 1],
	previewWidth: 228,
	title: 'LOGO裁剪',
})
// 裁剪组件需要使用到的参数
const options = reactive<Options>({
	img: '', // 需要剪裁的图片
	autoCrop: true, // 是否默认生成截图框
	autoCropWidth: 150, // 默认生成截图框的宽度
	autoCropHeight: 150, // 默认生成截图框的长度
	fixedBox: false, // 是否固定截图框的大小 不允许改变
	info: true, // 裁剪框的大小信息
	outputSize: 1, // 裁剪生成图片的质量 [1至0.1]
	outputType: 'png', // 裁剪生成图片的格式
	canScale: true, // 图片是否允许滚轮缩放
	fixed: false, // 是否开启截图框宽高固定比例
	fixedNumber: [4, 1], // 截图框的宽高比例 需要配合centerBox一起使用才能生效 1比1
	full: true, // 是否输出原图比例的截图
	canMoveBox: false, // 截图框能否拖动
	original: false, // 上传图片按照原始比例渲染
	centerBox: true, // 截图框是否被限制在图片里面
	infoTrue: true, // true 为展示真实输出图片宽高 false 展示看到的截图框宽高
	accept: 'image/jpeg,image/jpg,image/png,image/gif,image/x-icon',
})
const getStyle = ref<IStyle>({
	width: '',
	height: '',
})
/* 允许上传的类型 */
const acceptType = ref<string[]>([])
// 裁剪后的预览样式信息
const previews: any = ref({})
const previewFileStyle = ref({})
// 裁剪组件Ref
const cropperRef: any = ref({})
// input组件Ref
const reuploadInput = ref<HTMLElement | null | undefined>()
// 	const { files, open, reset, onChange } = useFileDialog({
// 	accept: 'image/*,video/*',
// })
// 回显图片使用的方法

/* 上传图片前置拦截函数 */
const beforeUploadEvent = (file: File) => {
	const type = file.name.substring(file.name.lastIndexOf('.') + 1) // 获得图片上传后缀
	// 判断是否符合上传类型
	const isAllowTye = props.allowTypeList.some((item) => {
		return item === type
	})
	if (!isAllowTye) {
		ElMessage.error(`仅支持${acceptType.value.join('、')}格式的图片`)
		return false
	}
	return true
}
/* 重置裁剪组件 */
const refreshCrop = () => {
	// cropperRef裁剪组件自带很多方法，可以打印看看
	cropperRef.value.refresh()
}
/* 右旋转图片 */
const rotateRight = () => {
	cropperRef.value.rotateRight()
}
/* 放大缩小图片比例 */
const changeScale = (num: number) => {
	const scale = num || 1
	cropperRef.value.changeScale(scale)
}
// 缩放的格式
const tempScale = ref<number>(0)
const {
	files,
	open: uploadFile,
	reset,
	onChange,
} = useFileDialog({
	accept: 'image/*,video/*',
})
onChange((files: any) => {
	const file = files[0]
	const URL = window.URL || window.webkitURL
	// 上传图片前置钩子，用于判断限制类型用
	if (beforeUploadEvent(file)) {
		options.img = URL.createObjectURL(file)
		dialogVisible.value = true
	}
})

/* 上传成功方法 */
const cropperSuccess = async (dataFile: File) => {
	const fileFormData = new FormData()
	fileFormData.append('file', dataFile)
	const { code, msg, result } = await uploadBase(fileFormData)
	if (code === 200) {
		return result
	} else {
	}
}
// base64转图片文件
const dataURLtoFile = (dataUrl: string, filename: string) => {
	const arr = dataUrl.split(',')
	const mime = arr[0].match(/:(.*?);/)[1]
	const bstr = atob(arr[1])
	let len = bstr.length
	const u8arr = new Uint8Array(len)
	while (len--) {
		u8arr[len] = bstr.charCodeAt(len)
	}
	return new File([u8arr], filename, { type: mime })
}
const uploadLoading = ref<boolean>(false)
// 上传图片（点击保存按钮）
const onConfirm = () => {
	cropperRef.value.getCropData(async (data: string) => {
		const dataFile: File = dataURLtoFile(data, 'images.png')
		uploadLoading.value = true
		const res = await cropperSuccess(dataFile)
		uploadLoading.value = false
		// 触发自定义事件
		emits('confirm', res)
		dialogVisible.value = false
		return res
	})
}
// 裁剪之后的数据
const previewHandle = (data: any) => {
	previews.value = data // 预览img图片
	tempScale.value = props.previewWidth / data.w
	previewFileStyle.value = {
		width: data.w + 'px !important',
		height: data.h + 'px !important',
		maxWidth: 'inherit !important',
		margin: 0,
		overflow: 'hidden',
		zoom: tempScale.value,
		position: 'relative',
		border: '1px solid #e8e8e8',
		'border-radius': '2px',
	}
}
watch(
	() => props,
	() => {
		/* 预览样式 */
		getStyle.value = {
			width: props.previewWidth + 'px', // 预览宽度
			height: props.previewWidth / props.fixedNumber[0] + 'px', // 预览高度
		}
		// 上传格式tips信息
		acceptType.value = []
		for (let i = 0; i < props.allowTypeList.length; i++) {
			acceptType.value.push(props.allowTypeList[i].toUpperCase())
		}
	},
	{
		deep: true,
	},
)
/* 向子组件抛出上传事件 */
defineExpose({
	uploadFile,
})
</script>
<style lang="less" scoped>
.cropper {
	width: 100%;
	height: 50vh;
	display: flex;
	overflow: hidden;
	.cropper_left {
		display: flex;
		flex-direction: column;
		.reupload_box {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-top: 10px;
			.reupload_text {
				color: var(--primary-color);
				cursor: pointer;
			}
			.rotate_right {
				margin-left: 16px;
				cursor: pointer;
			}
		}
	}
	.cropper_right {
		flex: 1;
		margin-left: 44px;
		.preview_text {
			margin-bottom: 12px;
		}
	}
}
</style>
