<div align="center">

<img src="./public/logo.jpg" alt="LifePalette Logo" width="120" height="120" style="border-radius: 20px;" />

# LifePalette 拾色

**以色彩为笔，以轨迹为墨，绘制专属于你的人生画卷**

[![在线体验](https://img.shields.io/badge/在线体验-lpalette.cn-ff6b6b?style=for-the-badge)](https://lpalette.cn)
[![备用地址](https://img.shields.io/badge/备用地址-Netlify-00C7B7?style=for-the-badge)](https://lifepalette-web.netlify.app)

简体中文 | [English](./README_EN.md)

<br>

<!-- ![首页预览](https://lpalette.oss-accelerate.aliyuncs.com/prod/32/1764831234905.png?x-oss-process=image/resize,w_1600,m_lfit/format,webp) -->

</div>

## Versioned releases and deployment

The frontend uses Changesets to manage releases. Before merging an application change, run `pnpm changeset`, select `lifepalette-web`, choose `patch`, `minor`, or `major`, and commit the generated changeset file. Changesets opens or updates a `chore: release` PR against `main`; merging that PR creates a GitHub release and triggers a GHCR image build with version, `latest`, and commit-SHA tags.

To enable automatic Dokploy deployment, add the HTTPS Dokploy panel URL as the `DOKPLOY_URL` Actions variable and add `DOKPLOY_API_KEY` as an Actions secret. The image is still published when these values are absent, but deployment is skipped. In repository Settings → Actions → General, allow GitHub Actions to create and approve pull requests.

---

## 关于拾色

生活是一幅画，而你是唯一的画师。

**拾色**不只是一个记录工具，它是你的**私人色彩博物馆**、**足迹地图**和**记忆档案馆**。每一张照片都有它独特的色彩故事，每一个地点都承载着特别的回忆——拾色帮你把这些碎片编织成一幅完整的人生画卷。

> _"当你回顾自己的照片库，看到的不再只是图片，而是一场穿越时光的色彩之旅。"_

> ⚠️ **版本说明**：当前主分支已采用 **React** 重构。原 [Vue 版本](https://github.com/Life-Palette/LifePalette-Web/tree/vue) 不再维护。

---

## 功能一览

| 功能 | 亮点 |
|------|------|
| **颜色画廊** | 智能提色、色彩轮盘、按色浏览 |
| **话题动态** | 富文本编辑、多媒体融合、社交互动 |
| **地图轨迹** | 自动定位、智能聚合、海报导出 |
| **AI 助手** | 智能续写、文本润色、灵感激发 |
| **个人空间** | 个性定制、数据统计、扫码登录 |

---

## 使用场景

- **环游世界** — 照片自动标记地点，生成专属旅行足迹图
- **日常点滴** — 美食、风景、心情，配上文字就是一篇微日记
- **年度回顾** — 按颜色浏览，发现这一年的主色调
- **成长记录** — 统计数据可视化，见证自己的创作历程

---

## 功能详情

<details>
<summary><b>🎨 颜色画廊</b></summary>

- 自动从图片中提取主色调
- 颜色轮盘直观展示色彩分布
- 按色彩筛选浏览照片
- 网格/列表视图灵活切换
</details>

<details>
<summary><b>📝 话题动态</b></summary>

- 富文本 + Markdown 编辑器
- 图片、视频、Live Photo 上传
- 点赞、收藏、评论互动
- 标签分类管理
</details>

<details>
<summary><b>🗺️ 地图轨迹</b></summary>

- Mapbox 地图集成
- 照片自动定位标记
- 轨迹记录与导出
- 生成精美足迹海报
</details>

<details>
<summary><b>🤖 AI 智能助手</b></summary>

- 智能续写（停止输入 1.5 秒后自动联想）
- 文本润色与优化
- Ghost Text 实时提示
</details>

<details>
<summary><b>🖼️ 媒体管理</b></summary>

- 浏览器端媒体元数据与颜色分析
- Blurhash 优雅加载
- Live Photo 播放
- EXIF 元数据提取
</details>

<details>
<summary><b>👤 用户系统</b></summary>

- 扫码登录
- 个人资料定制
- 深色/浅色主题
- 数据统计
</details>

## 🛠️ 技术栈

<table>
  <tr>
    <td align="center" width="96">
      <img src="https://skillicons.dev/icons?i=react" width="48" height="48" alt="React" />
      <br>React
    </td>
    <td align="center" width="96">
      <img src="https://skillicons.dev/icons?i=ts" width="48" height="48" alt="TypeScript" />
      <br>TypeScript
    </td>
    <td align="center" width="96">
      <img src="https://skillicons.dev/icons?i=vite" width="48" height="48" alt="Vite" />
      <br>Vite
    </td>
    <td align="center" width="96">
      <img src="https://skillicons.dev/icons?i=tailwind" width="48" height="48" alt="TailwindCSS" />
      <br>TailwindCSS
    </td>
    <td align="center" width="96">
      <img src="https://avatars.githubusercontent.com/u/72518640?s=200&v=4" width="48" height="48" alt="TanStack" />
      <br>TanStack
    </td>
    <td align="center" width="96">
      <img src="https://avatars.githubusercontent.com/u/75042455?s=200&v=4" width="48" height="48" alt="Radix UI" />
      <br>Radix UI
    </td>
  </tr>
</table>

| 分类         | 技术                                                                                                                                                                                                                                                                                                                            |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **核心框架** | [React](https://react.dev/) · [TypeScript](https://www.typescriptlang.org/) · [Vite](https://vitejs.dev/)                                                                                                                                                                                                                       |
| **路由状态** | [@tanstack/react-router](https://tanstack.com/router) · [@tanstack/react-query](https://tanstack.com/query) · [@tanstack/react-form](https://tanstack.com/form) · [@tanstack/react-virtual](https://tanstack.com/virtual)                                                                                                       |
| **UI 样式**  | [TailwindCSS](https://tailwindcss.com/) · [Radix UI](https://www.radix-ui.com/) · [Lucide React](https://lucide.dev/) · [Framer Motion](https://www.framer.com/motion/) · [sonner](https://sonner.emilkowal.ski/)                                                                                                               |
| **富文本**   | [Plate.js](https://platejs.org/) · [Slate](https://docs.slatejs.org/)                                                                                                                                                                                                                                                           |
| **地图服务** | 独立地图应用（iframe + postMessage；Mapbox SDK 由 map 工程维护）                                                                                                                                                                                                 |
| **实时通讯** | [Socket.io Client](https://socket.io/)                                                                                                                                                                                                                                                                                          |
| **媒体处理** | [react-easy-crop](https://github.com/ricardo-ch/react-easy-crop) · [live-photo](https://www.npmjs.com/package/live-photo)                                |
| **拖拽排序** | [@dnd-kit/core](https://dndkit.com/) · [@dnd-kit/sortable](https://dndkit.com/)                                                                                                                                                                                                                                                 |
| **工具库**   | [Zod](https://zod.dev/) · [DOMPurify](https://github.com/cure53/DOMPurify) · [QRCode](https://github.com/soldair/node-qrcode) · [Lottie React](https://github.com/Gamote/lottie-react) · [react-hotkeys-hook](https://github.com/JohannesKlauss/react-hotkeys-hook) · [next-themes](https://github.com/pacocoursey/next-themes) |
| **开发工具** | [Biome](https://biomejs.dev/) · [Lefthook](https://github.com/evilmartians/lefthook) · [Terser](https://terser.org/)                                                                                                                                                                                                            |

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- pnpm >= 8

### 安装步骤

```bash
# 克隆项目
git clone https://github.com/your-username/lifepalette.git
cd lifepalette

# 安装依赖
pnpm install

# 复制环境变量配置
cp .env.example .env

# 启动开发服务器
pnpm dev
```

### 可用脚本

```bash
pnpm dev          # 启动开发服务器
pnpm build        # 构建生产版本
pnpm preview      # 预览生产构建
pnpm lint         # 代码检查
pnpm format       # 代码格式化
pnpm ui:add       # 添加 shadcn/ui 组件
```

## 📁 项目结构

```
src/
├── components/          # 组件目录
│   ├── auth/           # 认证相关组件
│   ├── chat/           # 聊天功能组件
│   ├── colors/         # 颜色画廊组件
│   ├── common/         # 通用组件
│   ├── editor/         # 富文本编辑器
│   ├── layout/         # 布局组件
│   ├── lottie/         # Lottie 动画
│   ├── map/            # 地图相关组件
│   ├── media/          # 媒体处理组件
│   ├── notification/   # 通知组件
│   ├── post/           # 话题/帖子组件
│   ├── profile/        # 个人资料组件
│   ├── search/         # 搜索组件
│   └── ui/             # UI 基础组件
├── config/             # 配置文件
├── constants/          # 常量定义
├── data/               # 模拟数据
├── hooks/              # 自定义 Hooks
├── lib/                # 工具库
├── pages/              # 页面组件
├── routes/             # 路由配置
├── services/           # API 服务
├── types/              # TypeScript 类型
└── utils/              # 工具函数
```

## 文件上传

用户端与 admin 均使用 `@life-palette/uploader` 的 `createUploader`。
依赖使用 npm 发布版本：`@life-palette/uploader@2.0.0` 与 `@life-palette/media@0.2.3`。
JPEG、PNG、WebP 压缩保留原始 EXIF 数据；动画和其他格式保留原文件。

上传前默认使用包内 `compressImage` 压缩图片（目标 1 MB，可通过 `compress: false` 关闭），
再使用 `analyzeMedia` 提取实际上传文件的 MD5、尺寸、EXIF、颜色和预览信息，处理后的文件通过
`POST /api/v1/uploads` 初始化、预签名 URL 上传、
`POST /api/v1/uploads/{id}/complete` 保存。头像和背景更新使用返回的 `uid`。
照片墙的隐私设置、手动选择的 GPS 和实况照片关联沿用当前后端契约。
旧 `/file/upload/*` 已移除，`createUploader` 仅采用当前预签名上传协议。

运行上传契约验证（模拟服务端和对象存储，不写入真实数据）：

```bash
node scripts/test-upload.mjs
```

## 📄 License

MIT License © 2025 LifePalette

---

<p align="center">
  Made with ❤️ by the LifePalette Team
</p>


## 独立地图接入

所有地图通过 `src/components/map/map-embed.tsx` 嵌入相邻的 map 工程。开发时同时运行 Web（9595）和 map（9596）。Web 不需要 Mapbox token。

- `VITE_MAP_BASE_URL`：开发默认 `http://localhost:9596`，生产默认 `https://map.lpalette.cn`。
- `VITE_API_BASE_URL`：默认 `https://api.lpalette.cn/api/v1`，本地和预发可按需覆盖。
- 用 `.env.development.local` / `.env.production.local` 覆盖环境配置；Mapbox token 和宿主白名单配置在 map 工程。
- Docker 支持 `VITE_MAP_BASE_URL` build arg，发布工作流读取同名 Actions variable；修改构建环境变量后需重新构建。
- `/map/{uid}` 保留为主站分享入口。个人足迹、海报导出、上传选址、照片信息面板和地图卡片均使用同一 iframe 协议。
- 通过宿主 API 客户端桥接文件列表和详情，不向 iframe 传递登录 token。

完整消息协议见 map 工程 README。
