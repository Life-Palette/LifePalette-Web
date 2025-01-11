import { adjustImgData } from '~/utils/tools'

function parseDMS(dms: string) {
	const dmsPattern = /(-?\d+)deg (\d+)' (-?\d+\.\d+)"/
	const match = dms.match(dmsPattern)

	if (match) {
		const degrees = Number.parseInt(match[1], 10)
		const minutes = Number.parseInt(match[2], 10)
		const seconds = Number.parseFloat(match[3])

		const decimalDegrees = degrees + minutes / 60 + seconds / 3600

		return decimalDegrees
	}
 else {
		// throw new Error('Invalid DMS format')
		return 0
	}
}
// 通过exif获取经纬度
export function getLngLat(exifData: any) {
	const { GPSLatitude, GPSLongitude, GPSLatitudeRef, GPSLongitudeRef }
		= exifData
	let tempData = []
	if (GPSLatitude?.value && GPSLongitude?.value) {
		let lat = parseDMS(GPSLatitude.value)
		let lng = parseDMS(GPSLongitude.value)
		const latRef = GPSLatitudeRef
		const lngRef = GPSLongitudeRef
		if (latRef === 'S') {
			lat = -lat
		}
		if (lngRef === 'W') {
			lng = -lng
		}
		tempData = [lng, lat]
	}
	return tempData
}

export function getCover(data: any) {
	return adjustImgData(data)
}
