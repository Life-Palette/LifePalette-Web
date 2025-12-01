import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/services/api";

export const useUserStats = (userId?: number) => {
  return useQuery({
    queryKey: ["userStats", userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error("用户ID不能为空");
      }

      const response = await apiService.getUserStats(userId);

      if (response.code === 200 && response.result) {
        return response.result;
      }

      throw new Error(response.message || "获取用户统计失败");
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5分钟内数据被认为是新鲜的
    gcTime: 30 * 60 * 1000, // 30分钟垃圾回收
    retry: 2,
  });
};
