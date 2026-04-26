import { http } from "../http";

export const authApi = {
  login: (account: string, password: string) => http.post("/auth/login", { account, password }),

  loginByCode: (account: string, code: string) =>
    http.post("/auth/login", { account, code, login_type: "code" }),

  register: (data: { email: string; password: string; password_confirm: string; code: string }) =>
    http.post("/auth/register", data),

  logout: () => http.post("/auth/logout"),

  logoutAll: () => http.post("/auth/logout-all"),

  refreshToken: (refreshToken: string) =>
    http.post("/auth/refresh", { refresh_token: refreshToken }),

  resetPassword: (data: {
    account: string;
    code: string;
    password: string;
    password_confirm: string;
  }) =>
    http.post("/auth/self-reset-password", {
      account: data.account,
      code: data.code,
      new_password: data.password,
    }),

  sendEmailCode: (email: string, purpose = "register") =>
    http.post("/verification/send", { email, purpose }),

  verifyCode: (email: string, code: string) => http.post("/verification/verify", { email, code }),

  // 二维码登录
  generateQR: () => http.post("/auth/qr/generate"),
  checkQR: (key: string) => http.get(`/auth/qr/check/${key}`),
};
