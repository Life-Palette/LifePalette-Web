import { encode } from 'blurhash'

async function loadImage(src: string) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = (...args) => reject(args)
    img.src = src
    img.setAttribute('crossOrigin', '')
  })
}

function getImageData(image: any) {
  const canvas = document.createElement('canvas')
  canvas.width = image.width
  canvas.height = image.height
  const context = canvas.getContext('2d')
  context.drawImage(image, 0, 0)
  return context.getImageData(0, 0, image.width, image.height)
}

export async function encodeImageToBlurhash(imageUrl: string) {
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

// export const generateBlurhashFromFile = (file: any) => {
// 	return new Promise((resolve, reject) => {
// 		const img = new Image()
// 		const tempCanvas = document.createElement('canvas')
// 		const tempCtx = tempCanvas.getContext('2d')

// 		img.onload = () => {

// 			// tempCanvas.width = 20
// 			// tempCanvas.height = 20
// 			// tempCanvas.width = img.width
// 			// tempCanvas.height = img.height
// 			tempCtx.drawImage(img, 0, 0, img.width, img.height)
// 			const imageData = tempCtx.getImageData(
// 				0,
// 				0,
// 				tempCanvas.width,
// 				tempCanvas.height,
// 			)

// 			const blurhash = encode(
// 				imageData.data,
// 				imageData.width,
// 				imageData.height,
// 				4,
// 				3,
// 			) // Adjust components as needed

// 			resolve(blurhash)
// 		}

// 		img.src = URL.createObjectURL(file)
// 	})
// }
export function generateBlurhashFromFile(file,	maxWidth = 200,	quality = 0.7) {
  return new Promise((resolve, reject) => {
    const img = new Image()

    img.onload = () => {
      const canvas = document.createElement('canvas')
      let width = img.width

      let height = img.height

      if (width > maxWidth) {
				const ratio = maxWidth / width
        width = maxWidth
        height = Math.ceil(height * ratio) // Ensure integer height
      }

      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)

      const imageData = ctx.getImageData(0, 0, width, height)
      const blurhash = encode(imageData.data, width, height, 4, 3) // Adjust components as needed

      resolve(blurhash)
    }
		img.onerror = (err) => {
			reject(err)
		}

    img.src = URL.createObjectURL(file)
  })
}
