/** Go 后端用户响应 */
export interface ApiUser {
  avatar_file?: {
    sec_uid: string;
    url: string;
    blurhash?: string;
    width?: number;
    height?: number;
  } | null;
  background_file?: {
    sec_uid: string;
    url: string;
    blurhash?: string;
    width?: number;
    height?: number;
  } | null;
  birthday?: string | null;
  city?: string;
  company?: string;
  created_at: string;
  email?: string;
  freezed?: boolean;
  github?: string;
  job?: string;
  lp_id?: string;
  mobile?: string;
  open_id?: string;
  roles?: string[] | Array<{ id: number; name: string }>;
  sec_uid: string;
  sex?: number;
  signature?: string;
  updated_at: string;
  username?: string;
  website?: string;
}

/** Go 后端话题响应 */
export interface ApiTopic {
  collections_count?: number;
  comments_count?: number;
  content?: string;
  created_at: string;
  files?: ApiFile[];
  is_collected?: boolean;
  is_liked?: boolean;
  is_pinned: boolean;
  likes_count?: number;
  sec_uid: string;
  tags?: Array<{ id: number; title: string }>;
  title?: string;
  updated_at: string;
  user?: ApiUser;
}

/** Go 后端文件响应 */
export interface ApiFile {
  address?: string;
  blurhash?: string;
  created_at: string;
  height?: number;
  is_private?: boolean;
  lat?: number;
  live_photo_video?: ApiFile | null;
  lng?: number;
  name: string;
  sec_uid: string;
  size?: number;
  taken_at?: string;
  type: string;
  updated_at: string;
  url: string;
  width?: number;
}
