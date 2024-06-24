import { createGetRoutes, setupLayouts } from 'virtual:generated-layouts'
import { createRouter, createWebHashHistory } from 'vue-router'
import { routes as fileRoutes } from 'vue-router/auto-routes'

declare module 'vue-router' {
	// 在这里定义你的 meta 类型
	// eslint-disable-next-line no-unused-vars
	interface RouteMeta {
		title?: string
		layout?: string
	}
}

// 重定向 BASE_URL
fileRoutes.flat(Infinity).forEach((route) => {
	route.path = safeResolve(route.path)
})

export const router = createRouter({
	history: createWebHashHistory(),
	routes: setupLayouts(fileRoutes),
})

export const getRoutes = createGetRoutes(router)

export default router
