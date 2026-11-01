# Micro Journal Agent Instructions

## Project shape

- Read [README.md](../README.md) for setup, API details, and the data model.
- This is an npm workspaces monorepo. `frontend/` is a React 18 + TypeScript SPA built with Vite; `backend/` is an Express + TypeScript API.
- The backend owns SQLite and all persistence. Browser code must use the typed HTTP helpers in [frontend/src/api.ts](../frontend/src/api.ts), not access the database or filesystem.
- Express startup is in [backend/src/index.ts](../backend/src/index.ts), routes and request validation are in [backend/src/routes.ts](../backend/src/routes.ts), and database schema/types are in [backend/src/db.ts](../backend/src/db.ts).

## Commands

- Install dependencies from the repository root with `npm install`.
- Start both development servers with `npm run dev`; Vite serves the frontend on port 5173 and proxies `/api` to the backend on port 3001.
- Build both workspaces with `npm run build`. Build one workspace with `npm run build -w backend` or `npm run build -w frontend`.
- Run only one development server with `npm run dev -w backend` or `npm run dev -w frontend`.
- There are no configured test or lint scripts. Do not invent test commands; use the relevant build as the TypeScript check.

## Data and API rules

- The backend is authoritative for input validation. Preserve trimmed, non-empty content up to 280 characters and the five moods: `great`, `good`, `okay`, `rough`, `bad`. Frontend validation improves usability but must not replace backend validation.
- Only today's entry is writable; historical entries are read-only. Preserve the existing `/api/today`, `/api/entries`, and `/api/stats` contracts documented in the README.
- `Mood` and `Entry` types are duplicated in [backend/src/db.ts](../backend/src/db.ts) and [frontend/src/api.ts](../frontend/src/api.ts). Keep both definitions aligned when changing moods, entry fields, or response shapes.
- The backend determines today using the server's local date. Use the existing date helpers and treat `YYYY-MM-DD` values as local dates; avoid UTC parsing that can shift a journal day.
- Treat `backend/data/` and `*.db` files as local database state, not source changes. Do not add or modify generated database files when changing application code.

## Frontend conventions

- Define routes in [frontend/src/App.tsx](../frontend/src/App.tsx), route-level screens in `frontend/src/pages/`, and reusable UI in `frontend/src/components/`.
- Keep HTTP calls in [frontend/src/api.ts](../frontend/src/api.ts) and use its typed request wrapper; keep mood labels, emoji, and colors in [frontend/src/moods.ts](../frontend/src/moods.ts).
- Follow the existing React function-component, hooks, and page-local state patterns (see `frontend/src/pages/TodayPage.tsx`). `App.tsx` owns routing and navigation.
- When adding controls that need interface icons, use `lucide-react`; add it as a frontend dependency if it is not already installed.
- Keep shared styling in [frontend/src/index.css](../frontend/src/index.css), using its CSS variables and existing class conventions.
- The Vite `/api` proxy in [frontend/vite.config.ts](../frontend/vite.config.ts) is development-only. Preserve it for local development, but do not assume it is available in production.

## Verification

- After code changes, run the narrow workspace build first; run `npm run build` when both workspaces are affected.
- No test suite is configured currently. Only report tests as run if a test suite has been added and executed.
