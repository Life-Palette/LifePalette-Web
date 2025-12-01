<p align="center">
  <h1 align="center">LifePalette</h1>
</p>

<p align="center">
  <strong>Paint your life story with colors and traces from every captured moment</strong>
</p>

<p align="center">
  <a href="./README.md">简体中文</a> | English
</p>

<p align="center">
  <a href="https://lpalette.cn">Live Demo</a> | <a href="https://lifepalette-web.netlify.app">Mirror</a>
</p>

---

## 📖 Introduction

**LifePalette** is a beautifully designed life recording application that helps users capture everyday moments from a unique perspective. Through innovative features like image color analysis, geographic tracking, and AI assistance, it weaves your memories into a colorful tapestry of life.

> ⚠️ **Note**: The main branch has been rebuilt with **React**. The legacy [Vue version branch](https://github.com/Life-Palette/LifePalette-Web/tree/vue) is no longer maintained.

## ✨ Features

### 🎨 Color Palette

- **Color Statistics** - Automatically extract dominant colors from uploaded images
- **Color Wheel Display** - Visualize the color distribution of your photos
- **Browse by Color** - Filter and view photos by color
- **Grid/List View** - Flexible viewing modes
- **Virtual Scrolling** - Smooth handling of large datasets

### 📝 Posts & Topics

- **Rich Text Editor** - Support for Markdown and rich text formatting
- **Multimedia Support** - Upload images, videos, and Live Photos
- **Likes & Collections** - Social interaction features
- **Comment System** - Multi-level comment replies
- **Tag System** - Flexible content categorization
- **Pin Feature** - Prioritize important content

### 🗺️ Map & Track

- **Mapbox Integration** - Beautiful interactive maps
- **Location Picker** - Precise photo location tagging
- **Track Recording** - Record your travel footprints
- **Photo Map Gallery** - Browse photos on the map
- **Map Export** - Generate beautiful track images

### 💬 Real-time Chat `WIP`

- **Instant Messaging** - Real-time messages via Socket.io
- **Chat Room List** - Manage multiple conversations
- **Message Notifications** - Never miss important messages

### 🖼️ Media Management

- **Smart Image Compression** - Auto-optimize before upload
- **Image Cropping** - Avatar and background editing
- **Blurhash Preview** - Elegant image loading experience
- **Live Photo Support** - Play Apple Live Photos
- **EXIF Extraction** - Read photo metadata
- **Image Info Panel** - View complete image details

### 🤖 AI Assistant

- **AI Writing Assist** - Intelligent content generation
- **AI Auto-completion** - Smart suggestions in editor
- **Ghost Text** - Real-time AI input hints

### 👤 User System

- **User Auth** - Secure user authentication
- **QR Code Login** - Convenient scan-to-login
- **User Profile** - Custom avatar and background
- **User Statistics** - View activity data

### 🔔 Notifications `WIP`

- **Real-time Notifications** - Instant push for interactions
- **Notification Management** - Clear notification list

### 🔍 Search

- **Global Search** - Quick content discovery
- **Smart Filtering** - Multi-dimensional search filters

### 🌙 Theme Switching

- **Dark/Light Mode** - Free theme switching
- **System Theme Follow** - Auto-adapt to system settings

## 🛠️ Tech Stack

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

| Category            | Technologies                                                                                                                                                                                                                                                                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Core**            | [React](https://react.dev/) · [TypeScript](https://www.typescriptlang.org/) · [Vite](https://vitejs.dev/)                                                                                                                                                                                                                       |
| **Routing & State** | [@tanstack/react-router](https://tanstack.com/router) · [@tanstack/react-query](https://tanstack.com/query) · [@tanstack/react-form](https://tanstack.com/form) · [@tanstack/react-virtual](https://tanstack.com/virtual)                                                                                                       |
| **UI & Styling**    | [TailwindCSS](https://tailwindcss.com/) · [Radix UI](https://www.radix-ui.com/) · [Lucide React](https://lucide.dev/) · [Framer Motion](https://www.framer.com/motion/) · [sonner](https://sonner.emilkowal.ski/)                                                                                                               |
| **Rich Text**       | [Plate.js](https://platejs.org/) · [Slate](https://docs.slatejs.org/)                                                                                                                                                                                                                                                           |
| **Map**             | [Mapbox GL](https://docs.mapbox.com/mapbox-gl-js/) · [@mapbox/mapbox-gl-language](https://github.com/mapbox/mapbox-gl-language)                                                                                                                                                                                                 |
| **Real-time**       | [Socket.io Client](https://socket.io/)                                                                                                                                                                                                                                                                                          |
| **Media**           | [browser-image-compression](https://github.com/Donaldcwl/browser-image-compression) · [react-easy-crop](https://github.com/ricardo-ch/react-easy-crop) · [blurhash](https://blurha.sh/) · [exifr](https://github.com/MikeKovarik/exifr) · [live-photo](https://www.npmjs.com/package/live-photo)                                |
| **Drag & Drop**     | [@dnd-kit/core](https://dndkit.com/) · [@dnd-kit/sortable](https://dndkit.com/)                                                                                                                                                                                                                                                 |
| **Utilities**       | [Zod](https://zod.dev/) · [DOMPurify](https://github.com/cure53/DOMPurify) · [QRCode](https://github.com/soldair/node-qrcode) · [Lottie React](https://github.com/Gamote/lottie-react) · [react-hotkeys-hook](https://github.com/JohannesKlauss/react-hotkeys-hook) · [next-themes](https://github.com/pacocoursey/next-themes) |
| **Dev Tools**       | [Biome](https://biomejs.dev/) · [Lefthook](https://github.com/evilmartians/lefthook) · [Terser](https://terser.org/)                                                                                                                                                                                                            |

## 🚀 Quick Start

### Requirements

- Node.js >= 18
- pnpm >= 8

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/lifepalette.git
cd lifepalette

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Start development server
pnpm dev
```

### Available Scripts

```bash
pnpm dev          # Start dev server
pnpm build        # Build for production
pnpm preview      # Preview production build
pnpm lint         # Code linting
pnpm format       # Code formatting
pnpm ui:add       # Add shadcn/ui components
```

## 📁 Project Structure

```
src/
├── components/          # Components
│   ├── auth/           # Authentication
│   ├── chat/           # Chat features
│   ├── colors/         # Color palette
│   ├── common/         # Common components
│   ├── editor/         # Rich text editor
│   ├── layout/         # Layout components
│   ├── lottie/         # Lottie animations
│   ├── map/            # Map components
│   ├── media/          # Media processing
│   ├── notification/   # Notifications
│   ├── post/           # Posts/Topics
│   ├── profile/        # User profile
│   ├── search/         # Search
│   └── ui/             # UI primitives
├── config/             # Configuration
├── constants/          # Constants
├── data/               # Mock data
├── hooks/              # Custom hooks
├── lib/                # Utilities
├── pages/              # Page components
├── routes/             # Route config
├── services/           # API services
├── types/              # TypeScript types
└── utils/              # Utility functions
```

## 📄 License

MIT License © 2024 LifePalette

---

<p align="center">
  Made with ❤️ by the LifePalette Team
</p>
