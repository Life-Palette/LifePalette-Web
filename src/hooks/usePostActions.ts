import { debounce } from "@iceywu/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useRef } from "react";
import { useIsAuthenticated } from "./useAuth";
import { useCollectTopic, useLikeTopic } from "./useTopics";

interface UsePostActionsOptions {
  debounceMs?: number;
  onUnauthorized?: () => void;
}

/**
 * 统一的点赞和收藏操作 Hook，包含防抖功能
 * 用于卡片列表和详情页统一调用
 */
export function usePostActions(options: UsePostActionsOptions = {}) {
  const { debounceMs = 300, onUnauthorized } = options;

  const { isAuthenticated } = useIsAuthenticated();
  const queryClient = useQueryClient();
  const likeMutation = useLikeTopic();
  const collectMutation = useCollectTopic();

  // 使用 useRef 存储最新的 mutation，避免防抖函数内部引用过期
  const likeMutationRef = useRef(likeMutation);
  const collectMutationRef = useRef(collectMutation);
  const queryClientRef = useRef(queryClient);

  // 更新 ref
  likeMutationRef.current = likeMutation;
  collectMutationRef.current = collectMutation;
  queryClientRef.current = queryClient;

  // 创建防抖函数（只在 debounceMs 改变时重新创建）
  const debouncedLike = useMemo(
    () =>
      debounce((topicId: number, isLiked: boolean) => {
        likeMutationRef.current.mutate(
          { topicId, isLiked },
          {
            // 成功后同时刷新详情页缓存
            onSuccess: () => {
              queryClientRef.current.invalidateQueries({ queryKey: ["topic", topicId] });
            },
          },
        );
      }, debounceMs),
    [debounceMs],
  );

  const debouncedCollect = useMemo(
    () =>
      debounce((topicId: number, isSaved: boolean) => {
        collectMutationRef.current.mutate(
          { topicId, isCollected: isSaved },
          {
            // 成功后同时刷新详情页缓存
            onSuccess: () => {
              queryClientRef.current.invalidateQueries({ queryKey: ["topic", topicId] });
            },
          },
        );
      }, debounceMs),
    [debounceMs],
  );

  /**
   * 处理点赞/取消点赞
   * @param topicId - 话题ID
   * @param isLiked - 当前是否已点赞
   */
  const handleLike = useCallback(
    (topicId: number, isLiked: boolean) => {
      if (!isAuthenticated) {
        onUnauthorized?.();
        return;
      }
      debouncedLike(topicId, isLiked);
    },
    [isAuthenticated, onUnauthorized, debouncedLike],
  );

  /**
   * 处理收藏/取消收藏
   * @param topicId - 话题ID
   * @param isSaved - 当前是否已收藏
   */
  const handleSave = useCallback(
    (topicId: number, isSaved: boolean) => {
      if (!isAuthenticated) {
        onUnauthorized?.();
        return;
      }
      debouncedCollect(topicId, isSaved);
    },
    [isAuthenticated, onUnauthorized, debouncedCollect],
  );

  return {
    handleLike,
    handleSave,
    isLoading: likeMutation.isPending || collectMutation.isPending,
  };
}
