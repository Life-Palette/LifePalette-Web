import { to } from '@iceywu/utils'
import Axios from 'axios'
import { getSign, saveFile } from '~/api/ossUpload'
import { getFileType } from '~/utils'
import { generateBlurhashFromFile } from '~/utils/blurhash'
import { getFileMD5 } from './md5'
import { imageCompress, isPNG } from './upng'

interface uploadOptions {
	/**
	 * 是否压缩PNG
	 * @default true
	 */
	compressPNG?: boolean
}

// 生成文件名，作为 key 使用
function generateFileName(ossData: any, file: File) {
	const suffix = file.name.slice(file.name.lastIndexOf('.'))
	const filename = Date.now() + suffix
	return ossData.dir + filename
}
function handleSaveFile(reData: any) {
	return new Promise((resolve, reject) => {
		saveFile(reData)
			.then((saveData: any) => {
				const { code: codeSave, result: resultSave } = saveData
				if (codeSave === 200) {
					resolve(resultSave)
				}
 else {
					resolve({})
				}
			})
			.catch((err) => {
				reject(err)
			})
	})
}

export async function uploadFile(
	file: File,
	callback: any,
	ops: uploadOptions = {},
) {
	const { compressPNG = true } = ops
	if ((compressPNG && await isPNG(file)) || (file.type === 'image/jpeg' && file.size > 18 * 1024 * 1024)) {
		const [err, compressedFile] = ({} = await to(imageCompress(file)))
		if (err) {
			throw err
		}
		file = compressedFile
	}

	return new Promise<void>((resolve, reject) => {
		getFileMD5(file, async (md5: string, chunkArr: any) => {
			const [err, signData] = ({} = await to(getSign({ fileMd5: md5 })))
			const {
				code,
				msg,
				result: ossData,
				result: { hasUpload },
			} = signData
			if (err) {
				reject(err)
			}
			if (code === 200) {
				// 上传过
				if (hasUpload) {
					resolve(ossData)
				}
 else {
					const key = generateFileName(ossData, file)
					const formdataT = new FormData()
					formdataT.append('key', key)
					formdataT.append('OSSAccessKeyId', ossData.accessId)
					formdataT.append('policy', ossData.policy)
					formdataT.append('signature', ossData.signature)
					formdataT.append('success_action_status', '200')
					formdataT.append('file', file)
					Axios.post(ossData.host, formdataT, {
						headers: {
							'Content-Type': 'multipart/form-data',
						},
						onUploadProgress: (progressEvent: any) => {
							const percent = Number(
								((progressEvent.loaded / progressEvent.total) * 100).toFixed(1),
							)
							callback({ stage: 'upload', percent })
						},
					}).then(async (res: any) => {
						if (res.status === 200) {
							const fileUrl = `${ossData.baseHost}/${key}`

							let fileType = file.type?.split('/')[0].toUpperCase()

							const saveParams = {
								fileUrl,
								fileMd5: md5,
								size: file.size,
								type: file.type,
								name: file.name,
								dir: ossData.dir,
								hashCode: '',
							}
							if (!fileType) {
								const fileExtension = fileUrl.split('.').pop()?.toLowerCase()
								fileType = getFileType(fileUrl).toUpperCase()
								saveParams.type = ['heic', 'HEIC'].includes(fileExtension) ? 'image/heic' : ''
							}
							if (fileType === 'VIDEO') {
							}
 else {
								callback({ stage: 'encodeHash', percent: 0 })
								const [_, blurhashData] = ({} = await to(
									generateBlurhashFromFile(file),
								))
								saveParams.hashCode = blurhashData
							}

							const [saveFileErr, saveFileData] = ({} = await to(
								handleSaveFile(saveParams),
							))
							if (saveFileErr) {
								reject(saveFileErr)
							}
							if (saveFileData) {
								resolve(saveFileData)
							}
						}
 else {
							reject(res)
						}
					})
				}
			}
 else {
				reject(msg)
			}
		})
	})
}
