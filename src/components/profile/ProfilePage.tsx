import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  Bookmark,
  Briefcase,
  Calendar,
  Camera,
  Fingerprint,
  Globe,
  Grid,
  Heart,
  Image,
  Mail,
  Map,
  MapPin,
  Mars,
  // MessageCircle, // 暂时屏蔽
  Plus,
  Settings,
  Venus,
} from "lucide-react";
import { useCallback, useState } from "react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import SimpleInfiniteScroll from "@/components/common/SimpleInfiniteScroll";
import { GithubIcon as Github } from "@/components/icons/GithubIcon";
import { LottieAnimation } from "@/components/lottie";
import TrackPage from "@/components/map/TrackPage";
import SimpleImageDetail from "@/components/media/SimpleImageDetail";
import CreatePostModal from "@/components/post/CreatePostModal";
import PhotoWall from "@/components/profile/PhotoWall";
import ProfileEditDialog from "@/components/profile/ProfileEditDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsAuthenticated, useUserById, useUserStats } from "@/hooks/useAuth";
import { useCollectTopic, useLikeTopic } from "@/hooks/useInteractions";
import {
  useInfiniteCollectedTopics,
  useInfiniteLikedTopics,
  useInfiniteTopics,
} from "@/hooks/useTopics";
import { topicsApi } from "@/services/api";
import { getUserAvatar } from "@/utils/avatar";

type TabType = "posts" | "photos" | "track" | "liked" | "saved";

interface ProfilePageProps {
  initialTab?: TabType;
  userId?: string;
}

type EditableTopicTag =
  | {
      title: string;
    }
  | {
      tag: {
        title: string;
      };
    };

