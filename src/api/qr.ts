import { http } from '~/utils/http'

// 生成二维码
export const qrGenerate = (params) => {
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
export const qrRefresh = (key) => {
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
export const qrCheck = (key) => {
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
export const qrLogin = (data) => {
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
export const qrChangeSate = (data) => {
	return http.request(
		'post',
		`/qr/changeSate`,
		{ data },
		{
			isNeedToken: false, // 是否需要token
		},
	)
}
