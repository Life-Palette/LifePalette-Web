import type {
  AxiosInstance,
  AxiosRequestConfig,
  // CustomParamsSerializer,
} from 'axios'
import type {
  PureHttpError,
  PureHttpInterceptorsConfig,
  PureHttpRequestConfig,
  PureHttpResponse,
  RequestMethods,
} from './types.d'
import { formatToken, getToken } from '@/utils/auth'
import Axios from 'axios'
import NProgress from '../progress'
// import { stringify } from "qs";
import baseUrl from './base.js'
// import { useUserStoreHook } from "@/store/modules/user";
import { useUserStore } from '~/stores/user'

const userStore = useUserStore()

// 相关配置请参考：www.axios-js.com/zh-cn/docs/#axios-request-config-1
const defaultConfig: AxiosRequestConfig = {
  // 当前使用mock模拟请求，将baseURL制空
  baseURL: baseUrl.apiServer,
  // 请求超时时间
  // timeout: 10000,
  // headers: {
  //   Accept: "application/json, text/plain, */*",
  //   "Content-Type": "application/json",
  //   "X-Requested-With": "XMLHttpRequest"
  // }
  // 数组格式参数序列化（https://github.com/axios/axios/issues/5142）
  // paramsSerializer: {
  //   serialize: stringify as unknown as CustomParamsSerializer
  // }
}

class PureHttp {
  constructor() {
    this.httpInterceptorsRequest()
    this.httpInterceptorsResponse()
  }

  /** token过期后，暂存待执行的请求 */
  private static requests = []

  /** 防止重复刷新token */
  private static isRefreshing = false

  /** 防止重复刷新token */
  private static isNeedLoading = false

  // 接口是否异常
  static isApiError = false

  // 业务异常code名单
  static errorCodes = [401, 403]

  /** 初始化配置对象 */
  private static initConfig: PureHttpRequestConfig = {}

  /** 保存当前Axios实例对象 */
  private static axiosInstance: AxiosInstance = Axios.create(defaultConfig)

  /** 重连原始请求 */
  private static retryOriginalRequest(config: PureHttpRequestConfig) {
    return new Promise((resolve) => {
      PureHttp.requests.push((token: string) => {
        config.headers.Authorization = formatToken(token)
        resolve(config)
      })
    })
  }

  /** 请求拦截 */
  private httpInterceptorsRequest(): void {
    PureHttp.axiosInstance.interceptors.request.use(
      async (config: PureHttpInterceptorsConfig) => {
        const { isNeedToken = true, isNeedLoading = false, serverName } = config
        PureHttp.isNeedLoading = isNeedLoading
        if (serverName) {
          config.baseURL = baseUrl[serverName] || baseUrl.apiServer
        }
        if (import.meta.env.VITE_APP_MOCK_IN_DEVELOPMENT === 'true') {
          config.baseURL = ''
        }
        // 开启进度条动画
        isNeedLoading && NProgress.start()
        // 优先判断post/get等方法是否传入回掉，否则执行初始化设置等回掉
        if (typeof config.beforeRequestCallback === 'function') {
          config.beforeRequestCallback(config)
          return config
        }
        if (PureHttp.initConfig.beforeRequestCallback) {
          PureHttp.initConfig.beforeRequestCallback(config)
          return config
        }
        return isNeedToken
          ? new Promise((resolve) => {
            const data = getToken()
            if (data) {
              const now = new Date().getTime()
              const expired = Number.parseInt(data.expires) - now <= 0
              if (expired) {
                if (!PureHttp.isRefreshing) {
                  PureHttp.isRefreshing = true
                  // token过期刷新
                  userStore
                    .handRefreshToken({ refreshToken: data.refreshToken })
                    .then((res) => {
                      const token = res.data.accessToken
                      config.headers.Authorization = formatToken(token)
                      PureHttp.requests.forEach(cb => cb(token))
                      PureHttp.requests = []
                    })
                    .finally(() => {
                      PureHttp.isRefreshing = false
                    })
                }
                // const newCOnfig = PureHttp.retryOriginalRequest(config)
                resolve(PureHttp.retryOriginalRequest(config))
              }
              else {
                config.headers.Authorization = formatToken(
                  data.access_token,
                )
                resolve(config)
              }
            }
            else {
              resolve(config)
            }
          })
          : config
      },
      (error) => {
        return Promise.reject(error)
      },
    )
  }

  /** 响应拦截 */
  private httpInterceptorsResponse(): void {
    const instance = PureHttp.axiosInstance
    instance.interceptors.response.use(
      (response: PureHttpResponse) => {
        const $config = response.config
        // 关闭进度条动画
        if (PureHttp.isNeedLoading && !PureHttp.isApiError) {
          NProgress.done()
        }
        const { code } = response.data

        // 业务异常code名单
        if (PureHttp.errorCodes.includes(code)) {
          PureHttp.isApiError = true

          return response
          // return Promise.reject(response)
        }
        // 优先判断post/get等方法是否传入回掉，否则执行初始化设置等回掉
        if (typeof $config.beforeResponseCallback === 'function') {
          $config.beforeResponseCallback(response)
          return response.data
        }
        if (PureHttp.initConfig.beforeResponseCallback) {
          PureHttp.initConfig.beforeResponseCallback(response)
          return response.data
        }
        return response.data
      },
      (error: PureHttpError) => {
        const $error = error
        $error.isCancelRequest = Axios.isCancel($error)
        const statusCode = error?.response?.data?.code
        if (statusCode === 401) {
          if (!PureHttp.isRefreshing) {
            PureHttp.isRefreshing = true
            const token = getToken()
            const { refresh_token } = token || {}
            // token过期刷新
						userStore
              .handRefreshToken({ refreshToken: refresh_token })
              .then((res) => {
                const { access_token } = res.result || {}
                const token = access_token
                // config.headers['Authorization'] = formatToken(token)
                PureHttp.requests.forEach(cb => cb(token))
                PureHttp.requests = []
              })
              .finally(() => {
                PureHttp.isRefreshing = false
              })
          }
        }
        // 关闭进度条动画
        NProgress.done()
        // 所有的响应异常 区分来源为取消请求/非取消请求
        return Promise.resolve({
          ...error?.response?.data,
        })
      },
    )
  }

  /** 通用请求工具函数 */
  public request<T>(
    method: RequestMethods,
    url: string,
    param?: AxiosRequestConfig,
    axiosConfig?: PureHttpRequestConfig,
  ): Promise<T> {
    const config = {
      method,
      url,
      ...param,
      ...axiosConfig,
    } as PureHttpRequestConfig

    // 单独处理自定义请求/响应回掉
    return new Promise((resolve, reject) => {
      PureHttp.axiosInstance
        .request(config)
        .then((response: undefined) => {
          resolve(response)
        })
        .catch((error) => {
          reject(error)
        })
    })
  }

  /** 单独抽离的post工具函数 */
  public post<T, P>(
    url: string,
    params?: AxiosRequestConfig<T>,
    config?: PureHttpRequestConfig,
  ): Promise<P> {
    return this.request<P>('post', url, params, config)
  }

  /** 单独抽离的get工具函数 */
  public get<T, P>(
    url: string,
    params?: AxiosRequestConfig<T>,
    config?: PureHttpRequestConfig,
  ): Promise<P> {
    return this.request<P>('get', url, params, config)
  }
}

export const http = new PureHttp()
