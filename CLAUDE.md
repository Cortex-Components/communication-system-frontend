# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a monorepo with two distinct systems:

1. **Chat Widget Frontend** (`src/`) - React + TypeScript app with Vite
2. **Multi-Tenant Build API Server** (`server/`) - Express.js server that triggers per-tenant Vite builds

## Server: Multi-Tenant Build API

A Node.js/Express API that manages isolated Vite builds for multiple tenants. Each tenant gets their own build directory with config and compiled output.

### Commands

```bash
# Development
npm run dashboard:server   # Start server on port 3001

# Production (Docker)
docker-compose up -d       # Start dashboard-api container
docker-compose down        # Stop containers
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/builds` | Create a new build (body: `{tenant_id, config}`) |
| GET | `/builds?tenant_id=X` | List all builds for a tenant |
| GET | `/builds/:tenant_id/:build_id/status` | Get build status and output files |
| GET | `/builds/:tenant_id/:build_id/download` | Download completed build as ZIP |
| DELETE | `/builds/:tenant_id/:build_id` | Delete a specific build |
| DELETE | `/builds?tenant_id=X` | Delete all builds for a tenant |

### Architecture

```
server/
├── index.js          # Express app setup, CORS, JSON body limit (50mb)
├── routes/
│   └── builds.js     # All /builds/* endpoints (create, list, status, download, delete)
└── utils/
    ├── builder.js    # spawnBuild() - spawns npm run build in project root
    └── storage.js    # getBuildDir, writeEnvFile, writeStatus, listBuilds, readStatus
```

### Build Flow

1. `POST /builds` creates a UUID build ID and directory at `builds/:tenant_id/:build_id/`
2. Writes `.env` file with tenant config
3. `spawnBuild()` runs `npm run build` from project root into `.dist-temp/:build_id/`
4. On success, copies `.dist-temp/:build_id/` to `builds/:tenant_id/:build_id/dist`
5. Status stored in `builds/:tenant_id/:build_id/status.json`

### Build Output Files

The build produces two widget bundles (configured in `storage.js`):
- `cortex-chat-widget.es.js` - ES module format
- `cortex-chat-widget.umd.js` - UMD format for script tag embedding

### Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3001 | Server port |
| `BUILDS_DIR` | `../builds` | Where tenant build directories are stored |

### Docker

The server runs in a container with a named volume `builds` mounted at `/app/builds`. The container runs `node server/index.js` and exposes port 3001.
