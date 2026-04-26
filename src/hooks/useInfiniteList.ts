import { useInfiniteQuery } from "@tanstack/react-query";
import { adaptPage } from "@/services/api";

export interface InfinitePage<T> {
  hasNextPage: boolean;
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/**
 * 通用无限滚动 hook 工厂
 *
 * @example
 * const { data, fetchNextPage, hasNextPage } = useInfiniteList(
 *   queryKeys.topics.infinite(params),
 *   (page) => topicsApi.list({ page, page_size: 20 }),
 *   { transform: transformTopic, enabled: true }
 * );
 */
export function useInfiniteList<TRaw = any, TItem = TRaw>(
  queryKey: readonly unknown[],
  fetcher: (page: number) => Promise<any>,
  options?: {
    transform?: (raw: TRaw) => TItem;
    enabled?: boolean;
    staleTime?: number;
    pageSize?: number;
  }
) {
  const {
    transform,
    enabled = true,
    staleTime = 10 * 60 * 1000,
    pageSize: _pageSize = 20,
  } = options || {};

  return useInfiniteQuery<InfinitePage<TItem>>({
    queryKey,
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      const res = await fetcher(pageParam as number);
      const pg = adaptPage<TRaw>(res.result);
      const items = transform ? pg.list.map(transform) : (pg.list as unknown as TItem[]);
      return {
        items,
        total: pg.total,
        page: pg.page,
        pageSize: pg.pageSize,
        totalPages: pg.totalPages,
        hasNextPage: pg.page < pg.totalPages,
      };
    },
    getNextPageParam: (lastPage) => (lastPage.hasNextPage ? lastPage.page + 1 : undefined),
    enabled,
    staleTime,
    gcTime: 30 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
}
