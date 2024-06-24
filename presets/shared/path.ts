import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const _dirname = dirname(fileURLToPath(import.meta.url))

const root = resolve(_dirname, '../../')

/**
 * 路径重写
 * @param path 相对路径
 * @returns 基于根目录的相对路径
 */
export function r(path: string) {
  return resolve(root, path).replaceAll('\\', '/')
}
