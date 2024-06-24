import Cookies from 'js-cookie'
import { storageSession } from '@/utils/sessionStorage'
// import { useUserStoreHook } from "@/store/modules/user";

export interface DataInfo<T> {
  /** token */
  accessToken: string
  /** `accessToken`的过期时间（时间戳） */
  // expires: T;
  expires: number
  /** 用于调用刷新accessToken的接口时所需的token */
  refreshToken: string
  /** 用户名 */
  username?: string
  /** 当前登陆用户的角色 */
  roles?: Array<string>
}

export const sessionKey = 'user-auth'
export const TokenKey = 'authorized-token'

/** 获取`token` */
export function getToken(): DataInfo<number> | undefined {
  // 此处与`TokenKey`相同，此写法解决初始化时`Cookies`中不存在`TokenKey`报错
  const token = Cookies.get(TokenKey)
    ? JSON.parse(Cookies.get(TokenKey)!)
    : storageSession().getItem<DataInfo<number>>(sessionKey)
  return token || undefined
}

/**
 * @description 设置`token`以及一些必要信息并采用无感刷新`token`方案
 * 无感刷新：后端返回`accessToken`（访问接口使用的`token`）、`refreshToken`（用于调用刷新`accessToken`的接口时所需的`token`，`refreshToken`的过期时间（比如30天）应大于`accessToken`的过期时间（比如2小时））、`expires`（`accessToken`的过期时间）
 * 将`accessToken`、`expires`这两条信息放在key值为authorized-token的cookie里（过期自动销毁）
 * 将`username`、`roles`、`refreshToken`、`expires`这四条信息放在key值为`user-info`的sessionStorage里（浏览器关闭自动销毁）
 */
export function setToken(data: any) {
  const { access_token, refresh_token, expires_in } = data || {}
  const expires = expires_in ? new Date().getTime() + expires_in * 1000 : 0
  const cookieString = JSON.stringify({ access_token, refresh_token, expires })
  expires > 0
    ? Cookies.set(TokenKey, cookieString, {
      expires: expires / 86400000,
    })
    : Cookies.set(TokenKey, cookieString)
  // setSessionStorage

  storageSession().setItem(sessionKey, data)
}

/** 删除`token`以及key值为`user-info`的session信息 */
export function removeToken() {
  Cookies.remove(TokenKey)
  sessionStorage.clear()
}

/** 格式化token（jwt格式） */
export function formatToken(token: string): string {
  return `Bearer ${token}`
}
