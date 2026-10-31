import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const MOODS = ["great", "good", "okay", "rough", "bad"] as const;
export type Mood = (typeof MOODS)[number];
export const MAX_CONTENT_LENGTH = 280;

export interface Entry {
  id: number;
  date: string;
  content: string;
  mood: Mood;
  created_at: string;
  updated_at: string;
}

export function isMood(value: unknown): value is Mood {
  return (
    typeof value === "string" && (MOODS as readonly string[]).includes(value)
  );
}

const here = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DB_PATH ?? path.resolve(here, "../data/journal.db");
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

export const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS entries (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    date       TEXT NOT NULL UNIQUE,
    content    TEXT NOT NULL CHECK (length(content) BETWEEN 1 AND ${MAX_CONTENT_LENGTH}),
    mood       TEXT NOT NULL CHECK (mood IN (${MOODS.map((m) => `'${m}'`).join(", ")})),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);
