import { encode } from 'blurhash'

const loadImage = async (src: string) =>
	new Promise((resolve, reject) => {
		const img = new Image()
		img.onload = () => resolve(img)
		img.onerror = (...args) => reject(args)
		img.src = src
		img.setAttribute('crossOrigin', '')
	})

const getImageData = (image: any) => {
	const canvas = document.createElement('canvas')
	canvas.width = image.width
	canvas.height = image.height
	const context = canvas.getContext('2d')
	context.drawImage(image, 0, 0)
	return context.getImageData(0, 0, image.width, image.height)
}

export const encodeImageToBlurhash = async (imageUrl: string) => {
	const image = await loadImage(imageUrl)
	const imageData = getImageData(image)
	return encode(imageData.data, imageData.width, imageData.height, 4, 4)
}

export function getDataUrlFromArr(
	arr: Uint8ClampedArray,
	w: number,
	h: number,
) {
	if (typeof w === 'undefined' || typeof h === 'undefined')
		w = h = Math.sqrt(arr.length / 4)

	const canvas = document.createElement('canvas')
	const ctx = canvas.getContext('2d')!

	canvas.width = w
	canvas.height = h

	const imgData = ctx.createImageData(w, h)
	imgData.data.set(arr)
	ctx.putImageData(imgData, 0, 0)

	return canvas.toDataURL()
}
