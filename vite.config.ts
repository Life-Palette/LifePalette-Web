import { defineConfig } from 'vite'
import Tov from './presets'
// import { useEnv } from './presets/shared/detect'

// const env = useEnv()

export default defineConfig({
  // base: env.VITE_BASE_URL,
  plugins: [Tov()],
	server: {
		port: 5073,
	},
	css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
})
