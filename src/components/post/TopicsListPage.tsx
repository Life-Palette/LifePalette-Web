import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import SimpleInfiniteScroll from "@/components/common/SimpleInfiniteScroll";
import PageLayout from "@/components/layout/PageLayout";
import SimpleImageDetail from "@/components/media/SimpleImageDetail";
import CreatePostModal from "@/components/post/CreatePostModal";
import { usePostActions } from "@/hooks/usePostActions";
import { useInfiniteTopics } from "@/hooks/useTopics";
import { apiService } from "@/services/api";

interface TopicsListPageProps {
  activeTab: "home" | "trending" | "likes" | "saved";
  sortBy?: string;
  title?: string;
  icon?: React.ReactNode;
  emptyMessage?: string;
}

export default function TopicsListPage({
  activeTab,
  sortBy = "createdAt,desc",
  title,
  icon,
  emptyMessage = "暂无内容",
}: TopicsListPageProps) {
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [initialImageIndex, setInitialImageIndex] = useState<number>(0);
  const [cardRect, setCardRect] = useState<DOMRect | null>(null);
  const [editingTopicId, setEditingTopicId] = useState<number | null>(null);
  const [editingTopicData, setEditingTopicData] = useState<{
    title: string;
    content: string;
    images?: any[];
    topicTags?: Array<{
      tag: {
        title: string;
      };
    }>;
  } | null>(null);
  const [_isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const {
    data: topicsData,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteTopics({
    size: 20,
    sort: sortBy,
  });

  const posts = topicsData?.pages.flatMap((page: any) => page.items) || [];

  // 使用统一的点赞和收藏操作 Hook，包含防抖功能
  const postActions = usePostActions({
    debounceMs: 300,
    onUnauthorized: () => setIsLoginModalOpen(true),
  });

  const handleLike = useCallback(
    (postId: string) => {
      const post = posts.find((p) => p.id === postId);
      if (!post) return;

      postActions.handleLike(Number(postId), post.isLiked);
    },
    [posts, postActions],
  );

  const handleSave = useCallback(
    (postId: string) => {
      const post = posts.find((p) => p.id === postId);
      if (!post) return;

      postActions.handleSave(Number(postId), post.isSaved);
    },
    [posts, postActions],
  );

  const handlePostClick = useCallback(
    (postId: string, event?: React.MouseEvent, imageIndex?: number) => {
      // 获取点击的卡片元素位置
      const target = event?.currentTarget as HTMLElement;
      if (target) {
        const rect = target.getBoundingClientRect();
        setCardRect(rect);
      }
      // 保存点击的图片索引，如果没有则默认为 0
      setInitialImageIndex(imageIndex ?? 0);
      setSelectedTopicId(Number(postId));
    },
    [],
  );

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading && posts.length === 0) {
    return (
      <PageLayout activeTab={activeTab}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout activeTab={activeTab}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <p className="mb-4 text-red-600">加载失败</p>
              <button
                className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                onClick={() => refetch()}
              >
                重试
              </button>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout activeTab={activeTab}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {title && (
          <div className="mb-8 flex items-center gap-3">
            {icon}
            <h1 className="font-bold text-2xl text-foreground">{title}</h1>
          </div>
        )}

        {posts.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <p className="text-muted-foreground">{emptyMessage}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <SimpleInfiniteScroll
              hasMore={hasNextPage}
              isLoading={isFetchingNextPage}
              onLike={handleLike}
              onLoadMore={handleLoadMore}
              onPostClick={handlePostClick}
              onSave={handleSave}
              posts={posts}
            />
          </div>
        )}
      </div>

      {selectedTopicId && (
        <SimpleImageDetail
          isOpen={!!selectedTopicId}
          initialImageIndex={initialImageIndex}
          onClose={() => {
            setSelectedTopicId(null);
            setCardRect(null);
            setInitialImageIndex(0);
          }}
          onEdit={async (topicId) => {
            try {
              // 加载话题数据
              const response = await apiService.getTopicDetail(topicId);
              if (response.code === 200 && response.result) {
                const topic = response.result;

                // 提取图片列表（从 fileList 字段）
                const images = topic.fileList || [];

                setEditingTopicId(topicId);
                setEditingTopicData({
                  title: topic.title || "",
                  content: topic.content || "",
                  images: images,
                  topicTags: topic.topicTags || [], // 添加标签数据
                });
                setSelectedTopicId(null);
              }
            } catch (error) {
              console.error("加载话题失败:", error);
            }
          }}
          originRect={cardRect}
          topicId={selectedTopicId}
        />
      )}

      {/* 编辑对话框 */}
      {editingTopicId && editingTopicData && (
        <CreatePostModal
          editMode
          initialData={editingTopicData}
          isOpen={!!editingTopicId}
          onClose={() => {
            setEditingTopicId(null);
            setEditingTopicData(null);
          }}
          onSubmit={async (postData: any) => {
            try {
              // 使用 compareObjects 只传递变动的字段
              const { compareObjects } = await import("@iceywu/utils");

              // 构建原始数据（用于对比）
              const originalData = {
                title: editingTopicData.title,
                content: editingTopicData.content,
                fileIds: editingTopicData.images?.map((img) => img.id) || [],
              };

              // 对比变化
              const changes = compareObjects(originalData, postData);

              // 如果没有变化，直接关闭
              if (Object.keys(changes).length === 0) {
                console.log("没有变化，无需更新");
                return;
              }

              console.log("🔄-----变更字段-----", changes);

              const response = await apiService.updateTopic(editingTopicId, changes);

              if (response.code === 200) {
                // 刷新相关缓存
                queryClient.invalidateQueries({
                  queryKey: ["topic", editingTopicId],
                });
                queryClient.invalidateQueries({ queryKey: ["topics"] });
                refetch();
              } else {
                alert(response.message || "更新失败");
              }
            } catch (error: any) {
              console.error("更新话题失败:", error);
              alert(error.message || "更新失败，请重试");
            }
          }}
          topicId={editingTopicId}
        />
      )}
    </PageLayout>
  );
}