export default function ProfilePage({ userId: propUserId, initialTab }: ProfilePageProps = {}) {
  const { user: currentUser, isLoading: isAuthLoading } = useIsAuthenticated();
  const navigate = useNavigate();

  // 如果传入了 userId，则查看其他用户的个人中心；否则查看当前用户的
  const targetUserId = propUserId || currentUser?.id;
  const isViewingOwnProfile = !propUserId || propUserId === currentUser?.id;
  const user = currentUser; // 保持原有的 user 变量用于权限判断
  const isLoading = isAuthLoading;
  const [activeTab, setActiveTab] = useState<TabType>(initialTab || "posts");

  // 切换 Tab 时更新 URL
  const handleTabChange = (value: string) => {
    const tab = value as TabType;
    setActiveTab(tab);
    // 更新 URL，保留其他参数
    navigate({
      to: "/profile",
      search: { userId: propUserId, tab: tab === "posts" ? undefined : tab },
      replace: true,
    });
  };
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [cardRect, setCardRect] = useState<DOMRect | null>(null);
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [editingTopicData, setEditingTopicData] = useState<{
    title: string;
    content: string;
    images?: any[];
    topicTags?: EditableTopicTag[];
  } | null>(null);
  const queryClient = useQueryClient();

  // 发送消息处理函数 - 暂时屏蔽
  // const handleSendMessage = useCallback(async () => {
  //   if (!targetUserId || isViewingOwnProfile) return;
  //
  //   try {
  //     // 创建或获取私聊房间
  //     await apiService.createPrivateChat(targetUserId);
  //     // 跳转到聊天页面
  //     navigate({ to: "/chat" as any });
  //   } catch (error) {
  //     console.error("创建聊天失败:", error);
  //   }
  // }, [targetUserId, isViewingOwnProfile, navigate]);

  // 获取用户动态数据
  const {
    data: topicsData,
    isLoading: isLoadingTopics,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteTopics({
    userSecUid: targetUserId,
    size: 20,
    sort: "created_at,desc",
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
      if (!post) {
        return;
      }

      likeMutation.mutate({
        topicId: postId,
        isLiked: post.isLiked,
      });
    },
    [posts, likedPosts, collectedPosts, likeMutation]
  );

  const handleSave = useCallback(
    (postId: string) => {
      const allPosts = [...posts, ...likedPosts, ...collectedPosts];
      const post = allPosts.find((p) => p.id === postId);
      if (!post) {
        return;
      }

      collectMutation.mutate({
        topicId: postId,
        isCollected: post.isSaved,
      });
    },
    [posts, likedPosts, collectedPosts, collectMutation]
  );

  const handlePostClick = useCallback((postId: string, event?: React.MouseEvent) => {
    // 获取点击的卡片元素位置
    const target = event?.currentTarget as HTMLElement;
    if (target) {
      const rect = target.getBoundingClientRect();
      setCardRect(rect);
    }
    setSelectedTopicId(postId);
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
    } else if (activeTab === "saved" && hasNextCollectedPage && !isFetchingNextCollectedPage) {
      fetchNextCollectedPage();
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
    { label: "动态", value: userStats?.topic_count?.toString() || "0" },
    {
      label: "关注",
      value: userStats?.following_count?.toString() || "0",
    },
    {
      label: "粉丝",
      value: userStats?.follower_count?.toString() || "0",
    },
  ];

  const tabs = [
    {
      id: "posts",
      icon: Grid,
      label: "动态",
      count: userStats?.topic_count,
    },
    { id: "photos", icon: Image, label: "照片墙", count: userStats?.photo_count },
    { id: "track", icon: Map, label: "轨迹", count: userStats?.track_count },
    {
      id: "liked",
      icon: Heart,
      label: "喜欢",
      count: userStats?.like_count,
    },
    {
      id: "saved",
      icon: Bookmark,
      label: "收藏",
      count: userStats?.collection_count,
    },
  ];

  return (
    <div className="space-y-6">
      {/* 个人信息区域 - 使用 shadcn Card */}
      <Card className="group relative overflow-hidden border-border/50 transition-all hover:border-border">
        {/* 背景图片区域 - 带视差效果 */}
        <div className="relative h-52 w-full overflow-hidden rounded-t-xl">
          {displayUser.background_file?.url ? (
            <>
              <img
                alt="Background"
                className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                height={280}
                src={displayUser.background_file.url}
                width={1200}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/0 via-background/0 to-background" />
            </>
          ) : (
            <div
              className={`relative h-full w-full overflow-hidden bg-gradient-to-br from-muted via-muted/80 to-muted/60 ${isViewingOwnProfile ? "cursor-pointer transition-colors hover:bg-muted/90" : ""}`}
              onClick={isViewingOwnProfile ? () => setIsEditDialogOpen(true) : undefined}
            >
              {/* 几何装饰元素 */}
              <div className="absolute inset-0 opacity-[0.03]">
                <div className="absolute top-0 left-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border-[40px] border-foreground" />
                <div className="absolute top-1/2 right-0 h-48 w-48 translate-x-1/2 -translate-y-1/2 rounded-full border-[30px] border-foreground" />
              </div>
              {/* 仅在查看自己的个人中心时显示添加背景提示 */}
              {isViewingOwnProfile && (
                <div className="flex h-full w-full items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-muted-foreground/30 border-dashed">
                      <Camera className="text-muted-foreground/50" size={28} />
                    </div>
                    <p className="font-medium text-muted-foreground/60 text-sm">添加背景图片</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 编辑按钮 - 浮动设计（仅在查看自己的个人中心时显示） */}
          {isViewingOwnProfile && (
            <Button
              aria-label="编辑个人资料"
              className="absolute top-5 right-5 h-10 w-10 rounded-xl border-border/50 bg-background/60 backdrop-blur-xl transition-all hover:border-border hover:bg-background/80 hover:shadow-lg"
              onClick={() => setIsEditDialogOpen(true)}
              size="icon"
              variant="outline"
            >
              <Settings className="text-foreground" size={16} />
            </Button>
          )}
        </div>

        <CardContent className="relative px-8 pb-8">
          {/* 头像 - 使用 shadcn Avatar */}
          <div
            className={`relative -mt-16 mb-6 inline-block ${isViewingOwnProfile ? "cursor-pointer" : ""}`}
            onClick={isViewingOwnProfile ? () => setIsEditDialogOpen(true) : undefined}
          >
            {/* 外层装饰框 */}
            <div className="absolute -inset-2 rounded-full bg-gradient-to-br from-foreground/5 to-foreground/0" />
            {/* Avatar 组件 */}
            <Avatar
              className={`relative h-28 w-28 border-[3px] border-background shadow-2xl ring-1 ring-foreground/5 ${isViewingOwnProfile ? "transition-all duration-300 hover:shadow-primary/20 hover:ring-primary/50" : ""}`}
            >
              <AvatarImage
                alt={displayUser.username}
                className="transition-transform duration-300 hover:scale-105"
                src={getUserAvatar(displayUser)}
              />
              <AvatarFallback className="text-2xl">
                {displayUser.username?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {/* 装饰元素 - 左上角 */}
            <div className="absolute -top-1 -left-1 h-3 w-3 rounded-tl-lg border-foreground/20 border-t-2 border-l-2" />
            {/* 装饰元素 - 右下角 */}
            <div className="absolute -right-1 -bottom-1 h-3 w-3 rounded-br-lg border-foreground/20 border-r-2 border-b-2" />
          </div>

          {/* 用户名和签名 */}
          <div className="mb-8">
            <div className="mb-3 flex items-center gap-4">
              <div className="flex items-center gap-3">
                <h1 className="font-bold text-3xl text-foreground tracking-tight">
                  {displayUser.username}
                </h1>
                {/* 性别标识 */}
                {displayUser.sex !== undefined && displayUser.sex !== 0 && (
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full ${displayUser.sex === 1 ? "bg-blue-100 text-blue-500" : "bg-pink-100 text-pink-500"}`}
                  >
                    {displayUser.sex === 1 ? <Mars size={14} /> : <Venus size={14} />}
                  </div>
                )}
              </div>
            </div>
            {/* LP号 */}
            {displayUser.lp_id && (
              <div className="mb-2 inline-flex items-center gap-1.5 text-muted-foreground/50 text-xs">
                <Fingerprint size={12} />
                <span className="font-mono">{displayUser.lp_id}</span>
              </div>
            )}
            <p className="mb-4 max-w-md text-muted-foreground/80 text-sm leading-relaxed">
              {displayUser.signature || "记录生活中的美好时光 ✨"}
            </p>

            {/* 用户详细信息 - 标签式布局 */}
            <div className="mb-6 flex flex-wrap gap-3">
              {/* 职业信息 */}
              {displayUser.job && (
                <div className="inline-flex items-center gap-1.5 rounded-lg bg-secondary/50 px-3 py-1.5 text-secondary-foreground text-sm transition-colors hover:bg-secondary/70">
                  <Briefcase size={14} />
                  <span>{displayUser.job}</span>
                  {displayUser.company && (
                    <>
                      <span className="mx-0.5 opacity-60">@</span>
                      <span>{displayUser.company}</span>
                    </>
                  )}
                </div>
              )}

              {/* 位置信息 */}
              {(displayUser as any).ipInfo?.city && (
                <div className="inline-flex items-center gap-1.5 rounded-lg bg-secondary/50 px-3 py-1.5 text-secondary-foreground text-sm transition-colors hover:bg-secondary/70">
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
                <div className="inline-flex items-center gap-1.5 rounded-lg bg-secondary/50 px-3 py-1.5 text-secondary-foreground text-sm transition-colors hover:bg-secondary/70">
                  <Calendar size={14} />
                  <span>{new Date(displayUser.createdAt).toLocaleDateString("zh-CN")} 加入</span>
                </div>
              )}
            </div>

            {/* 社交链接区域 */}
            <div className="mb-4 flex flex-wrap gap-4">
              {/* Email */}
              {displayUser.email && (
                <a
                  className="group flex items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-primary"
                  href={`mailto:${displayUser.email}`}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/30 transition-colors group-hover:bg-primary/10">
                    <Mail className="transition-colors group-hover:text-primary" size={15} />
                  </div>
                  <span className="hidden sm:inline">{displayUser.email}</span>
                </a>
              )}

              {/* 网站 */}
              {displayUser.website && (
                <a
                  className="group flex items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-primary"
                  href={
                    displayUser.website.startsWith("http")
                      ? displayUser.website
                      : `https://${displayUser.website}`
                  }
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/30 transition-colors group-hover:bg-primary/10">
                    <Globe className="transition-colors group-hover:text-primary" size={15} />
                  </div>
                  <span className="hidden sm:inline">
                    {displayUser.website.replace(/^https?:\/\//, "")}
                  </span>
                </a>
              )}

              {/* GitHub */}
              {displayUser.github && (
                <a
                  className="group flex items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-primary"
                  href={`https://github.com/${displayUser.github}`}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/30 transition-colors group-hover:bg-primary/10">
                    <Github className="transition-colors group-hover:text-primary" size={15} />
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
                  <span className="font-bold text-3xl text-foreground tabular-nums transition-colors group-hover/stat:text-foreground/70">
                    {stat.value}
                  </span>
                  <span className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
                    {stat.label}
                  </span>
                </div>
                {/* 分隔符 */}
                {index < stats.length - 1 && (
                  <Separator
                    className="absolute top-1/2 -right-4 h-8 -translate-y-1/2"
                    orientation="vertical"
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 内容切换标签 - 使用 shadcn Tabs */}
      <Tabs className="w-full" onValueChange={handleTabChange} value={activeTab}>
        <TabsList className="!h-12 grid w-full grid-cols-5 p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                className="flex items-center justify-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                key={tab.id}
                value={tab.id}
              >
                <Icon size={16} />
                <span className="font-medium text-sm">{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <Badge
                    className="ml-1 h-5 px-1.5 text-xs data-[state=active]:bg-primary-foreground/20 data-[state=active]:text-primary-foreground"
                    variant="secondary"
                  >
                    {tab.count}
                  </Badge>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* 主要内容区域 - 使用 TabsContent */}
        <TabsContent className="mt-6" value="photos">
          <Card className="min-h-[500px]">
            <CardContent className="p-6">
              <PhotoWall isOwnProfile={isViewingOwnProfile} userId={targetUserId} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="mt-6" value="track">
          <TrackPage isOwnProfile={isViewingOwnProfile} userId={targetUserId} />
        </TabsContent>

        <TabsContent className="mt-6" value="posts">
          <Card className="min-h-[500px]">
            <CardContent className="p-6">
              {isLoadingTopics && posts.length === 0 ? (
                <div className="flex items-center justify-center py-20">
                  <LoadingSpinner size="lg" />
                </div>
              ) : posts.length === 0 ? (
                <LottieAnimation
                  actionButton={
                    isViewingOwnProfile ? (
                      <Button className="gap-2" onClick={() => navigate({ to: "/publish" })}>
                        <Plus size={16} />
                        发布第一篇内容
                      </Button>
                    ) : undefined
                  }
                  emptyDescription={isViewingOwnProfile ? "记录并分享你的精彩瞬间" : ""}
                  emptyTitle={isViewingOwnProfile ? "还没有发布内容" : "TA还没有发布内容"}
                  height={200}
                  type="empty"
                  width={200}
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

        <TabsContent className="mt-6" value="liked">
          <Card className="min-h-[500px]">
            <CardContent className="p-6">
              {isLoadingLikedTopics && likedPosts.length === 0 ? (
                <div className="flex items-center justify-center py-20">
                  <LoadingSpinner size="lg" />
                </div>
              ) : likedPosts.length === 0 ? (
                <LottieAnimation
                  emptyDescription={isViewingOwnProfile ? "点赞你喜欢的内容" : ""}
                  emptyTitle={isViewingOwnProfile ? "还没有喜欢的内容" : "TA还没有喜欢的内容"}
                  height={200}
                  type="empty"
                  width={200}
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

        <TabsContent className="mt-6" value="saved">
          <Card className="min-h-[500px]">
            <CardContent className="p-6">
              {isLoadingCollectedTopics && collectedPosts.length === 0 ? (
                <div className="flex items-center justify-center py-20">
                  <LoadingSpinner size="lg" />
                </div>
              ) : collectedPosts.length === 0 ? (
                <LottieAnimation
                  emptyDescription={isViewingOwnProfile ? "收藏你感兴趣的内容" : ""}
                  emptyTitle={isViewingOwnProfile ? "还没有收藏的内容" : "TA还没有收藏的内容"}
                  height={200}
                  type="empty"
                  width={200}
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
              const secUid = String(topicId);
              const response = await topicsApi.getBySecUid(secUid);
              if (response.result) {
                const topic = response.result;

                // 提取图片列表（从 files 字段）
                const images = topic.files || topic.fileList || [];

                setEditingTopicId(secUid);
                setEditingTopicData({
                  title: topic.title || "",
                  content: topic.content || "",
                  images,
                  topicTags: topic.tags || topic.topicTags || [], // 添加标签数据
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
                file_sec_uids: editingTopicData.images?.map((img) => img.sec_uid) || [],
                tags:
                  editingTopicData.topicTags?.map((tag) =>
                    "tag" in tag ? tag.tag.title : tag.title
                  ) || [],
              };

              // 对比变化
              const changes = compareObjects(originalData, postData);

              // 如果没有变化，直接关闭
              if (Object.keys(changes).length === 0) {
                console.log("没有变化，无需更新");
                return;
              }

              console.log("🔄-----变更字段-----", changes);

              const response = await topicsApi.update(editingTopicId, changes);

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

      {/* 创建新帖子 - 已改为独立页面 /publish */}
    </div>
  );
}
