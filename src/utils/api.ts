import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import axios from 'axios'
import { formatToken, getToken } from '@/utils/auth'
import baseUrl from '@/utils/http/base.js'
import NProgress from '@/utils/progress'

// 响应数据接口
export interface ApiResponse<T = any> {
  code: number
  msg: string
  result: T
  timestamp: number
}

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: baseUrl.apiServer,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
apiClient.interceptors.request.use(
  async (config) => {
    // 开启进度条
    NProgress.start()

    // 处理 baseURL
    if (import.meta.env.VITE_APP_MOCK_IN_DEVELOPMENT === 'true') {
      config.baseURL = ''
    }

    // 添加 token
    const token = getToken()
    if (token && token.accessToken) {
      config.headers.Authorization = formatToken(token.accessToken)
    }

    return config
  },
  (error) => {
    NProgress.done()
    return Promise.reject(error)
  },
)

// 响应拦截器
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    NProgress.done()
    return response
  },
  (error) => {
    NProgress.done()
    return Promise.reject(error)
  },
)

// 基础请求函数
export async function request<T = any>(
  url: string,
  options: AxiosRequestConfig = {},
): Promise<ApiResponse<T>> {
  const response = await apiClient.request<ApiResponse<T>>({
    url,
    ...options,
  })
  return response.data
}

// GET 请求
export async function get<T = any>(
  url: string,
  params?: any,
  options: AxiosRequestConfig = {},
): Promise<ApiResponse<T>> {
  return request<T>(url, {
    method: 'GET',
    params,
    ...options,
  })
}

// POST 请求
export async function post<T = any>(
  url: string,
  data?: any,
  options: AxiosRequestConfig = {},
): Promise<ApiResponse<T>> {
  return request<T>(url, {
    method: 'POST',
    data,
    ...options,
  })
}

// PUT 请求
export async function put<T = any>(
  url: string,
  data?: any,
  options: AxiosRequestConfig = {},
): Promise<ApiResponse<T>> {
  return request<T>(url, {
    method: 'PUT',
    data,
    ...options,
  })
}

// DELETE 请求
export async function del<T = any>(
  url: string,
  options: AxiosRequestConfig = {},
): Promise<ApiResponse<T>> {
  return request<T>(url, {
    method: 'DELETE',
    ...options,
  })
}

export { apiClient }
export default apiClient
