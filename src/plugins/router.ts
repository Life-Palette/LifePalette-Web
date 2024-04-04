import { createGetRoutes, setupLayouts } from 'virtual:generated-layouts'
import { createRouter, createWebHashHistory } from 'vue-router/auto'
// import { routes  } from 'vue-router/auto-routes'
// import { routes as fileRoutes  } from 'vue-router/auto-routes'

// 重定向 BASE_URL
// fileRoutes.flat(Infinity).forEach((route) => {
// 	route.path = safeResolve(route.path)
// })

export const router = createRouter({
	history: createWebHashHistory(),
	// routes,
	extendRoutes: (routes) => setupLayouts(routes),
})

export const getRoutes = createGetRoutes(router)

export default router
