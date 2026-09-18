/* biome-ignore-all lint/suspicious/noExplicitAny: this existing integration requires the current implementation */
import type { Post, PostImage } from "@/types";
import { getUserAvatar } from "@/utils/avatar";

/** 将 Go 后端话题数据转换为前端 Post 类型 */
export function transformTopic(t: any): Post {
  const fileList = t.files || t.fileList || [];
  const images: PostImage[] = fileList.map((item: any) => {
    const f = item.file || item;
    return {
      blurhash: f.blurhash || "",
      height: f.height || 0,
      name: f.name || "",
      sec_uid: f.sec_uid || f.id,
      type: f.type || "image/jpeg",
      url: f.url,
      videoSrc: f.live_photo_video?.url || null,
      width: f.width || 0,
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
    author: {
      avatar,
      id: user.sec_uid || user.id,
      name: user.username || "未知用户",
    },
    comments: t.comments_count || t.commentsCount || 0,
    content: t.content || "",
    contentType: t.content_type || "html",
    createdAt: t.created_at || t.createdAt,
    id: t.sec_uid || String(t.id),
    images,
    isLiked: t.is_liked || t.isLiked,
    isSaved: t.is_collected || t.isCollected,
    likes: t.likes_count || t.likesCount || 0,
    location,
    saves: t.collections_count || t.collectionsCount || 0,
    tags,
    title: t.title || "",
  };
}

/** 将 Go 后端评论数据转换为前端格式 */
export function transformComment(c: any) {
  const user = c.user || {};
  return {
    content: c.content,
    createdAt: c.created_at || c.createdAt,
    id: c.sec_uid || c.id,
    parentId: c.parent_id || c.parentId || null,
    replies: (c.replies || []).map(transformComment),
    user: {
      avatar: getUserAvatar(user),
      avatar_file: user.avatar_file || null,
      id: user.sec_uid || user.id,
      name: user.username || "匿名",
      sex: user.sex,
    },
  };
}
