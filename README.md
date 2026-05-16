# CreatorFlow AI — Frontend

Real-time React dashboard for the CreatorFlow AI content generation engine. Provides a live UI for generating complete YouTube content packages (topics, scripts, SEO, community posts, thumbnail prompts) and managing channel brand profiles.

> **Prerequisite:** The [backend service](https://github.com/Nirikshan95/CreatorFlow-AI--Backend) must be running locally on port `8000` before starting the frontend.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Running in Development](#running-in-development)
- [Building for Production](#building-for-production)
- [Pages & Features](#pages--features)
- [Routing](#routing)
- [API Proxy](#api-proxy)

---

## Overview

The frontend is a standalone **Vite + React** single-page application (SPA). It communicates with the backend exclusively over HTTP and **Server-Sent Events (SSE)**. The Vite dev server proxies all `/api` requests to the backend, so no manual CORS configuration is needed during development.

Live generation progress is streamed directly into the UI — each agent step (topic selection, script writing, SEO, etc.) is reflected in real time as it completes on the backend.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Build Tool | Vite 8 |
| Routing | React Router DOM v7 |
| Styling | Vanilla CSS (custom design system) |
| HTTP / Streaming | Fetch API + EventSource (SSE) |
| Linting | ESLint 9 |

---

## Project Structure

```
CreatorFlow-AI--Frontend/
├── src/
│   ├── main.jsx                  # React entry point, mounts <App />
│   ├── App.jsx                   # Root layout (Navbar + Sidebar) + route definitions
│   ├── api/                      # API utility functions (fetch wrappers for backend)
│   ├── components/
│   │   ├── Navbar.jsx            # Top navigation bar
│   │   ├── Sidebar.jsx           # Left navigation sidebar
│   │   ├── GeneratePanel.jsx     # Generation form + live SSE progress log
│   │   ├── ContentDetail.jsx     # Full content viewer (script, SEO, community post…)
│   │   ├── ContentCard.jsx       # Summary card used in the history list
│   │   └── ScoreBar.jsx          # Visual novelty / virality score indicator
│   ├── pages/
│   │   ├── Dashboard.jsx         # Home — overview & quick-access links
│   │   ├── Generate.jsx          # Content generation page
│   │   ├── History.jsx           # Past generation runs list
│   │   ├── ContentDetailPage.jsx # Route wrapper that loads a single content record
│   │   └── ChannelProfiles.jsx   # Channel profile manager (create, edit, delete)
│   ├── styles/
│   │   ├── index.css             # Global design tokens & utilities
│   │   └── components.css        # Component-level styles
│   └── assets/                   # Static assets (icons, images)
├── public/                       # Files served as-is (favicon, etc.)
├── index.html                    # HTML shell
├── vite.config.js                # Vite config + API proxy to backend
├── package.json
├── eslint.config.js
└── .gitignore
```

---

## Prerequisites

- **Node.js 18+** — [Download](https://nodejs.org/)
- **npm** (bundled with Node.js)
- The **backend** running at `http://localhost:8000` — see the [backend README](https://github.com/Nirikshan95/CreatorFlow-AI--Backend)

---

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/Nirikshan95/CreatorFlow-AI--Frontend.git
cd CreatorFlow-AI--Frontend
```

### 2. Install dependencies

```bash
npm install
```

No `.env` files are required — the backend URL is handled transparently by the Vite proxy (see [API Proxy](#api-proxy)).

---

## Running in Development

Start the backend first, then run:

```bash
npm run dev
```

The dev server starts at **`http://localhost:5173`** with Hot Module Replacement (HMR) enabled.

> **Note:** If the backend is not running on port `8000`, all API calls will return connection errors.

---

## Building for Production

```bash
npm run build
```

The optimised output is placed in the `dist/` directory. Serve it with any static host or preview locally:

```bash
npm run preview
```

---

## Pages & Features

### Dashboard `/`
Home screen with an at-a-glance overview. Displays recent generation activity and quick-access links to generation and history.

---

### Generate `/generate`
The core page. Configure your generation run:

| Option | Description |
|--------|-------------|
| **Category** | Content niche (e.g. `confidence`, `communication`) |
| **Number of topics** | How many candidate topics the AI should produce |
| **Script style** | `descriptive` (educational) or `storytelling` (narrative) |
| **Channel profile** | Optional brand profile to inject into prompts |

Hit **Generate** and a live SSE log streams each agent step as it completes. When the full pipeline finishes, the complete content package is displayed inline — ready to copy.

---

### History `/history`
Scrollable list of all past generation runs, ordered newest first. Each card shows:
- Topic title
- Content category
- Novelty & virality scores (via `ScoreBar`)
- Creation timestamp

Click any card to open the full detail view.

---

### Content Detail `/content/:id`
Full breakdown of a single generated content package:

- Chosen topic & extracted keywords
- Full video script (with hook, body, and CTA sections)
- SEO title, description & tags
- Community post text
- Thumbnail image generation prompt
- Marketing & promotion strategy
- Critic quality assessment
- Novelty & virality score bars

---

### Channel Profiles `/channel-profiles`
Create and manage named channel brand profiles. Each profile stores:

- Channel name & link
- Script intro line
- Description footer
- Brand notes
- Default hashtags
- Social & useful links
- Reusable items (e.g. pinned comment templates)

Select a profile on the Generate page to inject this context into every prompt for that generation run.

---

## Routing

Routes are defined in `App.jsx` using React Router DOM:

| Path | Page component | Description |
|------|----------------|-------------|
| `/` | `Dashboard` | Home / overview |
| `/generate` | `Generate` | Content generation |
| `/history` | `History` | Past generation history |
| `/content/:id` | `ContentDetailPage` | Single content detail view |
| `/channel-profiles` | `ChannelProfiles` | Channel profile manager |

---

## API Proxy

The Vite dev server is configured in `vite.config.js` to forward all `/api` requests to the backend:

```js
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
    },
  },
},
```

Every `fetch('/api/v1/...')` call in the frontend automatically hits the backend with no manual URL switching required during local development.

For a **production deployment**, configure your reverse proxy (Nginx, Caddy, etc.) to forward `/api` traffic to the backend service, and serve the `dist/` folder as the static root.
