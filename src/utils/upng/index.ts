import UPNG from 'upng-js'

export interface CompressOptions {
	/**
	 * 压缩质量（[0,1]）
	 * @default 0.8
	 */
	quality?: number
	/**
	 * 压缩后更大是否使用原图
	 * @default true
	 */
	noCompressIfLarger?: boolean
	/**
	 * 压缩后的新宽度
	 * @default 原尺寸
	 */
	width?: number
	/**
	 * 压缩后新高度
	 * @default 原尺寸
	 */
	height?: number
}
export async function compressPNGImage(file: File, ops: CompressOptions = {}) {
	const { width, height, quality = 0.8, noCompressIfLarger = true } = ops

	const arrayBuffer = await file.arrayBuffer()
	const decoded = UPNG.decode(arrayBuffer)
	const rgba8 = UPNG.toRGBA8(decoded)

	const compressed = UPNG.encode(
		rgba8,
		width || decoded.width,
		height || decoded.height,
		256 * quality,
	)

	const newFile = new File([compressed], file.name, { type: 'image/png' })

	if (!noCompressIfLarger) {
		return newFile
	}

	return file.size > newFile.size ? newFile : file
}

export async function isPNG(file: File) {
	// 提取前8个字节
	const arraybuffer = await file.slice(0, 8).arrayBuffer()

	// PNG 的前8字节16进制表示
	const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
	// const signature = [137, 80, 78, 71, 13, 10, 26, 10]

	// 转为 8位无符号整数数组 方便对比
	// https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array
	const source = new Uint8Array(arraybuffer)

	// 逐个字节对比
	for (let i = 0; i < signature.length; i++) {
		if (source[i] !== signature[i]) {
			return false
		}
	}
	return true
}
