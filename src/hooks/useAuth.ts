import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/services/api";

// 获取当前用户信息的hook
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      try {
        const response = await apiService.getCurrentUser();
        if (response.code === 200 && response.result) {
          return response.result;
        }
        return null;
      } catch (_error) {
        return null;
      }
    },
    staleTime: 10 * 60 * 1000, // 10分钟内数据被认为是新鲜的
    retry: false, // 不重试，避免频繁的401错误
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
    mutationFn: async ({ account, password }: { account: string; password: string }) =>
      await apiService.login(account, password),
    onSuccess: (data) => {
      if (data.code === 200 && data.result) {
        // 登录成功后，刷新当前用户信息
        queryClient.invalidateQueries({ queryKey: ["currentUser"] });
        queryClient.invalidateQueries({ queryKey: ["topics"] });
      }
    },
  });
};

// 验证码登录hook
export const useLoginByCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ account, code }: { account: string; code: string }) =>
      await apiService.loginByCode(account, code),
    onSuccess: (data) => {
      if (data.code === 200 && data.result) {
        // 登录成功后，刷新当前用户信息
        queryClient.invalidateQueries({ queryKey: ["currentUser"] });
        queryClient.invalidateQueries({ queryKey: ["topics"] });
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
    }) => await apiService.resetPassword(data),
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
    }) => await apiService.register(data),
    onSuccess: (data) => {
      if (data.code === 200 && data.result) {
        // 注册成功后，刷新当前用户信息
        queryClient.invalidateQueries({ queryKey: ["currentUser"] });
        queryClient.invalidateQueries({ queryKey: ["topics"] });
      }
    },
  });
};

// 登出hook
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await apiService.logout();
    },
    onSuccess: () => {
      // 清除所有用户相关的缓存
      queryClient.setQueryData(["currentUser"], null);
      queryClient.invalidateQueries({ queryKey: ["topics"] });
      queryClient.clear(); // 清除所有缓存
    },
  });
};
