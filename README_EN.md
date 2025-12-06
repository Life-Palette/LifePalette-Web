<div align="center">

<img src="./public/logo.jpg" alt="LifePalette Logo" width="120" height="120" style="border-radius: 20px;" />

# LifePalette

**Paint your life with colors, trace your journey with memories**

[![Live Demo](https://img.shields.io/badge/Live_Demo-lpalette.cn-ff6b6b?style=for-the-badge)](https://lpalette.cn)
[![Mirror](https://img.shields.io/badge/Mirror-Netlify-00C7B7?style=for-the-badge)](https://lifepalette-web.netlify.app)

[简体中文](./README.md) | English

<br>

<!-- ![Preview](https://lpalette.oss-accelerate.aliyuncs.com/prod/32/1764831234905.png?x-oss-process=image/resize,w_1600,m_lfit/format,webp) -->

</div>

---

## About LifePalette

Life is a canvas, and you are the only artist.

**LifePalette** is more than a recording tool — it's your **personal color museum**, **footprint map**, and **memory archive**. Every photo has its unique color story, every location carries special memories — LifePalette weaves these fragments into a complete tapestry of your life.

> _"When you look back at your photo library, you no longer see just images, but a colorful journey through time."_

> ⚠️ **Note**: Main branch rebuilt with **React**. Legacy [Vue version](https://github.com/Life-Palette/LifePalette-Web/tree/vue) is no longer maintained.

---

## Features at a Glance

| Feature | Highlights |
|---------|------------|
| **Color Gallery** | Smart color extraction, color wheel, browse by color |
| **Posts & Topics** | Rich text editing, multimedia support, social interactions |
| **Map & Track** | Auto-location, smart clustering, poster export |
| **AI Assistant** | Smart continuation, text polishing, inspiration |
| **Personal Space** | Customization, statistics, QR login |

---

## Use Cases

- **Travel the World** — Photos auto-tagged with locations, generate your travel footprint
- **Daily Moments** — Food, scenery, mood — add text and it's a micro-diary
- **Year in Review** — Browse by color, discover your year's dominant palette
- **Growth Journey** — Visualized statistics, witness your creative journey

---

## Feature Details

<details>
<summary><b>🎨 Color Gallery</b></summary>

- Auto-extract dominant colors from images
- Color wheel visualizes your photo palette
- Filter and browse photos by color
- Flexible grid/list view switching
</details>

<details>
<summary><b>📝 Posts & Topics</b></summary>

- Rich text + Markdown editor
- Upload images, videos, Live Photos
- Likes, saves, comments interaction
- Tag-based content organization
</details>

<details>
<summary><b>🗺️ Map & Track</b></summary>

- Mapbox integration
- Auto-tag photo locations
- Track recording and export
- Generate beautiful footprint posters
</details>

<details>
<summary><b>🤖 AI Assistant</b></summary>

- Smart continuation (auto-suggest after 1.5s pause)
- Text polishing and optimization
- Ghost Text real-time hints
</details>

<details>
<summary><b>🖼️ Media Management</b></summary>

- Smart image compression
- Blurhash elegant loading
- Live Photo playback
- EXIF metadata extraction
</details>

<details>
<summary><b>👤 User System</b></summary>

- QR code login
- Profile customization
- Dark/Light themes
- Activity statistics
</details>

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

MIT License © 2025 LifePalette

---

<p align="center">
  Made with ❤️ by the LifePalette Team
</p>
