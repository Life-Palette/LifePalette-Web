import type { listParams, Result } from 'presets/types/axios'
import { http } from '~/utils/http'

export function tagFindAll(params?: listParams) {
  return http.request<Result>(
    'get',
    '/tag',
    { params },
    {
      isNeedToken: true, // 是否需要token
    },
  )
}
