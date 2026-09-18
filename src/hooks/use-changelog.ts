import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { changelogApi } from "@/services/api";
import type { Changelog } from "@/types";
import { useInfiniteList } from "./use-infinite-list";

/** 将后端蛇形命名转为前端驼峰命名 */
function transformChangelog(raw: Record<string, unknown>): Changelog {
  return {
    content: raw.content,
    createdAt: raw.created_at ?? raw.createdAt ?? "",
    id: raw.id,
    isPublished: raw.is_published ?? raw.isPublished ?? false,
    publishedAt: raw.published_at ?? raw.publishedAt ?? null,
    title: raw.title,
    type: raw.type || "feature",
    updatedAt: raw.updated_at ?? raw.updatedAt ?? "",
    version: raw.version,
  };
}

/** 更新日志列表（无限滚动） */
export const useChangelogs = (params?: { pageSize?: number }) =>
  useInfiniteList<Record<string, unknown>, Changelog>(
    queryKeys.changelog.infinite(params),
    (page) =>
      changelogApi.list({
        page,
        page_size: params?.pageSize || 10,
        status: "published",
      }),
    { transform: transformChangelog }
  );

/** 最新更新日志 */
export const useLatestChangelog = () =>
  useQuery({
    queryFn: async () => {
      const res = await changelogApi.getLatest();
      return res.result ? transformChangelog(res.result) : null;
    },
    queryKey: queryKeys.changelog.latest(),
    staleTime: 10 * 60 * 1000,
  });

/** 更新日志详情 */
export const useChangelogByIdentifier = (identifier: string) =>
  useQuery({
    enabled: !!identifier,
    queryFn: async () => {
      const res = await changelogApi.getByIdentifier(identifier);
      return transformChangelog(res.result);
    },
    queryKey: queryKeys.changelog.detail(identifier),
    staleTime: 10 * 60 * 1000,
  });
