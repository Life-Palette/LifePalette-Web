import { customDestr, deepClone, getObjVal } from '@iceywu/utils'

// 获取用户头像
export function getUserAvatar(data: any) {
	const oldAvatar = getObjVal(data, 'avatar')
	const baseAvatar = getObjVal(data, 'avatarInfo.url')
	return baseAvatar || oldAvatar
}
// 判断是否是苹果拍摄的图片
export function isIphoneImg(data: any) {
	const exif = getObjVal(data, 'exif', '{}')
	const exifData = customDestr(exif, { customVal: {} })
	return getObjVal(exifData, 'Make.value') === 'Apple'
}

// 图片数据调整
export function adjustImgData(data: any) {
	const { url = '', type = 'image/jpeg', videoSrc = '', cover = '', fromIphone } = data || {}
	const fileType = type.toUpperCase().includes('VIDEO') ? 'VIDEO' : 'IMAGE'
	const file = deepClone(url)
	let newUrl = deepClone(url)
	const isIphone = isIphoneImg(data)

	let addInfo = {}
	if (fileType === 'IMAGE') {
		let preSrc = `${file}?x-oss-process=image/resize,l_800`
		let src = `${file}?x-oss-process=image/resize,l_800`
		let baseSrc = deepClone(url)
		const fileSuffix = file.substring(file.lastIndexOf('.'))?.toLowerCase()

		if (['.heic', '.HEIC'].includes(fileSuffix) || isIphone || fromIphone) {
			if (!file.includes('format,jpg')) {
					baseSrc = `${url}?x-oss-process=image/format,jpg`
					newUrl = `${url}?x-oss-process=image/format,jpg`

			preSrc = `${file}?x-oss-process=image/resize,l_800/format,jpg`
			src = `${file}?x-oss-process=image/resize,l_800/format,jpg`
		}
		}
		addInfo = {
			src,
			baseSrc,
			preSrc,
		}
	}
 else if (fileType === 'VIDEO') {
		const srcT
			= cover
			|| `${file}?x-oss-process=video/snapshot,t_7000,f_jpg,w_0,h_0,m_fast`
		addInfo = {
			src: srcT,
			baseSrc: srcT,
			preSrc: srcT,
		}
	}

	const baseData = {
		...data,
		...addInfo,
		file: newUrl,
		fileType,
		cover: addInfo?.src || cover,
	}

	return baseData
}
