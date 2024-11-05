<script setup lang="ts">
import type { CSSProperties } from 'vue'
import {
	ArrowLeft,
	ArrowRight,
	Close,
	FullScreen,
	RefreshLeft,
	RefreshRight,
	ScaleToOriginal,
	ZoomIn,
	ZoomOut,
} from '@element-plus/icons-vue'
import { customDestr, throttle } from '@iceywu/utils'
import { useEventListener } from '@vueuse/core'
import 'element-plus/dist/index.css'
// import ElIcon from '@element-plus/components/icon'
import { useNamespace } from './use-namespace'

const {
	urlList = [],
	initialIndex = 0,
	infinite = true,
	zoomRate = 1.1,
	minScale = 0.2,
	maxScale = 7,
} = defineProps<Props>()

// const imageViewerEmits = {
// 	close: () => true,
// 	switch: (index: number) => isNumber(index),
// 	rotate: (deg: number) => isNumber(deg),
// }
const emit = defineEmits<{
	close: []
	ok: []
	cancel: []
}>()

const ns = useNamespace('image-viewer')

interface Props {
	initialIndex?: number
	infinite?: boolean
	urlList?: any[]
	zoomRate?: number
	minScale?: number
	maxScale?: number
}
interface ImageViewerMode {
	name: string
	icon?: Component
}
const modes: Record<'CONTAIN' | 'ORIGINAL', ImageViewerMode> = {
	CONTAIN: {
		name: 'contain',
		icon: markRaw(FullScreen),
	},
	ORIGINAL: {
		name: 'original',
		icon: markRaw(ScaleToOriginal),
	},
}
const transform = ref({
	scale: 0.5,
	deg: 0,
	offsetX: 0,
	offsetY: 0,
	enableTransition: false,
})
const mode = shallowRef<ImageViewerMode>(modes.CONTAIN)
const imgStyle = computed(() => {
	const { scale, deg, offsetX, offsetY, enableTransition } = transform.value
	let translateX = offsetX / scale
	let translateY = offsetY / scale

	const radian = (deg * Math.PI) / 180
	const cosRadian = Math.cos(radian)
	const sinRadian = Math.sin(radian)
	translateX = translateX * cosRadian + translateY * sinRadian
	translateY = translateY * cosRadian - (offsetX / scale) * sinRadian

	const style: CSSProperties = {
		transform: `scale(${scale}) rotate(${deg}deg) translate(${translateX}px, ${translateY}px)`,
		transition: enableTransition ? 'transform .3s' : '',
	}
	if (mode.value.name === modes.CONTAIN.name) {
		style.maxWidth = style.maxHeight = '100%'
	}
	return style
})
function reset() {
	transform.value = {
		scale: 0.5,
		deg: 0,
		offsetX: 0,
		offsetY: 0,
		enableTransition: false,
	}
}
const EVENT_CODE = {
	tab: 'Tab',
	enter: 'Enter',
	space: 'Space',
	left: 'ArrowLeft', // 37
	up: 'ArrowUp', // 38
	right: 'ArrowRight', // 39
	down: 'ArrowDown', // 40
	esc: 'Escape',
	delete: 'Delete',
	backspace: 'Backspace',
	numpadEnter: 'NumpadEnter',
	pageUp: 'PageUp',
	pageDown: 'PageDown',
	home: 'Home',
	end: 'End',
}
const scopeEventListener = effectScope()
function hide() {
	unregisterEventListener()
	emit('close')
}
const isSingle = computed(() => {
	return urlList.length <= 1
})
const activeIndex = ref(initialIndex)
const isFirst = computed(() => {
	return activeIndex.value === 0
})

const isLast = computed(() => {
	return activeIndex.value === urlList.length - 1
})

const currentImg = computed(() => {
	const tempObj = {
		...urlList[activeIndex.value],
		exifInfo:
			customDestr(urlList[activeIndex.value].exif, { customVal: {} }) || {},
	}
	return tempObj
})
const loading = ref(false)

function setActiveItem(index: number) {
	const len = urlList.length
	activeIndex.value = (index + len) % len
}

function prev() {
	if (isFirst.value && infinite)
return
	setActiveItem(activeIndex.value - 1)
	// mapCard.value?.resetMarker()
	reShowMap()
}

function next() {
	if (isLast.value && !infinite)
return
	setActiveItem(activeIndex.value + 1)
	// mapCard.value?.resetMarker()
	reShowMap()
}

