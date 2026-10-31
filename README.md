# Micro Journal

A tiny daily journal: one entry per day, max 280 characters, with a mood.

- **Frontend:** React + TypeScript (Vite) — `frontend/`
- **Backend:** Node.js + Express + TypeScript — `backend/`
- **Database:** SQLite (via `better-sqlite3`), owned by the backend

## Features

- **Today** — write or edit today's entry (280 chars max) and pick a mood
- **Calendar** — monthly grid colored by mood; click a day to read its entry
- **Entries** — scrollable list of past entries with "Load more"
- **Mood stats** — most common mood this week and this month
- One entry per day; past days are read-only (enforced by the API)

Moods: 😄 great · 🙂 good · 😐 okay · 😕 rough · 😞 bad

## Requirements

- Node.js 20+ and npm (uses npm workspaces)
- Git
- VS Code with the GitHub Copilot extension
- Optional: [Playwright CLI](https://github.com/microsoft/playwright-cli) and [uv](https://docs.astral.sh/uv/) (for MCP servers / browser automation)

All of the above are preinstalled in the [dev container](#dev-container-recommended).

## Setup

```bash
npm install
npm run dev
```

`npm run dev` starts both apps concurrently:

| App      | URL                   |
| -------- | --------------------- |
| Frontend | http://localhost:5173 |
| API      | http://localhost:3001 |

The Vite dev server proxies `/api/*` to the backend, so just open http://localhost:5173.

The SQLite database is created automatically at `backend/data/journal.db` on first run.

## Dev container (recommended)

The repo includes a [dev container](.devcontainer/) with:

- Node.js 22, npm, Git, GitHub CLI (`gh`) and the `sqlite3` CLI
- Playwright CLI (`playwright-cli`) with Chromium and its system dependencies
- uv / uvx (for Python-based MCP servers)
- VS Code extensions: GitHub Copilot + Copilot Chat, ESLint, Prettier, SQLite Viewer, REST Client

Setup:

1. Install [VS Code](https://code.visualstudio.com/), the **Dev Containers** extension, and Docker (or Podman — set `"dev.containers.dockerPath": "podman"` in VS Code settings).
2. Clone the repo and open the folder in VS Code.
3. Run **Dev Containers: Reopen in Container** from the Command Palette (`F1`).
4. Wait for the first build; dependencies are installed automatically (`npm install`).
5. In the container terminal run `npm run dev` and open http://localhost:5173.
6. Verify the tooling: `node -v && git --version && gh --version && playwright-cli --version && uv --version`.
7. First time only: run `gh auth login`; for Copilot agent skills, run `playwright-cli install --skills` in the project.

Notes:

- The container uses host networking (`--network=host`), so the app ports are reachable directly on the host.
- Every `.crt` file in `.devcontainer/certs/` is added to the container's trust store (for TLS-inspecting proxies such as Zscaler). Keep at least one `.crt` file there, otherwise the image build fails.
- After changing `.devcontainer/*`, run **Dev Containers: Rebuild Container**.

## Scripts

| Command         | Description                                    |
| --------------- | ---------------------------------------------- |
| `npm run dev`   | Start backend (watch mode) and frontend (Vite) |
| `npm run build` | Type-check and build both backend and frontend |
| `npm start`     | Run the compiled backend (`backend/dist`)      |

## Configuration

Backend environment variables:

| Variable  | Default                   | Description          |
| --------- | ------------------------- | -------------------- |
| `PORT`    | `3001`                    | API port             |
| `DB_PATH` | `backend/data/journal.db` | SQLite database file |

"Today" is determined by the server's local date.

## API

| Method | Path                           | Description                                         |
| ------ | ------------------------------ | --------------------------------------------------- |
| GET    | `/api/today`                   | `{ date, entry }` for today (`entry` may be `null`) |
| PUT    | `/api/today`                   | Create/update today's entry `{ content, mood }`     |
| GET    | `/api/entries?limit=&offset=`  | Recent entries, newest first                        |
| GET    | `/api/entries?month=YYYY-MM`   | All entries in a month                              |
| GET    | `/api/stats?range=week\|month` | Mood counts and most common mood                    |

There is intentionally no endpoint to modify entries for any day other than today.

## Data model

```sql
CREATE TABLE entries (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  date       TEXT NOT NULL UNIQUE,              -- YYYY-MM-DD
  content    TEXT NOT NULL CHECK (length(content) BETWEEN 1 AND 280),
  mood       TEXT NOT NULL CHECK (mood IN ('great','good','okay','rough','bad')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

## Project structure

```
micro-journal/
├── package.json        # workspaces + dev script
├── backend/
│   └── src/
│       ├── index.ts    # Express app
│       ├── db.ts       # SQLite connection + schema
│       ├── dates.ts    # local date helpers
│       └── routes.ts   # REST API
└── frontend/
    └── src/
        ├── api.ts      # API client + types
        ├── moods.ts    # mood emoji/labels/colors
        ├── components/ # MoodPicker, MoodStats
        └── pages/      # Today, Calendar, Entries
```
