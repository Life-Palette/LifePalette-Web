import { http } from '~/utils/http'

//
export function messageFindAll(params) {
  return http.request(
    'get',
		`/message/getOneByInfo`,
		{ params },
		{
		  isNeedToken: true, // 是否需要token
		},
  )
}
// 获取未读消息的数量
export function messageUnreadCount(params) {
  return http.request(
    'get',
		`/message/getUnreadMessageCount`,
		{ params },
		{
		  isNeedToken: true, // 是否需要token
		},
  )
}

// 消息创建
export function messageCreate(data) {
  return http.request(
    'post',
		`/message`,
		{ data },
		{
		  isNeedToken: true, // 是否需要token
		},
  )
}
// 消息状态更新
export function messageUpdate(data) {
  return http.request(
    'post',
		`/message/updateMessage`,
		{ data },
		{
		  isNeedToken: true, // 是否需要token
		},
  )
}
