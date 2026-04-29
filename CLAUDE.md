# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install              # Install dependencies
npm run dev               # Chat widget dev server (port 8081)
npm run build            # Build chat widget
npm run build:server     # Build the multi-tenant build API server
npm run lint             # ESLint check
```

## Architecture

### Project Overview

Two systems in this repo:

1. **Chat Widget Frontend** (`src/`) - React + TypeScript widget built with Vite
2. **Multi-Tenant Build API Server** (`server/`) - Express.js server that triggers per-tenant Vite builds

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
- Express (build API server)
- Lucide React (icons)

## Key Files

| File | Purpose |
|------|---------|
| `src/config/app-config.ts` | Central config (APP_CONFIG, API endpoints, colors, content) |
| `src/features/chat/ChatWidget.tsx` | Main widget component, exports as `<cortex-chat-widget>` web component |
| `src/services/api.ts` | ApiClient with page-based routing and auth headers |
| `src/services/chat-service.ts` | Chat operations (createChat, sendMessage, escalations) |
| `server/src/index.ts` | Express server entry point |
| `server/src/api.ts` | Build API routes |

## Server: Multi-Tenant Build API

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/builds` | Create a new build (body: `{tenant_id, config}`) |
| GET | `/builds?tenant_id=X` | List all builds for a tenant |
| GET | `/builds/:tenant_id/:build_id/status` | Get build status and output files |
| GET | `/builds/:tenant_id/:build_id/download` | Download completed build as ZIP |
| DELETE | `/builds/:tenant_id/:build_id` | Delete a specific build |
| DELETE | `/builds?tenant_id=X` | Delete all builds for a tenant |

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
PORT                     # Server port (default: 3000)
```

## Web Component

Chat widget exports as custom element `<cortex-chat-widget>` with props:
- `role`: "dev" | "user"
- `currentPage`: page identifier for FAQ routing
- `config`: partial ChatConfig override
