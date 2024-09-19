import type { listParams, Result } from 'presets/types/axios'
import { http } from '~/utils/http'

// 继承listParams，并添加自定义参数
export interface topicListParams extends listParams {
  tagId?: number
}

export function topicFindAll(params?: topicListParams) {
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
export function topicFindById(params: any) {
  return http.request(
    'get',
		`/topic/${params.topicId}`,
		{ params },
		{
		  isNeedToken: false, // 是否需要token
		},
  )
}

// 话题创建
export function topicCreate(data: any) {
  return http.request(
    'post',
		`/topic`,
		{ data },
		{
		  isNeedToken: true, // 是否需要token
		},
  )
}
// 话题编辑
export function topicEdit(data: any) {
  return http.request(
    'patch',
		`/topic/${data.id}`,
		{ data },
		{
		  isNeedToken: true, // 是否需要token
		},
  )
}
// 话题删除 {id:1}
export function topicDelete(data: any) {
  return http.request(
    'delete',
		`/topic/${data.id}`,
		{ data },
		{
		  isNeedToken: true, // 是否需要token
		},
  )
}
