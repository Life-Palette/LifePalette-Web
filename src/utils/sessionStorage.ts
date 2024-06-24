interface ProxyStorage {

  setItem: <T>(k: string, v: T) => void

  getItem: <T>(k: string) => T

  removeItem: (k: string) => void
  clear: () => void
}

// declare class sessionStorageProxy implements ProxyStorage {
// 	protected storage: Storage;
// 	constructor(storageModel: any);
// 	/**
// 	 * @description 储存对应键名的 `Storage` 对象
// 	 * @param k 键名
// 	 * @param v 键值
// 	 */
// 	setItem<T>(k: string, v: T): void;
// 	/**
// 	 * @description 获取对应键名的 `Storage` 对象
// 	 * @param k 键名
// 	 * @returns 对应键名的 `Storage` 对象
// 	 */
// 	getItem<T>(k: string): T;
// 	/**
// 	 * @description 删除对应键名的 `Storage` 对象
// 	 * @param k 键名
// 	 */
// 	removeItem(k: string): void;
// 	/**
// 	 * @description 删除此域的所有 `Storage` 对象
// 	 */
// 	clear(): void;
// }

// /**
//  * @description 操作本地 `sessionStorage`
//  */
// declare const storageSession: () => sessionStorageProxy;

// export {  sessionStorageProxy, storageSession };

export const storageSession: () => ProxyStorage = () => {
  const storage = window.sessionStorage
  return {
    setItem<T>(k: string, v: T): void {
      storage.setItem(k, JSON.stringify(v))
    },
    getItem<T>(k: string): T {
      return JSON.parse(storage.getItem(k) || '{}')
    },
    removeItem(k: string): void {
      storage.removeItem(k)
    },
    clear(): void {
      storage.clear()
    },
  }
}
