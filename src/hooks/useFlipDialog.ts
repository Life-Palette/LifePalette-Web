import { nextTick, ref } from 'vue'

async function loadImg(src: string): Promise<{ realWidth: number, realHeight: number }> {
	const maxImageHeight = window.innerHeight - 64
	return new Promise((resolve, reject) => {
		const img = new Image()
		img.src = src
		img.onload = (e) => {
			const realWidth = (maxImageHeight / e.target.height) * e.target.width
			resolve({
				realWidth,
				realHeight: maxImageHeight,
			})
		}
		img.onerror = (error) => {
		// 处理图片加载错误
			reject(error)
		}
	})
}
export function useFlipDialog() {
	const showMask = ref(false)
	const chooseImage = ref('')
	const dialogMediaWidth = ref(0)
	const zoom = ref(1)
	let firstInfo = {}
	let lastInfo = {}
	let dialogNode = null
	let maskNode = null
	let convertY = 0
	let convertX = 0
	let realWidthVal

	const openDialogHandler = async (e: MouseEvent, imageUrl: string) => {
		chooseImage.value = imageUrl
		firstInfo = e.target.getBoundingClientRect()
		const [err, res] = await to(loadImg(imageUrl))

		const realWidth = res?.realWidth
		realWidthVal = realWidth

		dialogMediaWidth.value = realWidth
		showMask.value = true

		nextTick(() => {
			dialogNode = document.querySelector('.dialog-content')
			maskNode = document.querySelector('.dialog')
			lastInfo = dialogNode.getBoundingClientRect()
			zoom.value = firstInfo.width / dialogMediaWidth.value
			convertX = firstInfo.x - lastInfo.x
			convertY = firstInfo.y - lastInfo.y

			dialogNode.style.transform = `translate(calc(-50% + ${convertX}px), calc(-50% + ${convertY}px)) scale(${zoom.value})`
			dialogNode.style.transformOrigin = 'left top'

			requestAnimationFrame(() => {
				dialogNode.style.transition = 'transform 0.4s, width 0.4s'
				dialogNode.style.width = `${lastInfo.width}px`
				dialogNode.style.transform = ''
				maskNode.style.backgroundColor = 'rgba(0, 0, 0, 0.4)'
			})
		})
	}

	const closeDialogHandler = () => {
		const dialogFirstInfo = dialogNode.getBoundingClientRect()
		dialogNode.style.left = `${firstInfo.x}px`
		dialogNode.style.top = `${firstInfo.y}px`
		dialogNode.style.transition = 'none'
		dialogNode.style.width = `${dialogMediaWidth.value}px`
		dialogNode.style.overflow = 'hidden'
		dialogNode.style.transform = `scale(${zoom.value})`

		nextTick(() => {
			const dialogLastInfo = dialogNode.getBoundingClientRect()
			const convertX = dialogFirstInfo.x - dialogLastInfo.x
			const convertY = dialogFirstInfo.y - dialogLastInfo.y
			dialogNode.style.width = `${dialogFirstInfo.width}px`
			dialogNode.style.overflow = 'visible'
			dialogNode.style.transform = `translate(${convertX}px, ${convertY}px) scale(1)`

			requestAnimationFrame(() => {
				dialogNode.style.transition = 'transform 0.4s, width 0.4s'
				dialogNode.style.width = `${dialogMediaWidth.value}px`
				dialogNode.style.overflow = 'hidden'
				dialogNode.style.transform = `scale(${zoom.value})`
				maskNode.style.backgroundColor = 'transparent'
			})

			dialogNode.addEventListener('transitionend', () => {
				showMask.value = false
			})
			if (!realWidthVal) {
				showMask.value = false
			}
		})
	}

	return {
		showMask,
		chooseImage,
		openDialog: openDialogHandler,
		closeDialog: closeDialogHandler,
		mediaWidth: dialogMediaWidth,
	}
}
