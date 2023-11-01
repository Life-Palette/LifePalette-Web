import { ref, computed } from "vue";
import { acceptHMRUpdate, defineStore } from "pinia";
import { getLogin, refreshTokenApi } from "~/api/admin";
import { setToken, getToken, removeToken, formatToken } from "~/utils/auth";

export const useUserStore = defineStore(
  "user",
  () => {
    const userInfo = ref({});
    const count = ref(0);
    const setCount = () => {
      count.value++;
    };
    const setUserInfo = (data) => {
      userInfo.value = data;
    };
    /** 登录 */
    const handLogin = async (data) => {
      return new Promise((resolve, reject) => {
        getLogin(data)
          .then((data) => {
            console.log("登录", data);
            const { code, msg, result } = data;
            if (code === 200 && result) {
              const { token, admin, status } = result || {};
              if (status && status === 400) {
                const { response } = result;
                const value = Object.values(response)[0];
                value && ElMessage.error(value);
                reject(data);
              } else {
                setToken(token);
                setUserInfo(admin);
              }
              resolve(data);
            } else {
              console.log("登录失败", msg);
              // console.log("result", data);
              const { response = {} } = data || {};
              // console.log("response", response.data);
              resolve(response?.data);
            }
          })
          .catch((error) => {
            reject(error);
          });
      });
    };

    /** 刷新`token` */
    const handRefreshToken = async (data) => {
      return new Promise((resolve, reject) => {
        refreshTokenApi(data)
          .then((data) => {
            console.log("刷新token", data);
            const { code, msg, result } = data;
            if (code === 200 && result) {
              setToken(result);
              resolve(data);
            } else {
              console.log("刷新token失败", msg);
            }
          })
          .catch((error) => {
            reject(error);
          });
      });
    };
    // 退出登录
    const logout = () => {
      removeToken();
      setUserInfo({});
    };
    return {
      count,
      setCount,
      handRefreshToken,
      handLogin,
      userInfo,
      setUserInfo,
      logout,
    };
  },
  {
    persist: {
      key: "test-key",
    },
  }
);

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot));
