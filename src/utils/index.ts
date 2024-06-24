import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime) // 相对时间
dayjs.locale('zh-cn') // 使用本地化语言

// 时间格式化
export function formatTime(time,	format = 'YYYY-MM-DD HH:mm:ss',	isISO = true) {
  if (!time)
    return ''
  isISO && (time = new Date(time).getTime())
  if (time.toString().length < 13) {
    time = time * 1000
  }
  return dayjs(time).format(format)
}
// 时间格式化，多久前，eg:1分钟前,1小时前,1天前,
export function formatTimeBefore(time) {
  if (!time)
    return ''
  return dayjs(time).fromNow().replace(' ', '')
}

/** 获取本地存储 */
export function getLocalStorage(key) {
  if (localStorage.getItem(key) !== null) {
    return JSON.parse(localStorage.getItem(key))
  }
}

/** 设置本地存储 */
export function setLocalStorage(key, val) {
  return localStorage.setItem(key, JSON.stringify(val))
}

/** 删除本地存储 */
export function removeLocalStorage(key) {
  return localStorage.removeItem(key)
}

// SessionStorage
/** 获取本地存储 */
export function getSessionStorage(key) {
  if (!!sessionStorage.getItem(key) && sessionStorage.getItem(key) !== null) {
    return JSON.parse(sessionStorage.getItem(key))
  }
}

/** 设置本地存储 */
export function setSessionStorage(key, val) {
  return sessionStorage.setItem(key, JSON.stringify(val))
}

/** 删除本地存储 */
export function removeSessionStorage(key) {
  return sessionStorage.removeItem(key)
}

export function useDateFormat(time, format) {
  const date = new Date(Number(time))
  const o = {
    'M+': date.getMonth() + 1, // month
    'D+': date.getDate(), // day
    'h+': date.getHours(), // hour
    'm+': date.getMinutes(), // minute
    's+': date.getSeconds(), // second
    'q+': Math.floor((date.getMonth() + 3) / 3), // quarter
    'S': date.getMilliseconds(), // millisecond
  }
  if (/(Y+)/.test(format)) {
    format = format.replace(
      RegExp.$1,
      (`${date.getFullYear()}`).substr(4 - RegExp.$1.length),
    )
  }
  for (const k in o) {
    if (new RegExp(`(${k})`).test(format)) {
      format = format.replace(
        RegExp.$1,
        RegExp.$1.length == 1 ? o[k] : (`00${o[k]}`).substr((`${o[k]}`).length),
      )
    }
  }
  return format
}
export function formatChatTime(time) {
  if (!time)
    return ''
  if (time.toString().length < 13) {
    time = time * 1000
  }
  const now = new Date().getTime()
  const today = new Date().setHours(0, 0, 0, 0)
  const yesterday = new Date(today - 24 * 3600 * 1000).setHours(0, 0, 0, 0)
  const beforeYesterday = new Date(today - 24 * 3600 * 1000 * 2).setHours(
    0,
    0,
    0,
    0,
  )
  const timeDate = new Date(time).getTime()
  if (timeDate > today) {
    return dayjs(time).format('HH:mm')
  }
  else if (timeDate > yesterday) {
    return `昨天 ${dayjs(time).format('HH:mm')}`
  }
  else if (timeDate > beforeYesterday) {
    return `前天 ${dayjs(time).format('HH:mm')}`
  }
  else {
    return dayjs(time).format('YYYY-MM-DD HH:mm')
  }
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
