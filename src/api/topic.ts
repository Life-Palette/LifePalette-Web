import { http } from '~/utils/http'
import { Result, listParams } from 'presets/types/axios'

// 继承listParams，并添加自定义参数
export interface topicListParams extends listParams {
	tagId?: number
}

export const topicFindAll = (params?: topicListParams) => {
	return http.request<Result>(
		'get',
		'/topic',
		{ params },
		{
			// isNeedFullRes: false, // 是否需要返回完整的响应对象
			// isShowLoading: true, // 是否显示loading
			isNeedToken: false, // 是否需要token
		},
	)
}
export const topicFindById = (params: any) => {
	return http.request(
		'get',
		`/topic/${params.topicId}`,
		{ params },
		{
			isNeedToken: false, // 是否需要token
		},
	)
}

// 文件上传
export const topicCreate = (data) => {
	return http.request(
		'post',
		`/topic`,
		{ data },
		{
			isNeedToken: true, // 是否需要token
		},
	)
}
