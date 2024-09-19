import type { Plugin } from 'vite'
import { utimes } from 'node:fs/promises'
import { resolve } from 'node:path'
import { debounce } from '@iceywu/utils'
import { slash } from 'vite-layers'
import { r } from '../shared/path'

const defaultPaths = ['package.json', 'pnpm-lock.yaml']

/**
 * 强制重启
 * @description 如果监听更新的话，强制重启项目
 * @param  paths 监听重启路径，默认为 ['package.json', 'pnpm-lock.yaml']
 */
export function Restart(paths = defaultPaths): Plugin {
  paths = paths.map(path => slash(resolve(path)))
  const restart = debounce(async () => {
    const time = new Date()
    await utimes(r('vite.config.ts'), time, time)
  }, 1000)
  return {
    name: 'vite-plugin-force-restart',
    apply: 'serve',
    async watchChange(id) {
      if (paths.includes(id)) {
        await restart()
      }
    },
  }
}
