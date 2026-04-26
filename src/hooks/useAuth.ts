import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { authApi, http, usersApi } from "@/services/api";

// 获取当前用户信息的hook
export const useCurrentUser = () => {
  return useQuery({
    queryKey: queryKeys.users.me(),
    queryFn: async () => {
      try {
        const res = await usersApi.getMe();
        if (!res.result) {
          return null;
        }
        // 静默解析用户 IP 地理位置（页面刷新/首次加载时）
        http.get("/common/ip").catch(() => { });
        // 统一 id 为 sec_uid
        return { ...res.result, id: res.result.sec_uid };
      } catch (_error) {
        return null;
      }
    },
    staleTime: 10 * 60 * 1000,
    retry: false,
  });
};

// 检查用户是否已登录
export const useIsAuthenticated = () => {
  const { data: user, isLoading } = useCurrentUser();
  return {
    isAuthenticated: !!user,
    user,
    isLoading,
  };
};

// 登录hook
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ account, password }: { account: string; password: string }) => {
      const res = await authApi.login(account, password);
      const token = res.result?.token?.access_token || res.result?.access_token;
      if (token) {
        http.setToken(token);
      }
      return res;
    },
    onSuccess: (data) => {
      if (data.code === 200 && data.result) {
        queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
        queryClient.invalidateQueries({ queryKey: queryKeys.topics.all });
        // 静默解析用户 IP 地理位置
        http.get("/common/ip").catch(() => { });
      }
    },
  });
};

// 验证码登录hook
export const useLoginByCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ account, code }: { account: string; code: string }) => {
      const res = await authApi.loginByCode(account, code);
      const token = res.result?.token?.access_token || res.result?.access_token;
      if (token) {
        http.setToken(token);
      }
      return res;
    },
    onSuccess: (data) => {
      if (data.code === 200 && data.result) {
        queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
        queryClient.invalidateQueries({ queryKey: queryKeys.topics.all });
        // 静默解析用户 IP 地理位置
        http.get("/common/ip").catch(() => { });
      }
    },
  });
};

// 重置密码hook
export const useResetPassword = () => {
  return useMutation({
    mutationFn: async (data: {
      account: string;
      code: string;
      password: string;
      password_confirm: string;
    }) => await authApi.resetPassword(data),
  });
};

// 注册hook
export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      email: string;
      password: string;
      password_confirm: string;
      code: string;
    }) => {
      const res = await authApi.register(data);
      if (res.result?.token?.access_token) {
        http.setToken(res.result.token.access_token);
      }
      return res;
    },
    onSuccess: (data) => {
      if ((data.code === 200 || data.code === 201) && data.result) {
        queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
        queryClient.invalidateQueries({ queryKey: queryKeys.topics.all });
      }
    },
  });
};

// 登出hook
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await authApi.logout();
      http.clearToken();
    },
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.users.me(), null);
      queryClient.invalidateQueries({ queryKey: queryKeys.topics.all });
      queryClient.clear();
    },
  });
};

// 更新用户邮箱 hook
export const useUpdateUserEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, code }: { email: string; code: string }) =>
      await usersApi.updateMe({ email, verification_code: code }),
    onSuccess: (data) => {
      if (data.code === 200) {
        queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
      }
    },
  });
};

// 发送邮箱验证码 hook
export const useSendEmailCode = () => {
  return useMutation({
    mutationFn: async ({ email, purpose = "register" }: { email: string; purpose?: string }) =>
      await authApi.sendEmailCode(email, purpose),
  });
};

// ============ 用户查询 ============

/** 根据 sec_uid 获取用户信息 */
export const useUserById = (secUid?: string) =>
  useQuery({
    queryKey: queryKeys.users.detail(secUid!),
    queryFn: async () => (await usersApi.getBySecUid(secUid!)).result,
    enabled: !!secUid,
    staleTime: 5 * 60 * 1000,
  });

/** 用户互动统计 */
export const useUserStats = (secUid?: string) =>
  useQuery({
    queryKey: queryKeys.users.stats(secUid!),
    queryFn: async () => (await usersApi.getStats(secUid!)).result,
    enabled: !!secUid,
    staleTime: 5 * 60 * 1000,
  });
