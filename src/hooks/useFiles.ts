import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { filesApi } from "@/services/api";
import type { PostImage } from "@/types";
import { useInfiniteList } from "./useInfiniteList";

export interface UserFileImage extends PostImage {
  hasTopic?: boolean;
  isPrivate?: boolean;
}

const transformFile = (f: any): UserFileImage => ({
  id: f.sec_uid || f.id,
  url: f.url,
  width: f.width || 0,
  height: f.height || 0,
  blurhash: f.blurhash || "",
  type: f.type || "image/jpeg",
  name: f.name || "",
  lat: f.lat || 0,
  lng: f.lng || 0,
  videoSrc: f.live_photo_video?.url || null,
  isPrivate: f.is_private,
  hasTopic: false,
});

/** 用户文件列表（无限滚动） */
export const useInfiniteUserFiles = (
  userSecUid?: string,
  params?: {
    size?: number;
    sort?: string;
    preset?: "mini" | "simple" | "full";
  }
) =>
  useInfiniteList(
    queryKeys.files.infinite(userSecUid!, params),
    (page) =>
      filesApi.list({
        page,
        page_size: params?.size || 20,
        sort: params?.sort,
        preset: params?.preset,
        user_sec_uid: userSecUid,
      }),
    {
      transform: transformFile,
      enabled: !!userSecUid,
    }
  );

/** 更新文件可见性 */
export const useUpdateFileVisibility = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ fileId, isPrivate }: { fileId: string; isPrivate: boolean }) =>
      filesApi.update(fileId, { is_private: isPrivate }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.files.all }),
  });
};

/** 删除文件 */
export const useDeleteFile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (fileId: string) => filesApi.delete(fileId),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.files.all }),
  });
};

// ============ 颜色 ============

/** 颜色统计（无限滚动） */
export const useColorStats = (params?: { pageSize?: number; enabled?: boolean }) =>
  useInfiniteList(
    queryKeys.files.colorStats(params),
    (page) => filesApi.getColorStats({ page, page_size: params?.pageSize || 50 }),
    { enabled: params?.enabled ?? true }
  );

/** 按颜色查找文件（无限滚动） */
export const useColorFiles = (hex?: string, params?: { pageSize?: number }) =>
  useInfiniteList(
    queryKeys.files.byColor(hex!, params),
    (page) => filesApi.getByColor({ hex: hex!, page, page_size: params?.pageSize || 20 }),
    { enabled: !!hex }
  );
