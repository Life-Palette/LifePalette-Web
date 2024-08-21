import type {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
  Method,
} from 'axios'

export interface resultType {
  accessToken?: string
}

export type RequestMethods = Extract<
  Method,
	'get' | 'post' | 'put' | 'delete' | 'patch' | 'option' | 'head'
>

export interface PureHttpError extends AxiosError {
  isCancelRequest?: boolean
}

export interface PureHttpResponse extends AxiosResponse {
  config: PureHttpRequestConfig
}

export interface PureHttpRequestConfig<T = any> extends AxiosRequestConfig {

  beforeRequestCallback?: (request: PureHttpRequestConfig) => void

  beforeResponseCallback?: (response: PureHttpResponse) => void
  isNeedToken?: boolean
  isNeedLoading?: boolean
  serverName?: string
}

export interface PureHttpInterceptorsConfig<T = any>
  extends InternalAxiosRequestConfig {

  beforeRequestCallback?: (request: PureHttpRequestConfig) => void

  beforeResponseCallback?: (response: PureHttpResponse) => void
  isNeedToken?: boolean
  isNeedLoading?: boolean
  serverName?: string
}

export default class PureHttp {
  request<T>(

    method: RequestMethods,

    url: string,

    param?: AxiosRequestConfig,

    axiosConfig?: PureHttpRequestConfig,
  ): Promise<T>
  post<T, P>(

    url: string,

    params?: T,

    config?: PureHttpRequestConfig,
  ): Promise<P>

  get<T, P>(url: string, params?: T, config?: PureHttpRequestConfig): Promise<P>
}
