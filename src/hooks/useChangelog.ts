import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { changelogApi } from "@/services/api";
import type { Changelog } from "@/types";
import { useInfiniteList } from "./useInfiniteList";

/** 将后端蛇形命名转为前端驼峰命名 */
function transformChangelog(raw: any): Changelog {
  return {
    id: raw.id,
    version: raw.version,
    title: raw.title,
    content: raw.content,
    type: raw.type || "feature",
    isPublished: raw.is_published ?? raw.isPublished ?? false,
    publishedAt: raw.published_at ?? raw.publishedAt ?? null,
    createdAt: raw.created_at ?? raw.createdAt ?? "",
    updatedAt: raw.updated_at ?? raw.updatedAt ?? "",
  };
}

/** 更新日志列表（无限滚动） */
export const useChangelogs = (params?: { pageSize?: number }) =>
  useInfiniteList<any, Changelog>(
    queryKeys.changelog.infinite(params),
    (page) =>
      changelogApi.list({ page, page_size: params?.pageSize || 10, status: "published" }),
    { transform: transformChangelog }
  );

/** 最新更新日志 */
export const useLatestChangelog = () =>
  useQuery({
    queryKey: queryKeys.changelog.latest(),
    queryFn: async () => {
      const res = await changelogApi.getLatest();
      return res.result ? transformChangelog(res.result) : null;
    },
    staleTime: 10 * 60 * 1000,
  });

/** 更新日志详情 */
export const useChangelogByIdentifier = (identifier: string) =>
  useQuery({
    queryKey: queryKeys.changelog.detail(identifier),
    queryFn: async () => {
      const res = await changelogApi.getByIdentifier(identifier);
      return transformChangelog(res.result);
    },
    enabled: !!identifier,
    staleTime: 10 * 60 * 1000,
  });
