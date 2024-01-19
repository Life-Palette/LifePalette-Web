import { http } from '~/utils/http'

export const likeFindById = (params) => {
	return http.request(
		'get',
		`/like`,
		{ params },
		{
			isNeedToken: false, // 是否需要token
		},
	)
}
export const findLikeByUserId = (params) => {
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
export const likeCreate = (data) => {
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
export const likeDelete = (data) => {
	return http.request(
		'delete',
		`/like`,
		{ data },
		{
			isNeedToken: true, // 是否需要token
		},
	)
}
