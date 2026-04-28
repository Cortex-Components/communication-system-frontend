# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install              # Install dependencies
npm run dev              # Main app dev server (port 5173)
npm run build            # Main app production build
npm run lint             # ESLint check
npm run dashboard        # Start dashboard Express server (runs dashboard-server.js)
npm run dashboard:build  # Build dashboard app (uses --mode dashboard)
npm run dashboard:preview # Preview dashboard production build
```

## Architecture

### Dual-App Architecture
Vite serves two apps via mode flag:
- **Main app** (`npm run dev/build`): Chat widget embedded in host pages
- **Dashboard** (`npm run dashboard:build/preview`): Admin configuration panel, uses `--mode dashboard`

### Config-Driven UI
All widget configuration lives in `src/config/app-config.ts` via `APP_CONFIG` object. Colors, content, layout, roles, and API endpoints are centralized there with environment variable overrides (e.g., `VITE_COLOR_PRIMARY`, `VITE_WELCOME_TITLE`).

### Role-Based Permissions
`APP_CONFIG.chat.rolePermissions` maps roles to view names:
- `dev` → `change-requests` (developer view)
- `user` → `user-request-change` (user view)

### View State Machine
`ChatView` type defines widget navigation: `closed | welcome | follow-up | change-requests | change-request-details | user-request-change | create-change-request | chat`

### API Proxy
Vite dev proxies `/api/v1` to backend. Production falls back to `VITE_API_BASE_URL` or `http://142.93.167.9:8010/api/v1`.

## Tech Stack

- React 18.3 + TypeScript
- Vite 5.4 (build tool)
- Tailwind CSS 3.4
- TanStack React Query v5 (state/API)
- React Router 6.3
- Express (dashboard server)
- Lucide React (icons)

## Key Files

| File | Purpose |
|------|---------|
| `src/config/app-config.ts` | Central config (APP_CONFIG, API endpoints, colors, content) |
| `src/features/chat/ChatWidget.tsx` | Main widget component, exports as `<cortex-chat-widget>` web component |
| `src/dashboard/Dashboard.tsx` | Admin panel with tabs (General, Security, Builds, etc.) |
| `src/services/api.ts` | ApiClient with page-based routing and auth headers |
| `src/services/chat-service.ts` | Chat operations (createChat, sendMessage, escalations) |

## Dashboard Tabs

General, Content & UI, Assistant, AI Configuration, Knowledge (PDF upload for RAG), FAQs Management, Security & API, Builds

## Environment Variables

```bash
VITE_API_BASE_URL        # Production API base URL
VITE_APP_NAME            # App display name
VITE_COLOR_PRIMARY       # Primary brand color
VITE_COLOR_SECONDARY     # Secondary color
VITE_WELCOME_TITLE       # Chat welcome title
VITE_WELCOME_SUBTITLE    # Chat welcome subtitle
VITE_ASSISTANT_NAME      # AI assistant name
VITE_AVAILABLE_ROLES     # Comma-separated roles (e.g., "dev,user")
VITE_AVAILABLE_PAGES     # Comma-separated pages (e.g., "home,support")
VITE_DEFAULT_USER_ID     # Default user ID for chat
VITE_DEFAULT_USER_NAME   # Default user name
VITE_FOLLOW_UP_OPTIONS   # Comma-separated follow-up option texts
```

## Web Component

Chat widget exports as custom element `<cortex-chat-widget>` with props:
- `role`: "dev" | "user"
- `currentPage`: page identifier for FAQ routing
- `config`: partial ChatConfig override