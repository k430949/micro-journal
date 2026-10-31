# Micro Journal

A tiny daily journal: one entry per day, max 280 characters, with a mood.

- **Frontend:** React + TypeScript (Vite) — `client/`
- **Backend:** Node.js + Express + TypeScript — `server/`
- **Database:** SQLite (via `better-sqlite3`), owned by the backend

## Features

- **Today** — write or edit today's entry (280 chars max) and pick a mood
- **Calendar** — monthly grid colored by mood; click a day to read its entry
- **Entries** — scrollable list of past entries with "Load more"
- **Mood stats** — most common mood this week and this month
- One entry per day; past days are read-only (enforced by the API)

Moods: 😄 great · 🙂 good · 😐 okay · 😕 rough · 😞 bad

## Requirements

- Node.js 18+ (20 or 22 recommended)
- npm 8+ (uses npm workspaces)

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

The SQLite database is created automatically at `server/data/journal.db` on first run.

## Scripts

| Command         | Description                                    |
| --------------- | ---------------------------------------------- |
| `npm run dev`   | Start backend (watch mode) and frontend (Vite) |
| `npm run build` | Type-check and build both server and client    |
| `npm start`     | Run the compiled backend (`server/dist`)       |

## Configuration

Backend environment variables:

| Variable  | Default                  | Description          |
| --------- | ------------------------ | -------------------- |
| `PORT`    | `3001`                   | API port             |
| `DB_PATH` | `server/data/journal.db` | SQLite database file |

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
├── server/
│   └── src/
│       ├── index.ts    # Express app
│       ├── db.ts       # SQLite connection + schema
│       ├── dates.ts    # local date helpers
│       └── routes.ts   # REST API
└── client/
    └── src/
        ├── api.ts      # API client + types
        ├── moods.ts    # mood emoji/labels/colors
        ├── components/ # MoodPicker, MoodStats
        └── pages/      # Today, Calendar, Entries
```
