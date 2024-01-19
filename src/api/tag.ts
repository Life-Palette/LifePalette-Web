import { Result, listParams } from 'presets/types/axios'
import { http } from '~/utils/http'

export const tagFindAll = (params?: listParams) => {
	return http.request<Result>(
		'get',
		'/tag',
		{ params },
		{
			isNeedToken: true, // 是否需要token
		},
	)
}
