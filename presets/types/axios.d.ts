export interface Result<T = any> {
	code: number
	timestamp: number
	msg: string
	result: T
}

export interface listParams {
	page?: number
	size?: number
	sort?: string
}
