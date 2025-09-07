import { defineFakeRoute } from 'vite-plugin-fake-server/client'

export default defineFakeRoute([
	{
		url: '/api/mock/get',
		method: 'get',
		response: () => {
			return {
				code: 200,
				data: {
					name: 'mock',
				},
			}
		},
	},
	{
		url: '/api/mock/post',
		method: 'post',
		timeout: 2000,
		response: {
			code: 200,
			data: {
				name: 'mock',
			},
		},
	},
	{
		url: '/api/mock/text',
		method: 'post',
		rawResponse: async (req, res) => {
			let reqbody = ''
			await new Promise((resolve) => {
				req.on('data', (chunk) => {
					reqbody += chunk
				})
				req.on('end', () => resolve(undefined))
			})
			res.setHeader('Content-Type', 'text/plain')
			res.statusCode = 200
			res.end(`hello, ${reqbody}`)
		},
	},
	{
		url: '/login',
		method: 'post',
		response: ({ body }) => {
			if (body.username === 'admin') {
				return {
					code: 200,
					msg: '请求成功',
					data: {
						admin: {
							id: 1,
							createdAt: null,
							updatedAt: 1700724616090,
							username: 'admin',
							name: 'admin',
							sex: 2,
							roleDTOs: null,
							workNameKey: '1,11',
							phone: '13501010100',
							lastLoginTime: 1700724616085,
							authorityDTOS: null,
						},
						token: {
							accessToken:
								'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJsb2dpblR5cGUiOiJsb2dpbiIsImxvZ2luSWQiOjEsInJuU3RyIjoidzJIMEZ1ZXg4bGc1dktnUkR3QWIwMHk2UHZrbm5vZWQifQ.6GnXn6vei64KPBB7B7sgZTA9vmHkWv6VSD8c9MWTdXs',
							expiresIn: 86400000,
						},
					},
				}
			}
 else {
				return {
					code: 200,
					msg: '请求成功',
					data: {
						admin: {
							id: 2,
							createdAt: null,
							updatedAt: 1700724616090,
							username: 'common',
							name: 'common',
							sex: 1,
							roleDTOs: null,
							workNameKey: '1,11',
							phone: '13501010100',
							lastLoginTime: 1700724616085,
							authorityDTOS: null,
						},
						token: {
							accessToken:
								'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJsb2dpblR5cGUiOiJsb2dpbiIsImxvZ2luSWQiOjEsInJuU3RyIjoidzJIMEZ1ZXg4bGc1dktnUkR3QWIwMHk2UHZrbm5vZWQifQ.6GnXn6vei64KPBB7B7sgZTA9vmHkWv6VSD8c9MWTdXs',
							expiresIn: 86400000,
						},
					},
				}
			}
		},
	},
])
