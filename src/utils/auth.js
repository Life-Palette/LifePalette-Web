import Cookies from "js-cookie";
import { getSessionStorage, setSessionStorage } from "~/utils";

import { useUserStore } from "~/store/user";

export const sessionKey = "user-info";
export const TokenKey = "authorized-token";

/** 获取`token` */
export function getToken() {
  return Cookies.get(TokenKey)
    ? JSON.parse(Cookies.get(TokenKey))
    : getSessionStorage(sessionKey);
}

export function setToken(data = {}) {
  console.log("setToken", data);
  const { access_token, refresh_token, expires_in } = data || {};
  const expires = expires_in ? new Date().getTime() + expires_in * 1000 : 0;
  const cookieString = JSON.stringify({ access_token, refresh_token, expires });
  expires > 0
    ? Cookies.set(TokenKey, cookieString, {
        expires: expires / 86400000,
      })
    : Cookies.set(TokenKey, cookieString);
  // setSessionStorage

  setSessionStorage(sessionKey, data);
}

/** 删除`token`以及key值为`user-info`的session信息 */
export function removeToken() {
  Cookies.remove(TokenKey);
  sessionStorage.clear(sessionKey);
}

/** 格式化token（jwt格式） */
export const formatToken = (token) => {
  return "Bearer " + token;
};
