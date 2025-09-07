import { defineConfig } from 'vite'
import Tov from './presets'
import { useEnv } from './presets/shared/detect'

const env = useEnv()

export default defineConfig({
	base: env.VITE_BASE_URL,
	server: {
		// host: '0.0.0.0',
		port: 5073,
		// 是否开启 https
		// https: false,
	},
	plugins: [Tov()],
})
