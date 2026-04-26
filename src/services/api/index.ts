/**
 * API 模块统一导出
 *
 * 使用:
 *   import { topicsApi, filesApi, adaptPage } from "@/services/api"
 */

export type { ApiResponse, PageData } from "../http";
// HTTP 工具
export { adaptPage, http } from "../http";
// 按业务域导出
export { authApi } from "./auth";
export { changelogApi } from "./changelog";
export { chatApi } from "./chat";
export type { TopicParams } from "./content";
export { commentsApi, tagsApi, topicsApi } from "./content";
export type { FileListParams } from "./files";
export { filesApi } from "./files";
export { collectionsApi, followsApi, likesApi, notificationsApi } from "./social";
// 类型
export type { ApiFile, ApiTopic, ApiUser } from "./types";
export { usersApi } from "./users";
