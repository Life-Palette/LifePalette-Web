import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  Bookmark,
  Briefcase,
  Calendar,
  Camera,
  Github,
  Globe,
  Grid,
  Heart,
  Image,
  Mail,
  Map,
  MapPin,
  MessageCircle,
  Plus,
  Settings,
} from "lucide-react";
import { useCallback, useState } from "react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import SimpleInfiniteScroll from "@/components/common/SimpleInfiniteScroll";
import { LottieAnimation } from "@/components/lottie";
import TrackPage from "@/components/map/TrackPage";
import SimpleImageDetail from "@/components/media/SimpleImageDetail";
import PhotoWall from "@/components/profile/PhotoWall";
import CreatePostModal from "@/components/post/CreatePostModal";
import ProfileEditDialog from "@/components/profile/ProfileEditDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsAuthenticated } from "@/hooks/useAuth";
import {
  useCollectTopic,
  useInfiniteCollectedTopics,
  useInfiniteLikedTopics,
  useInfiniteTopics,
  useLikeTopic,
} from "@/hooks/useTopics";
import { useUserById } from "@/hooks/useUserById";
import { useUserStats } from "@/hooks/useUserStats";
import { apiService } from "@/services/api";

interface ProfilePageProps {
  userId?: number;
}

export default function ProfilePage({ userId: propUserId }: ProfilePageProps = {}) {
  const { user: currentUser, isLoading: isAuthLoading } = useIsAuthenticated();
  const navigate = useNavigate();

  // 如果传入了 userId，则查看其他用户的个人中心；否则查看当前用户的
  const targetUserId = propUserId || currentUser?.id;
  const isViewingOwnProfile = !propUserId || propUserId === currentUser?.id;
  const user = currentUser; // 保持原有的 user 变量用于权限判断
  const isLoading = isAuthLoading;
  const [activeTab, setActiveTab] = useState("posts");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
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

  // 发送消息处理函数
  const handleSendMessage = useCallback(async () => {
    if (!targetUserId || isViewingOwnProfile) return;

    try {
      // 创建或获取私聊房间
      await apiService.createPrivateChat(targetUserId);
      // 跳转到聊天页面
      navigate({ to: "/chat" as any });
    } catch (error) {
      console.error("创建聊天失败:", error);
    }
  }, [targetUserId, isViewingOwnProfile, navigate]);

  // 获取用户动态数据
  const {
    data: topicsData,
    isLoading: isLoadingTopics,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteTopics({
    userId: targetUserId,
    size: 20,
    sort: "createdAt,desc",
  });

  // 获取用户喜欢的动态数据
  const {
    data: likedTopicsData,
    isLoading: isLoadingLikedTopics,
    fetchNextPage: fetchNextLikedPage,
    hasNextPage: hasNextLikedPage,
    isFetchingNextPage: isFetchingNextLikedPage,
  } = useInfiniteLikedTopics(targetUserId);

  // 获取用户收藏的动态数据
  const {
    data: collectedTopicsData,
    isLoading: isLoadingCollectedTopics,
    fetchNextPage: fetchNextCollectedPage,
    hasNextPage: hasNextCollectedPage,
    isFetchingNextPage: isFetchingNextCollectedPage,
  } = useInfiniteCollectedTopics(targetUserId);

  const likeMutation = useLikeTopic();
  const collectMutation = useCollectTopic();

  // 获取用户统计数据
  const { data: userStats } = useUserStats(targetUserId);

  // 获取目标用户信息（如果查看其他用户）
  const { data: targetUserData, isLoading: isLoadingTargetUser } = useUserById(propUserId);
  const displayUser = propUserId ? targetUserData : user;

  // 综合加载状态
  const isLoadingUser = isLoading || (propUserId && isLoadingTargetUser);

  const posts = topicsData?.pages.flatMap((page: any) => page.items) || [];
  const likedPosts = likedTopicsData?.pages.flatMap((page: any) => page.items) || [];
  const collectedPosts = collectedTopicsData?.pages.flatMap((page: any) => page.items) || [];

  const handleLike = useCallback(
    (postId: string) => {
      const allPosts = [...posts, ...likedPosts, ...collectedPosts];
      const post = allPosts.find((p) => p.id === postId);
      if (!post) return;

      likeMutation.mutate({
        topicId: Number(postId),
        isLiked: post.isLiked,
      });
    },
    [posts, likedPosts, collectedPosts, likeMutation],
  );

  const handleSave = useCallback(
    (postId: string) => {
      const allPosts = [...posts, ...likedPosts, ...collectedPosts];
      const post = allPosts.find((p) => p.id === postId);
      if (!post) return;

      collectMutation.mutate({
        topicId: Number(postId),
        isCollected: post.isSaved,
      });
    },
    [posts, likedPosts, collectedPosts, collectMutation],
  );

  const handlePostClick = useCallback((postId: string, event?: React.MouseEvent) => {
    // 获取点击的卡片元素位置
    const target = event?.currentTarget as HTMLElement;
    if (target) {
      const rect = target.getBoundingClientRect();
      setCardRect(rect);
    }
    setSelectedTopicId(Number(postId));
  }, []);

  const handleLoadMore = useCallback(() => {
    if (activeTab === "posts") {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    } else if (activeTab === "liked") {
      if (hasNextLikedPage && !isFetchingNextLikedPage) {
        fetchNextLikedPage();
      }
    } else if (activeTab === "saved") {
      if (hasNextCollectedPage && !isFetchingNextCollectedPage) {
        fetchNextCollectedPage();
      }
    }
  }, [
    activeTab,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    hasNextLikedPage,
    isFetchingNextLikedPage,
    fetchNextLikedPage,
    hasNextCollectedPage,
    isFetchingNextCollectedPage,
    fetchNextCollectedPage,
  ]);

  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!displayUser) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-gray-600">用户信息加载失败</p>
        </div>
      </div>
    );
  }

  // 统计数据
  const stats = [
    { label: "动态", value: posts.length.toString() },
    {
      label: "关注",
      value: userStats?.followingCount?.toString() || "0",
    },
    {
      label: "粉丝",
      value: userStats?.followerCount?.toString() || "0",
    },
  ];

  const tabs = [
    {
      id: "posts",
      icon: Grid,
      label: "动态",
      count: topicsData?.pages[0]?.total,
    },
    { id: "photos", icon: Image, label: "照片墙" },
    { id: "track", icon: Map, label: "轨迹" },
    {
      id: "liked",
      icon: Heart,
      label: "喜欢",
      count: userStats?.likeCount,
    },
    {
      id: "saved",
      icon: Bookmark,
      label: "收藏",
      count: userStats?.collectionCount,
    },
  ];

  return (
    <div className="space-y-6">
      {/* 个人信息区域 - 使用 shadcn Card */}
      <Card className="group relative overflow-hidden border-border/50 transition-all hover:border-border">
        {/* 背景图片区域 - 带视差效果 */}
        <div className="relative h-52 w-full overflow-hidden rounded-t-xl">
          {displayUser.backgroundInfo?.url ? (
            <>
              <img
                alt="Background"
                className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                src={displayUser.backgroundInfo.url}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/0 via-background/0 to-background" />
            </>
          ) : (
            <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-muted via-muted/80 to-muted/60">
              {/* 几何装饰元素 */}
              <div className="absolute inset-0 opacity-[0.03]">
                <div className="absolute top-0 left-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border-[40px] border-foreground" />
                <div className="absolute top-1/2 right-0 h-48 w-48 translate-x-1/2 -translate-y-1/2 rounded-full border-[30px] border-foreground" />
              </div>
              <div className="flex h-full w-full items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-dashed border-muted-foreground/30">
                    <Camera className="text-muted-foreground/50" size={28} />
                  </div>
                  <p className="text-muted-foreground/60 text-sm font-medium">添加背景图片</p>
                </div>
              </div>
            </div>
          )}

          {/* 编辑按钮 - 浮动设计（仅在查看自己的个人中心时显示） */}
          {isViewingOwnProfile && (
            <Button
              variant="outline"
              size="icon"
              aria-label="编辑个人资料"
              className="absolute top-5 right-5 h-10 w-10 rounded-xl border-border/50 bg-background/60 backdrop-blur-xl transition-all hover:border-border hover:bg-background/80 hover:shadow-lg"
              onClick={() => setIsEditDialogOpen(true)}
            >
              <Settings className="text-foreground" size={16} />
            </Button>
          )}
        </div>

        <CardContent className="relative px-8 pb-8">
          {/* 头像 - 使用 shadcn Avatar */}
          <div className="relative -mt-16 mb-6 inline-block">
            {/* 外层装饰框 */}
            <div className="absolute -inset-2 rounded-full bg-gradient-to-br from-foreground/5 to-foreground/0" />
            {/* Avatar 组件 */}
            <Avatar className="relative h-28 w-28 border-[3px] border-background shadow-2xl ring-1 ring-foreground/5">
              <AvatarImage
                src={
                  displayUser.avatarInfo?.url ||
                  "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=120"
                }
                alt={displayUser.name || displayUser.account}
                className="transition-transform duration-300 hover:scale-105"
              />
              <AvatarFallback className="text-2xl">
                {(displayUser.name || displayUser.account)?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {/* 装饰元素 - 左上角 */}
            <div className="absolute -top-1 -left-1 h-3 w-3 rounded-tl-lg border-l-2 border-t-2 border-foreground/20" />
            {/* 装饰元素 - 右下角 */}
            <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-br-lg border-b-2 border-r-2 border-foreground/20" />
          </div>

          {/* 用户名和签名 */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-3">
                <h1 className="font-bold text-3xl tracking-tight text-foreground">
                  {displayUser.name || displayUser.account}
                </h1>
                {/* 性别标识 */}
                {displayUser.sex !== undefined && (
                  <Badge variant="outline" className="text-xs">
                    {displayUser.sex === 0 ? "👨 男" : displayUser.sex === 1 ? "👩 女" : ""}
                  </Badge>
                )}
              </div>
              {/* 发消息按钮 - 仅在查看其他用户时显示 */}
              {!isViewingOwnProfile && targetUserId && (
                <Button
                  onClick={handleSendMessage}
                  className="flex items-center gap-2 rounded-full"
                  size="sm"
                >
                  <MessageCircle size={16} />
                  <span>发消息</span>
                </Button>
              )}
            </div>
            <p className="max-w-md text-muted-foreground/80 text-sm leading-relaxed mb-4">
              {displayUser.signature || "记录生活中的美好时光 ✨"}
            </p>

            {/* 用户详细信息 - 标签式布局 */}
            <div className="flex flex-wrap gap-3 mb-6">
              {/* 职业信息 */}
              {displayUser.job && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/50 text-secondary-foreground text-sm hover:bg-secondary/70 transition-colors">
                  <Briefcase size={14} />
                  <span>{displayUser.job}</span>
                  {displayUser.company && (
                    <>
                      <span className="opacity-60 mx-0.5">@</span>
                      <span>{displayUser.company}</span>
                    </>
                  )}
                </div>
              )}

              {/* 位置信息 */}
              {(displayUser as any).ipInfo?.city && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/50 text-secondary-foreground text-sm hover:bg-secondary/70 transition-colors">
                  <MapPin size={14} />
                  <span>
                    {(displayUser as any).ipInfo.city}
                    {(displayUser as any).ipInfo.regionName &&
                      (displayUser as any).ipInfo.city !== (displayUser as any).ipInfo.regionName &&
                      `, ${(displayUser as any).ipInfo.regionName}`}
                  </span>
                </div>
              )}

              {/* 加入时间 */}
              {displayUser.createdAt && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/50 text-secondary-foreground text-sm hover:bg-secondary/70 transition-colors">
                  <Calendar size={14} />
                  <span>{new Date(displayUser.createdAt).toLocaleDateString("zh-CN")} 加入</span>
                </div>
              )}
            </div>

            {/* 社交链接区域 */}
            <div className="flex flex-wrap gap-4 mb-4">
              {/* Email */}
              {displayUser.email && (
                <a
                  href={`mailto:${displayUser.email}`}
                  className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/30 group-hover:bg-primary/10 transition-colors">
                    <Mail size={15} className="group-hover:text-primary transition-colors" />
                  </div>
                  <span className="hidden sm:inline">{displayUser.email}</span>
                </a>
              )}

              {/* 网站 */}
              {displayUser.website && (
                <a
                  href={`https://${displayUser.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/30 group-hover:bg-primary/10 transition-colors">
                    <Globe size={15} className="group-hover:text-primary transition-colors" />
                  </div>
                  <span className="hidden sm:inline">{displayUser.website}</span>
                </a>
              )}

              {/* GitHub */}
              {displayUser.github && (
                <a
                  href={`https://github.com/${displayUser.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/30 group-hover:bg-primary/10 transition-colors">
                    <Github size={15} className="group-hover:text-primary transition-colors" />
                  </div>
                  <span className="hidden sm:inline">{displayUser.github}</span>
                </a>
              )}
            </div>
          </div>

          {/* 统计数据 - 横向布局 */}
          <div className="flex items-center gap-8">
            {stats.map((stat, index) => (
              <div className="group/stat relative" key={index}>
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-3xl tabular-nums text-foreground transition-colors group-hover/stat:text-foreground/70">
                    {stat.value}
                  </span>
                  <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                    {stat.label}
                  </span>
                </div>
                {/* 分隔符 */}
                {index < stats.length - 1 && (
                  <Separator
                    orientation="vertical"
                    className="absolute top-1/2 -right-4 h-8 -translate-y-1/2"
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 内容切换标签 - 使用 shadcn Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 h-auto p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center justify-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Icon size={16} />
                <span className="font-medium text-sm">{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                    {tab.count}
                  </Badge>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* 主要内容区域 - 使用 TabsContent */}
        <TabsContent value="photos" className="mt-6">
          <Card className="min-h-[500px]">
            <CardContent className="p-6">
              <PhotoWall userId={targetUserId} isOwnProfile={isViewingOwnProfile} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="track" className="mt-6">
          <TrackPage userId={targetUserId} />
        </TabsContent>

        <TabsContent value="posts" className="mt-6">
          <Card className="min-h-[500px]">
            <CardContent className="p-6">
              {isLoadingTopics && posts.length === 0 ? (
                <div className="flex items-center justify-center py-20">
                  <LoadingSpinner size="lg" />
                </div>
              ) : posts.length === 0 ? (
                <LottieAnimation
                  type="empty"
                  emptyTitle="还没有发布内容"
                  emptyDescription="记录并分享你的精彩瞬间"
                  width={200}
                  height={200}
                  actionButton={
                    <Button
                      onClick={() => setIsCreateModalOpen(true)}
                      className="rounded-full bg-gradient-to-r from-pink-500 to-purple-500 px-6 py-2 font-medium text-white transition-opacity hover:opacity-90"
                    >
                      <Plus size={16} className="mr-2" />
                      发布第一篇内容
                    </Button>
                  }
                />
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="liked" className="mt-6">
          <Card className="min-h-[500px]">
            <CardContent className="p-6">
              {isLoadingLikedTopics && likedPosts.length === 0 ? (
                <div className="flex items-center justify-center py-20">
                  <LoadingSpinner size="lg" />
                </div>
              ) : likedPosts.length === 0 ? (
                <LottieAnimation
                  type="empty"
                  emptyTitle="还没有喜欢的内容"
                  emptyDescription="点赞你喜欢的内容"
                  width={200}
                  height={200}
                />
              ) : (
                <SimpleInfiniteScroll
                  hasMore={hasNextLikedPage}
                  isLoading={isFetchingNextLikedPage}
                  onLike={handleLike}
                  onLoadMore={handleLoadMore}
                  onPostClick={handlePostClick}
                  onSave={handleSave}
                  posts={likedPosts}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="saved" className="mt-6">
          <Card className="min-h-[500px]">
            <CardContent className="p-6">
              {isLoadingCollectedTopics && collectedPosts.length === 0 ? (
                <div className="flex items-center justify-center py-20">
                  <LoadingSpinner size="lg" />
                </div>
              ) : collectedPosts.length === 0 ? (
                <LottieAnimation
                  type="empty"
                  emptyTitle="还没有收藏的内容"
                  emptyDescription="收藏你感兴趣的内容"
                  width={200}
                  height={200}
                />
              ) : (
                <SimpleInfiniteScroll
                  hasMore={hasNextCollectedPage}
                  isLoading={isFetchingNextCollectedPage}
                  onLike={handleLike}
                  onLoadMore={handleLoadMore}
                  onPostClick={handlePostClick}
                  onSave={handleSave}
                  posts={collectedPosts}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 编辑对话框 */}
      {user && (
        <ProfileEditDialog onOpenChange={setIsEditDialogOpen} open={isEditDialogOpen} user={user} />
      )}

      {/* 图片详情弹窗 */}
      {selectedTopicId && (
        <SimpleImageDetail
          isOpen={!!selectedTopicId}
          onClose={() => {
            setSelectedTopicId(null);
            setCardRect(null);
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
                fetchNextPage();
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

      {/* 创建新帖子对话框 */}
      {isViewingOwnProfile && (
        <CreatePostModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={async () => {
            // 刷新帖子列表
            queryClient.invalidateQueries({ queryKey: ["topics"] });
            fetchNextPage();
          }}
        />
      )}
    </div>
  );
}
