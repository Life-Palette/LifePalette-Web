import { http } from '~/utils/http'

export function commentFindById(params) {
  return http.request(
    'get',
		`/comment`,
		{ params },
		{
		  isNeedToken: false, // 是否需要token
		},
  )
}

// 评论创建
export function commentCreate(data) {
  return http.request(
    'post',
		`/comment`,
		{ data },
		{
		  isNeedToken: true, // 是否需要token
		},
  )
}
