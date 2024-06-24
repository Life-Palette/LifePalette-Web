import { http } from '~/utils/http'

// 获取上传授权
export function getSign(params) {
  return http.request(
    'get',
		`/alioss`,
		{ params },
		{
		  isNeedToken: true, // 是否需要token
		},
  )
}
// 文件保存
export function saveFile(data: any) {
  return http.request(
    'post',
		`/alioss/saveFile`,
		{ data },
		{
		  isNeedToken: true, // 是否需要token
		},
  )
}
// 文件编辑
export function fileUpdate(data: any) {
  return http.request(
    'patch',
		`/file/${data.id}`,
		{ data },
		{
		  isNeedToken: true,
		},
  )
}
// 获取分片id
export function getUploadId(params) {
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
export function uploadPart(data, callback = (res) => {}) {
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
export function completeMul(data) {
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
export function uploadBase(data) {
  return http.request(
    'post',
		`/alioss/uploadBase`,
		{ data },
		{
		  isNeedToken: true, // 是否需要token
		},
  )
}
