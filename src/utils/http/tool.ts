import { isArray, isNumber, isObject, toPro } from '@iceywu/utils'

export function isRequestSuccess(data: any) {
  if (isNumber(data)) {
    return data === 200
  }
  if (isObject(data)) {
    return data.code === 200
  }
 else {
    return false
  }
}
export const requestValOptions = [
  {
    keys: ['code', 'result'],
    // valFormat: (valList: any) => {
    //   const [code, result] = valList;
    //   return isRequestSuccess(code) ? result : [];
    // }
  },
]

export async function requestTo(promise: Promise<unknown>,
  //   valList?: ValItem[]
  valList?: any) {
  const valListOptions = valList
    ? [...requestValOptions, ...valList]
    : requestValOptions

  const [err, res] = await toPro(promise, valListOptions)

  if (err) {
    return [err, null]
  }
  const [code, result] = res[0]
  if (isRequestSuccess(code)) {
    if (isArray(res) && res.length == 1) {
      return [err, result]
    }
 else {
      res[0] = result
      return [null, res]
    }
  }
 else {
    return [res[0], null]
  }
}
