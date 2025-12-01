import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/services/api";
import type { Tag } from "@/types";

// 获取标签列表的hook
export const useTags = (params?: {
  page?: number;
  size?: number;
  sort?: string;
  title?: string;
  tagId?: number;
}) => {
  return useQuery({
    queryKey: ["tags", params],
    queryFn: async () => {
      const response = await apiService.getTags(params);
      if (response.code === 200 && response.result) {
        return {
          items: response.result.list as Tag[],
          total: response.result.pagination.total,
          page: response.result.pagination.page,
          size: response.result.pagination.pageSize,
          totalPages: response.result.pagination.totalPages,
        };
      }
      throw new Error(response.message || "获取标签列表失败");
    },
    staleTime: 10 * 60 * 1000, // 10分钟内数据被认为是新鲜的
    gcTime: 30 * 60 * 1000, // 30分钟垃圾回收
    retry: 2,
    refetchOnWindowFocus: false,
  });
};
