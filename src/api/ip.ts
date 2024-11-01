import type { Result } from 'presets/types/axios'
import { http } from '~/utils/http'

export function ipGet() {
	return http.request<Result>(
		'get',
		'/ip',
		{},
		{
			isNeedToken: true, // 是否需要token
		},
	)
}
