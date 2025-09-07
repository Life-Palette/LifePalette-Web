import type { App } from 'vue'
import { VueQueryPlugin } from '@tanstack/vue-query'

export default function install(app: App) {
  app.use(VueQueryPlugin, {
    queryClientConfig: {
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false,
          retry: 3,
          staleTime: 1000 * 60 * 5, // 5 minutes
          gcTime: 1000 * 60 * 10, // 10 minutes (was cacheTime)
        },
        mutations: {
          retry: 1,
        },
      },
    },
  })
}
