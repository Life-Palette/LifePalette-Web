import { http } from '~/utils/http'

export function likeFindById(params) {
  return http.request(
    'get',
		`/like`,
		{ params },
		{
		  isNeedToken: false, // 是否需要token
		},
  )
}
export function findLikeByUserId(params) {
  return http.request(
    'get',
		`/like/findByuserId`,
		{ params },
		{
		  isNeedToken: false, // 是否需要token
		},
  )
}

// 评论创建
export function likeCreate(data) {
  return http.request(
    'post',
		`/like`,
		{ data },
		{
		  isNeedToken: true, // 是否需要token
		},
  )
}
// 取消点赞
export function likeDelete(data) {
  return http.request(
    'delete',
		`/like`,
		{ data },
		{
		  isNeedToken: true, // 是否需要token
		},
  )
}
