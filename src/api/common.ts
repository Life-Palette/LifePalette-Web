import { http } from '~/utils/http'

// 文件上传
export function uploadFile(data) {
  return http.request(
    'post',
		`/upload/image`,
		{ data },
		{
		  isNeedToken: false, // 是否需要token
		},
  )
}