function handleActions(action: any, options = {}) {
	if (loading.value)
return

	const { rotateDeg, enableTransition } = {
		rotateDeg: 90,
		enableTransition: true,
		...options,
	}
	switch (action) {
		case 'zoomOut':
			if (transform.value.scale > minScale) {
				transform.value.scale = Number.parseFloat(
					(transform.value.scale / zoomRate).toFixed(3),
				)
			}
			break
		case 'zoomIn':
			if (transform.value.scale < maxScale) {
				transform.value.scale = Number.parseFloat(
					(transform.value.scale * zoomRate).toFixed(3),
				)
			}
			break
		case 'clockwise':
			transform.value.deg += rotateDeg
			break
		case 'anticlockwise':
			transform.value.deg -= rotateDeg
			break
	}
	transform.value.enableTransition = enableTransition
}
function toggleMode() {
  if (loading.value)
return

  const modeNames = Object.keys(modes)
  const modeValues = Object.values(modes)
  const currentMode = mode.value.name
  const index = modeValues.findIndex(i => i.name === currentMode)
  const nextIndex = (index + 1) % modeNames.length
  mode.value = modes[modeNames[nextIndex]]
  reset()
}
function registerEventListener() {
	const keydownHandler = throttle((e: KeyboardEvent) => {
		switch (e.code) {
			// ESC
			case EVENT_CODE.esc:
				hide()
				break
			// SPACE
			case EVENT_CODE.space:
				toggleMode()
				break
			// LEFT_ARROW
			case EVENT_CODE.left:
				prev()
				break
			// UP_ARROW
			case EVENT_CODE.up:
				handleActions('zoomIn')
				break
			// RIGHT_ARROW
			case EVENT_CODE.right:
				next()
				break
			// DOWN_ARROW
			case EVENT_CODE.down:
				handleActions('zoomOut')
				break
		}
	}, 0)
	const mousewheelHandler = throttle((e: WheelEvent) => {
		const delta = e.deltaY || e.deltaX
		handleActions(delta < 0 ? 'zoomIn' : 'zoomOut', {
			zoomRate,
			enableTransition: false,
		})
	}, 0)

	scopeEventListener.run(() => {
		useEventListener(preView.value, 'keydown', keydownHandler)
		useEventListener(preView.value, 'wheel', mousewheelHandler)
	})
}

function unregisterEventListener() {
	scopeEventListener.stop()
}
onMounted(() => {
	registerEventListener()
	// add tabindex then wrapper can be focusable via Javascript
	// focus wrapper so arrow key can't cause inner scroll behavior underneath
	// wrapper.value?.focus?.()
})
const arrowPrevKls = computed(() => [
	ns.e('btn'),
	ns.e('prev'),
	ns.is('disabled', !infinite && isFirst.value),
])

const arrowNextKls = computed(() => [
	ns.e('btn'),
	ns.e('next'),
	ns.is('disabled', !infinite && isLast.value),
])
const wrapper = ref<HTMLDivElement>()
const preView = ref<HTMLDivElement>()
const imgRefs = ref<HTMLImageElement[]>([])
function handleImgLoad() {
	loading.value = false
}

function handleImgError(e: Event) {
	loading.value = false;
	(e.target as HTMLImageElement).alt = '加载失败'
}

function handleMouseDown(e: MouseEvent) {
	if (loading.value || e.button !== 0 || !wrapper.value)
return
	transform.value.enableTransition = false

	const { offsetX, offsetY } = transform.value
	const startX = e.pageX
	const startY = e.pageY

	const dragHandler = throttle((ev: MouseEvent) => {
		transform.value = {
			...transform.value,
			offsetX: offsetX + ev.pageX - startX,
			offsetY: offsetY + ev.pageY - startY,
		}
	}, 0)
	const removeMousemove = useEventListener(document, 'mousemove', dragHandler)
	useEventListener(document, 'mouseup', () => {
		removeMousemove()
	})

	e.preventDefault()
}
watch(currentImg, () => {
	nextTick(() => {
		const $img = imgRefs.value[0]
		if (!$img?.complete) {
			loading.value = true
		}
	})
})
watch(activeIndex, (val) => {
	reset()
	// emit('switch', val)
})
function getImgUrl(data: any) {
	return `${data.url}?x-oss-process=image/format,jpg`
}
const imgInfo = computed(() => {
	const info_enum = [
		{
			key: 'Model',
			label: '相机型号',
			value: '',
		},
		{
			key: 'LensModel',
			label: '镜头型号',
			value: '',
		},
		{
			key: 'ISOSpeedRatings',
			label: 'ISO',
			value: '',
		},
		{
			key: 'FocalLengthIn35mmFilm',
			label: '焦距',
			value: '',
		},
		{
			key: 'FNumber',
			label: '光圈',
			value: '',
		},
		{
			key: 'ShutterSpeedValue',
			label: '快门速度',
			value: '',
		},
		{
			key: 'GPSAltitude',
			label: '海拔高度',
			value: '',
		},
		{
			key: 'DateTimeOriginal',
			label: '拍摄时间',
			value: '',
		},
	]
	info_enum.forEach((item) => {
		const value = currentImg.value.exifInfo[item.key]

		item.value = value?.value
	})
	return info_enum
})
const mapCard = useTemplateRef('mapCardRef')
const showMap = ref(true)
function reShowMap() {
	showMap.value = false
	setTimeout(() => {
		showMap.value = true
	}, 0)
}
</script>

