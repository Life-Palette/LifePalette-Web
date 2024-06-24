import { http } from '~/utils/http'

// 生成二维码
export function qrGenerate(params) {
  return http.request(
    'get',
    '/qr/generate',
    { params },
    {
      isNeedToken: false, // 是否需要token
    },
  )
}

// 刷新二维码
export function qrRefresh(key) {
  return http.request(
    'get',
		`/qr/regenerate/${key}`,
		{},
		{
		  isNeedToken: false, // 是否需要token
		},
  )
}

// 检测二维码状态
export function qrCheck(key) {
  return http.request(
    'get',
		`/qr/check/${key}`,
		{},
		{
		  isNeedToken: false, // 是否需要token
		},
  )
}

// 二维码登录
export function qrLogin(data) {
  return http.request(
    'post',
		`/qr/login`,
		{ data },
		{
		  isNeedToken: false, // 是否需要token
		},
  )
}
// 改变二维码状态
export function qrChangeSate(data) {
  return http.request(
    'post',
		`/qr/changeSate`,
		{ data },
		{
		  isNeedToken: false, // 是否需要token
		},
  )
}
