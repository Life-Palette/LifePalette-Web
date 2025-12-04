import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { apiService } from "@/services/api";
import type { Changelog } from "@/types";

// 获取已发布的更新日志列表（无限滚动版本）
export const useChangelogs = (params?: { pageSize?: number }) => {
    return useInfiniteQuery({
        queryKey: queryKeys.changelog.infiniteList(params),
        initialPageParam: 1,
        queryFn: async ({ pageParam = 1 }) => {
            const response = await apiService.getPublishedChangelogs({
                page: pageParam,
                size: params?.pageSize || 10,
            });

            if (response.code === 200 && response.result) {
                const pagination = response.result.pagination as any;
                const currentPage = pagination.current_page || pagination.page || 1;
                const totalPages = pagination.totalPages || Math.ceil(pagination.total / pagination.pageSize) || 1;
                return {
                    items: response.result.list as Changelog[],
                    total: pagination.totalElements || pagination.total || 0,
                    page: currentPage,
                    pageSize: pagination.size || pagination.pageSize || 10,
                    totalPages: totalPages,
                    hasNextPage: currentPage < totalPages,
                };
            }
            throw new Error(response.message || "获取更新日志失败");
        },
        getNextPageParam: (lastPage) => (lastPage.hasNextPage ? lastPage.page + 1 : undefined),
        staleTime: 10 * 60 * 1000, // 10分钟内数据被认为是新鲜的
        gcTime: 30 * 60 * 1000, // 30分钟垃圾回收
        retry: 2,
        refetchOnWindowFocus: false,
    });
};

// 获取最新的更新日志
export const useLatestChangelog = () => {
    return useQuery({
        queryKey: queryKeys.changelog.latest(),
        queryFn: async () => {
            const response = await apiService.getLatestChangelog();
            if (response.code === 200 && response.result) {
                return response.result as Changelog;
            }
            throw new Error(response.message || "获取最新更新日志失败");
        },
        staleTime: 10 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        retry: 2,
        refetchOnWindowFocus: false,
    });
};

// 获取更新日志详情（支持ID或版本号）
export const useChangelogByIdentifier = (identifier: string | number) => {
    return useQuery({
        queryKey: ["changelog", "identifier", identifier],
        queryFn: async () => {
            const response = await apiService.getChangelogByIdentifier(identifier);
            if (response.code === 200 && response.result) {
                return response.result as Changelog;
            }
            throw new Error(response.message || "获取更新日志详情失败");
        },
        enabled: !!identifier,
        staleTime: 10 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        retry: 2,
        refetchOnWindowFocus: false,
    });
};