<template>
	<Teleport to="body">
		<transition name="viewer-fade" appear>
			<!-- 预览 -->
			<div ref="wrapper" :tabindex="-1" :class="ns.e('wrapper')">
				<div :class="ns.e('canvas')">
					<span class="left-10" :class="[ns.e('btn'), ns.e('close')]" @click="hide">
							<el-icon>
								<Close />
							</el-icon>
						</span>
					<div ref="preView" class="relative flex-1 ">
						<!-- CLOSE -->
						<!-- <span :class="[ns.e('btn'), ns.e('close')]" @click="hide"> -->
						<!-- <span :class="[ns.e('btn'), ns.e('close')]" @click="hide">
							<el-icon>
								<Close />
							</el-icon>
						</span> -->
						<!-- ARROW -->
						<template v-if="!isSingle">
							<span :class="arrowPrevKls" @click="prev">
								<ElIcon>
									<ArrowLeft />
								</ElIcon>
							</span>
							<span :class="arrowNextKls" @click="next">
								<ElIcon>
									<ArrowRight />
								</ElIcon>
							</span>
						</template>
						 <!-- ACTIONS -->
						 <div :class="[ns.e('btn'), ns.e('actions')]">
          <div :class="ns.e('actions__inner')">
            <el-icon @click="handleActions('zoomOut')">
              <ZoomOut />
            </el-icon>
            <el-icon @click="handleActions('zoomIn')">
              <ZoomIn />
            </el-icon>
            <i :class="ns.e('actions__divider')" />
            <el-icon @click="toggleMode">
              <component :is="mode.icon" />
            </el-icon>
            <i :class="ns.e('actions__divider')" />
            <el-icon @click="handleActions('anticlockwise')">
              <RefreshLeft />
            </el-icon>
            <el-icon @click="handleActions('clockwise')">
              <RefreshRight />
            </el-icon>
          </div>
        </div>

						<!-- CANVAS -->
						<img
							v-for="(url, i) in urlList"
							v-show="i === activeIndex"
							:ref="(el) => (imgRefs[i] = el as HTMLImageElement)"
							:key="getImgUrl(url)"
							:src="getImgUrl(url)"
							:style="imgStyle"
							:class="ns.e('img')"
							@load="handleImgLoad"
							@error="handleImgError"
							@mousedown="handleMouseDown"
						>
					</div>

					<!-- 自定义 -->
					<div
						class="z-999 h-full w-50 flex-shrink-0 overflow-auto break-all bg-white"
					>
						<!-- vfor -->
						<div class="p-4">
							<div class="text-lg font-bold">图片信息</div>
							<div class="mt-4 divide-y">
								<div
									v-for="item in imgInfo"
									:key="item.key"
									class="mb-1 flex items-center"
								>
									<span class="w-20">{{ item.label }}</span>
									<span class="flex-1">{{ item.value }}</span>
								</div>
							</div>
							<div class="text-lg font-bold">地理信息</div>
							<div class="w-40 h-40 rounded-xl overflow-hidden">
								<card-map-card
									v-if="showMap"
									ref="mapCardRef"
									:data="urlList[activeIndex]"
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</transition>
	</Teleport>
</template>

<style scoped>
.el-image-viewer__wrapper {
	z-index: 999;
}
.el-image-viewer__canvas {
	/* position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999; */
	background-color: rgba(0, 0, 0, 0.8);
}
</style>
