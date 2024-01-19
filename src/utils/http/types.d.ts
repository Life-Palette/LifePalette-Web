import {
	Method,
	AxiosError,
	AxiosResponse,
	AxiosRequestConfig,
	InternalAxiosRequestConfig,
} from 'axios'

export type resultType = {
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

// eslint-disable-next-line no-unused-vars
export interface PureHttpRequestConfig<T = any> extends AxiosRequestConfig {
	// eslint-disable-next-line no-unused-vars
	beforeRequestCallback?: (request: PureHttpRequestConfig) => void
	// eslint-disable-next-line no-unused-vars
	beforeResponseCallback?: (response: PureHttpResponse) => void
	isNeedToken?: boolean
	isNeedLoading?: boolean
	serverName?: string
}
// eslint-disable-next-line no-unused-vars
export interface PureHttpInterceptorsConfig<T = any>
	extends InternalAxiosRequestConfig {
	// eslint-disable-next-line no-unused-vars
	beforeRequestCallback?: (request: PureHttpRequestConfig) => void
	// eslint-disable-next-line no-unused-vars
	beforeResponseCallback?: (response: PureHttpResponse) => void
	isNeedToken?: boolean
	isNeedLoading?: boolean
	serverName?: string
}

export default class PureHttp {
	request<T>(
		// eslint-disable-next-line no-unused-vars
		method: RequestMethods,
		// eslint-disable-next-line no-unused-vars
		url: string,
		// eslint-disable-next-line no-unused-vars
		param?: AxiosRequestConfig,
		// eslint-disable-next-line no-unused-vars
		axiosConfig?: PureHttpRequestConfig,
	): Promise<T>
	post<T, P>(
		// eslint-disable-next-line no-unused-vars
		url: string,
		// eslint-disable-next-line no-unused-vars
		params?: T,
		// eslint-disable-next-line no-unused-vars
		config?: PureHttpRequestConfig,
	): Promise<P>
	// eslint-disable-next-line no-unused-vars
	get<T, P>(url: string, params?: T, config?: PureHttpRequestConfig): Promise<P>
}
