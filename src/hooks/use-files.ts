import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { filesApi } from "@/services/api";
import type { PostImage } from "@/types";
import { useInfiniteList } from "./use-infinite-list";

export interface UserFileImage extends PostImage {
  hasTopic?: boolean;
  isPrivate?: boolean;
}

const transformFile = (f: Record<string, unknown>): UserFileImage => ({
  blurhash: f.blurhash || "",
  hasTopic: false,
  height: f.height || 0,
  isPrivate: f.is_private,
  lat: f.lat || 0,
  lng: f.lng || 0,
  name: f.name || "",
  sec_uid: f.sec_uid || String(f.id),
  type: f.type || "image/jpeg",
  url: f.url,
  videoSrc: f.live_photo_video?.url || null,
  width: f.width || 0,
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
    queryKeys.files.infinite(userSecUid ?? "", params),
    (page) =>
      filesApi.list({
        page,
        page_size: params?.size || 20,
        preset: params?.preset,
        sort: params?.sort,
        user_sec_uid: userSecUid,
      }),
    {
      enabled: !!userSecUid,
      transform: transformFile,
    }
  );

/** 更新文件可见性 */
export const useUpdateFileVisibility = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      fileId,
      isPrivate,
    }: {
      fileId: string;
      isPrivate: boolean;
    }) => filesApi.update(fileId, { is_private: isPrivate }),
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
export const useColorStats = (params?: {
  pageSize?: number;
  enabled?: boolean;
}) =>
  useInfiniteList(
    queryKeys.files.colorStats(params),
    (page) =>
      filesApi.getColorStats({ page, page_size: params?.pageSize || 50 }),
    { enabled: params?.enabled ?? true }
  );

/** 按颜色查找文件（无限滚动） */
export const useColorFiles = (hex?: string, params?: { pageSize?: number }) =>
  useInfiniteList(
    queryKeys.files.byColor(hex ?? "", params),
    (page) =>
      filesApi.getByColor({
        hex: hex ?? "",
        page,
        page_size: params?.pageSize || 20,
      }),
    { enabled: !!hex }
  );
