import { useQueryClient } from "@tanstack/react-query";
import { Search, TrendingUp, X } from "lucide-react";
import { useCallback, useState } from "react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import SimpleInfiniteScroll from "@/components/common/SimpleInfiniteScroll";
import SimpleImageDetail from "@/components/media/SimpleImageDetail";
import CreatePostModal from "@/components/post/CreatePostModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIsAuthenticated } from "@/hooks/useAuth";
import { useTags } from "@/hooks/useTags";
import { useCollectTopic, useInfiniteTopics, useLikeTopic } from "@/hooks/useTopics";
import { apiService } from "@/services/api";

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearchQuery, setActiveSearchQuery] = useState("");
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
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

  const queryClient = useQueryClient();
  const { isAuthenticated } = useIsAuthenticated();
  const likeMutation = useLikeTopic();
  const collectMutation = useCollectTopic();

  // 获取热门标签数据
  const {
    data: tagsData,
    isLoading: isTagsLoading,
    error: tagsError,
  } = useTags({
    page: 1,
    size: 10,
    sort: "createdAt,desc",
  });

  // 获取搜索结果
  const {
    data: searchResultsData,
    isLoading: isSearchLoading,
    error: searchError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteTopics({
    size: 20,
    sort: "createdAt,desc",
    title: activeSearchQuery || undefined,
    tagId: selectedTagId || undefined,
  });

  const posts = searchResultsData?.pages.flatMap((page: any) => page.items) || [];

  // 处理搜索
  const handleSearch = useCallback(() => {
    setActiveSearchQuery(searchQuery);
    setSelectedTagId(null);
  }, [searchQuery]);

  // 处理标签点击
  const handleTagClick = useCallback((tagId: number, tagTitle: string) => {
    setSelectedTagId(tagId);
    setSearchQuery(tagTitle);
    setActiveSearchQuery("");
  }, []);

  // 清除搜索
  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    setActiveSearchQuery("");
    setSelectedTagId(null);
  }, []);

  const handleLike = useCallback(
    (postId: string) => {
      if (!isAuthenticated) {
        return;
      }

      const post = posts.find((p) => p.id === postId);
      if (!post) {
        return;
      }

      likeMutation.mutate({
        topicId: Number(postId),
        isLiked: post.isLiked,
      });
    },
    [posts, isAuthenticated, likeMutation],
  );

  const handleSave = useCallback(
    (postId: string) => {
      if (!isAuthenticated) {
        return;
      }

      const post = posts.find((p) => p.id === postId);
      if (!post) {
        return;
      }

      collectMutation.mutate({
        topicId: Number(postId),
        isCollected: post.isSaved,
      });
    },
    [posts, isAuthenticated, collectMutation],
  );

  const handlePostClick = useCallback((postId: string, event?: React.MouseEvent) => {
    const target = event?.currentTarget as HTMLElement;
    if (target) {
      const rect = target.getBoundingClientRect();
      setCardRect(rect);
    }
    setSelectedTopicId(Number(postId));
  }, []);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // 是否显示搜索结果
  const showSearchResults = activeSearchQuery || selectedTagId;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 搜索框 */}
      <div className="relative mb-12">
        <Search
          className="-translate-y-1/2 absolute top-1/2 left-6 transform text-gray-400"
          size={24}
        />
        <Input
          className="w-full rounded-2xl py-6 pr-16 pl-16 text-lg"
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
          placeholder="搜索感兴趣的内容..."
          value={searchQuery}
        />
        {searchQuery && (
          <Button
            className="-translate-y-1/2 absolute top-1/2 right-6 transform"
            onClick={handleClearSearch}
            size="icon"
            variant="ghost"
          >
            <X size={20} />
          </Button>
        )}
      </div>

      {/* 热门标签 */}
      {!showSearchResults && (
        <div className="mb-12">
          <div className="mb-6 flex items-center gap-3">
            <TrendingUp className="text-primary-500" size={24} />
            <h2 className="font-semibold text-2xl text-gray-900">热门标签</h2>
          </div>

          {isTagsLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="md" />
            </div>
          ) : tagsError ? (
            <div className="py-8 text-center text-red-500">加载标签失败，请稍后重试</div>
          ) : (
            <div className="flex flex-wrap gap-4">
              {tagsData?.items.map((tag) => (
                <Badge
                  className="cursor-pointer rounded-full border border-primary-200 bg-gradient-to-r from-primary-50 to-secondary-50 px-6 py-3 text-lg text-primary-700 transition-all duration-300 hover:from-primary-100 hover:to-secondary-100"
                  key={tag.id}
                  onClick={() => handleTagClick(tag.id, tag.title)}
                  variant="outline"
                >
                  #{tag.title}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 搜索结果 */}
      {showSearchResults && (
        <div>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-semibold text-2xl text-gray-900">
              {selectedTagId ? `标签: #${searchQuery}` : `搜索: "${activeSearchQuery}"`}
            </h2>
            <Button onClick={handleClearSearch} size="sm" variant="ghost">
              清除搜索
            </Button>
          </div>

          {isSearchLoading && posts.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <LoadingSpinner className="mb-4" size="lg" />
                <p className="text-gray-600">搜索中...</p>
              </div>
            </div>
          ) : searchError ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <p className="mb-4 text-red-600">搜索失败</p>
                <Button onClick={() => refetch()} variant="default">
                  重试
                </Button>
              </div>
            </div>
          ) : posts.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <p className="text-gray-500">未找到相关内容</p>
              </div>
            </div>
          ) : (
            <SimpleInfiniteScroll
              hasMore={hasNextPage}
              isLoading={isFetchingNextPage}
              onLike={handleLike}
              onLoadMore={handleLoadMore}
              onPostClick={handlePostClick}
              onSave={handleSave}
              posts={posts}
            />
          )}
        </div>
      )}

      {/* 话题详情弹窗 */}
      {selectedTopicId && (
        <SimpleImageDetail
          isOpen={!!selectedTopicId}
          onClose={() => {
            setSelectedTopicId(null);
            setCardRect(null);
          }}
          onEdit={async (topicId) => {
            try {
              const response = await apiService.getTopicDetail(topicId);
              if (response.code === 200 && response.result) {
                const topic = response.result;

                const images = topic.fileList || [];

                setEditingTopicId(topicId);
                setEditingTopicData({
                  title: topic.title || "",
                  content: topic.content || "",
                  images: images,
                  topicTags: topic.topicTags || [],
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
              const { compareObjects } = await import("@iceywu/utils");

              const originalData = {
                title: editingTopicData.title,
                content: editingTopicData.content,
                fileIds: editingTopicData.images?.map((img) => img.id) || [],
              };

              const changes = compareObjects(originalData, postData);

              if (Object.keys(changes).length === 0) {
                return;
              }

              const response = await apiService.updateTopic(editingTopicId, changes);

              if (response.code === 200) {
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
    </div>
  );
}
