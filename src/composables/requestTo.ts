import { isArray, isNumber, isObject, toPro } from '@iceywu/utils'

export function isRequestSuccess(data: any) {
  const sucessCodes = [10000, 1, 200]
  if (isNumber(data)) {
    return sucessCodes.includes(data)
  }
  if (isObject(data)) {
    return sucessCodes.includes(data.code)
  }
 else {
    return false
  }
}
 const requestValOptions = [
  {
    keys: ['code', 'result'],
  },
]
interface RequestToOptions {
	valList?: any
	isOnlyData?: boolean
}

export async function requestTo(promise: Promise<unknown>, requestToOptions?: RequestToOptions) {
	const { valList, isOnlyData = true } = requestToOptions || {}
  const valListOptions = valList
    ? [...requestValOptions, ...valList]
    : requestValOptions

  const [err, res] = await toPro(promise, valListOptions)

  if (err) {
    return isOnlyData ? null : [err, null]
  }
  const [code, result] = res[0]
  if (isRequestSuccess(code)) {
    if (isArray(res) && res.length === 1) {
      return isOnlyData ? result : [err, result]
    }
 else {
      res[0] = result
      return isOnlyData ? res : [null, res]
    }
  }
 else {
    return isOnlyData ? res[0] : [res[0], null]
  }
}
