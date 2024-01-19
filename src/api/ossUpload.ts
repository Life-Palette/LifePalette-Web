import { http } from '~/utils/http'

// 获取分片id
export const getUploadId = (params) => {
	return http.request(
		'get',
		`/alioss/getInitMultipartUploadId`,
		{ params },
		{
			isNeedToken: true, // 是否需要token
		},
	)
}
// 获取分片id
export const uploadPart = (data, callback = (res) => {}) => {
	return http.request(
		'post',
		`/alioss/uploadPart`,
		{ data },
		{
			isNeedToken: true, // 是否需要token
			onUploadProgress: (progress) => {
				// console.log("----------上传进度22-----：", progress);
				callback(progress)
			},
		},
	)
}
// 合并分片
export const completeMul = (data) => {
	return http.request(
		'post',
		`/alioss/completeMul`,
		{ data },
		{
			isNeedToken: true, // 是否需要token
		},
	)
}
// 基本上传
export const uploadBase = (data) => {
	return http.request(
		'post',
		`/alioss/uploadBase`,
		{ data },
		{
			isNeedToken: true, // 是否需要token
		},
	)
}
