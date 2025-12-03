import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { apiService } from "@/services/api";
import type { PostImage } from "@/types";

// 用户文件项类型
export interface UserFile {
    id: number;
    name: string;
    url: string;
    type: string;
    blurhash: string;
    videoSrc?: string | null;
    fromIphone: boolean;
    width: number;
    height: number;
    lng: number;
    lat: number;
    takenAt?: string;
    createdAt: string;
    updatedAt: string;
    isPrivate?: boolean;
    hasTopic?: boolean;
}

// 扩展 PostImage 类型以包含新字段
export interface UserFileImage extends PostImage {
    isPrivate?: boolean;
    hasTopic?: boolean;
}

// 将 UserFile 转换为 UserFileImage 类型
const transformUserFileToPostImage = (file: UserFile): UserFileImage => ({
    id: file.id,
    url: file.url,
    width: file.width,
    height: file.height,
    blurhash: file.blurhash,
    type: file.type,
    name: file.name,
    lat: file.lat,
    lng: file.lng,
    videoSrc: file.videoSrc,
    isPrivate: file.isPrivate,
    hasTopic: file.hasTopic,
});

// 获取用户文件列表的hook（无限滚动版本）
export const useInfiniteUserFiles = (
    userId?: number,
    params?: {
        size?: number;
        sort?: string;
        includeExif?: boolean;
        filterEmptyLocation?: boolean;
    },
) => {
    return useInfiniteQuery({
        queryKey: queryKeys.files.infiniteByUser(userId || 0, params),
        initialPageParam: 1,
        enabled: !!userId,
        queryFn: async ({ pageParam = 1 }) => {
            const response = await apiService.getUserFiles({
                ...params,
                userId,
                page: pageParam,
                size: params?.size || 20,
            });

            if (response.code === 200 && response.result) {
                return {
                    items: response.result.list.map(transformUserFileToPostImage),
                    total: response.result.pagination.total,
                    page: response.result.pagination.page,
                    size: response.result.pagination.pageSize,
                    totalPages: response.result.pagination.totalPages,
                };
            }

            return {
                items: [],
                total: 0,
                page: 1,
                size: params?.size || 20,
                totalPages: 0,
            };
        },
        getNextPageParam: (lastPage) => {
            if (lastPage.page < lastPage.totalPages) {
                return lastPage.page + 1;
            }
            return undefined;
        },
    });
};

// 更新文件可见性的 hook
export const useUpdateFileVisibility = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ fileId, isPrivate }: { fileId: number; isPrivate: boolean }) => {
            return apiService.updateFile(fileId, { isPrivate });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.files.all });
        },
    });
};

// 删除文件的 hook
export const useDeleteFile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ fileId }: { fileId: number }) => {
            return apiService.deleteFile(fileId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.files.all });
        },
    });
};
