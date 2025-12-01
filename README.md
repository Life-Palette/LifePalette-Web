<p align="center">
  <h1 align="center">LifePalette 拾色</h1>
</p>

<p align="center">
  <strong>Record your memories and craft your own masterpiece of life</strong>
</p>

<p align="center">
  以色彩为笔，以轨迹为墨，绘制专属于你的人生画卷
</p>

<p align="center">
  简体中文 | <a href="./README_EN.md">English</a>
</p>

<p align="center">
  <a href="https://lpalette.cn">在线预览</a> | <a href="https://lifepalette-web.netlify.app">备用地址</a>
</p>

---

## 📖 项目简介

**LifePalette（拾色）** 是一款精心设计的生活记录应用，旨在帮助用户以独特的视角记录生活中的点滴瞬间。通过图片颜色分析、地理轨迹追踪、智能 AI 辅助等创新功能，将你的记忆编织成一幅绚丽的人生画卷。

> ⚠️ **版本说明**：当前主分支已采用 **React** 重构。原 [Vue 版本分支](https://github.com/Life-Palette/LifePalette-Web/tree/vue) 不再维护更新。

## ✨ 功能特性

### 🎨 颜色画廊 (Color Palette)

- **颜色统计分析**：自动从上传的图片中提取主色调
- **颜色轮盘展示**：直观展示你的照片色彩分布
- **按色彩浏览**：通过颜色筛选查看相关照片
- **网格/列表视图**：灵活切换浏览模式
- **虚拟滚动**：流畅处理大量颜色数据

### 📝 话题动态 (Posts/Topics)

- **富文本编辑器**：支持 Markdown 和富文本格式
- **多媒体支持**：图片、视频、Live Photo 上传
- **点赞与收藏**：社交互动功能
- **评论系统**：支持多级评论回复
- **标签系统**：灵活的内容分类管理
- **置顶功能**：重要内容优先展示

### 🗺️ 地图轨迹 (Map & Track)

- **Mapbox 地图集成**：精美地图展示
- **位置选择器**：精准定位拍摄地点
- **轨迹记录**：记录你的旅行足迹
- **照片地图画廊**：在地图上浏览照片
- **地图导出**：生成精美的轨迹图片

### 💬 实时聊天 `开发中`

- **即时通讯**：Socket.io 实现实时消息
- **聊天室列表**：管理多个对话
- **消息通知**：不错过任何重要信息

### 🖼️ 媒体管理 (Media)

- **智能图片压缩**：上传前自动优化
- **图片裁剪**：头像和背景图编辑
- **Blurhash 预览**：优雅的图片加载体验
- **Live Photo 支持**：播放 Apple Live Photo
- **EXIF 信息提取**：读取照片元数据
- **图片详情面板**：查看完整图片信息

### 🤖 AI 智能助手

- **AI 写作辅助**：智能内容生成
- **AI 自动补全**：编辑器内智能建议
- **Ghost Text**：实时 AI 输入提示

### 👤 用户系统

- **用户认证**：安全的用户认证
- **QR 码登录**：便捷的扫码登录
- **个人资料**：自定义头像和背景
- **用户统计**：查看活动数据

### 🔔 通知系统 `开发中`

- **实时通知**：即时推送互动消息
- **通知管理**：清晰的通知列表

### 🔍 搜索功能

- **全局搜索**：快速查找内容
- **智能筛选**：多维度搜索过滤

### 🌙 主题切换

- **深色/浅色模式**：自由切换主题风格
- **系统主题跟随**：自动适配系统设置

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
| **地图服务** | [Mapbox GL](https://docs.mapbox.com/mapbox-gl-js/) · [@mapbox/mapbox-gl-language](https://github.com/mapbox/mapbox-gl-language)                                                                                                                                                                                                 |
| **实时通讯** | [Socket.io Client](https://socket.io/)                                                                                                                                                                                                                                                                                          |
| **媒体处理** | [browser-image-compression](https://github.com/Donaldcwl/browser-image-compression) · [react-easy-crop](https://github.com/ricardo-ch/react-easy-crop) · [blurhash](https://blurha.sh/) · [exifr](https://github.com/MikeKovarik/exifr) · [live-photo](https://www.npmjs.com/package/live-photo)                                |
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

## 📄 License

MIT License © 2024 LifePalette

---

<p align="center">
  Made with ❤️ by the LifePalette Team
</p>
