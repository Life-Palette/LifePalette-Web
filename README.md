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

- 智能图片压缩
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

MIT License © 2025 LifePalette

---

<p align="center">
  Made with ❤️ by the LifePalette Team
</p>
