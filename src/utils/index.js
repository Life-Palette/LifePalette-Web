import dayjs from "dayjs";

// 时间格式化
export const formatTime = (time, format = "YYYY-MM-DD HH:mm:ss",isISO=true) => {
  if (!time) return "";
  isISO && (time = new Date(time).getTime());
  if (time.toString().length < 13) {
    time = time * 1000;
  }
  return dayjs(time).format(format);
};

/** 获取本地存储 */
export const getLocalStorage = (key) => {
  if (localStorage.getItem(key) !== null) {
    return JSON.parse(localStorage.getItem(key))
  }
}

/** 设置本地存储 */
export const setLocalStorage = (key, val) => {
  return localStorage.setItem(key, JSON.stringify(val))
}

/** 删除本地存储 */
export const removeLocalStorage = (key) => {
  return localStorage.removeItem(key)
}

// SessionStorage
/** 获取本地存储 */
export const getSessionStorage = (key) => {
  if (sessionStorage.getItem(key) !== null) {
    return JSON.parse(sessionStorage.getItem(key))
  }
}

/** 设置本地存储 */
export const setSessionStorage = (key, val) => {
  return sessionStorage.setItem(key, JSON.stringify(val))
}

/** 删除本地存储 */
export const removeSessionStorage = (key) => {
  return sessionStorage.removeItem(key)
}

export const useDateFormat = (time, format) => {
  const date = new Date(Number(time))
  const o = {
    'M+': date.getMonth() + 1, //month
    'D+': date.getDate(), //day
    'h+': date.getHours(), //hour
    'm+': date.getMinutes(), //minute
    's+': date.getSeconds(), //second
    'q+': Math.floor((date.getMonth() + 3) / 3), //quarter
    S: date.getMilliseconds(), //millisecond
  }
  if (/(Y+)/.test(format)) {
    format = format.replace(
      RegExp.$1,
      (date.getFullYear() + '').substr(4 - RegExp.$1.length)
    )
  }
  for (const k in o) {
    if (new RegExp('(' + k + ')').test(format)) {
      format = format.replace(
        RegExp.$1,
        RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length)
      )
    }
  }
  return format
}

// 文件下载
export function downloadFile(url, fileName = '未知文件') {
  const link = document.createElement('a')
  link.style.display = 'none'
  link.href = url
  link.setAttribute('download', fileName)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export default {
  getLocalStorage,
  setLocalStorage,
  removeLocalStorage,
  getSessionStorage,
  setSessionStorage,
  removeSessionStorage,

  downloadFile,
  useDateFormat,
}
