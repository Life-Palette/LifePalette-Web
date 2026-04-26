import type { Post, PostImage } from "@/types";
import { getUserAvatar } from "@/utils/avatar";

/** 将 Go 后端话题数据转换为前端 Post 类型 */
export function transformTopic(t: any): Post {
  const fileList = t.files || t.fileList || [];
  const images: PostImage[] = fileList.map((item: any) => {
    const f = item.file || item;
    return {
      sec_uid: f.sec_uid || f.id,
      name: f.name || "",
      type: f.type || "image/jpeg",
      url: f.url,
      width: f.width || 0,
      height: f.height || 0,
      blurhash: f.blurhash || "",
      videoSrc: f.live_photo_video?.url || null,
    };
  });

  const tags = (t.tags || t.topicTags || []).map((item: any) =>
    item.tag ? item.tag.title : item.title
  );

  const user = t.user || {};
  const avatar = getUserAvatar(user);
  const ipInfo = user.ip_info || user.ipInfo;
  const location = ipInfo
    ? `${ipInfo.city || ""}·${ipInfo.region || ipInfo.regionName || ""}`
    : undefined;

  return {
    id: t.sec_uid || String(t.id),
    title: t.title || "",
    content: t.content || "",
    contentType: t.content_type || "html",
    images,
    author: {
      id: user.sec_uid || user.id,
      name: user.username || "未知用户",
      avatar,
    },
    tags,
    likes: t.likes_count || t.likesCount || 0,
    comments: t.comments_count || t.commentsCount || 0,
    saves: t.collections_count || t.collectionsCount || 0,
    isLiked: t.is_liked || t.isLiked,
    isSaved: t.is_collected || t.isCollected,
    createdAt: t.created_at || t.createdAt,
    location,
  };
}

/** 将 Go 后端评论数据转换为前端格式 */
export function transformComment(c: any) {
  const user = c.user || {};
  return {
    id: c.sec_uid || c.id,
    content: c.content,
    createdAt: c.created_at || c.createdAt,
    parentId: c.parent_id || c.parentId || null,
    user: {
      id: user.sec_uid || user.id,
      name: user.username || "匿名",
      avatar: getUserAvatar(user),
      avatar_file: user.avatar_file || null,
      sex: user.sex,
    },
    replies: (c.replies || []).map(transformComment),
  };
}
