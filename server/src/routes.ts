import { Router, type Response } from "express";
import {
  db,
  isMood,
  MAX_CONTENT_LENGTH,
  MOODS,
  type Entry,
  type Mood,
} from "./db.js";
import { monthRange, today, weekRange } from "./dates.js";

const getByDate = db.prepare<[string], Entry>(
  "SELECT * FROM entries WHERE date = ?",
);

const upsertEntry = db.prepare<[string, string, Mood], Entry>(`
  INSERT INTO entries (date, content, mood) VALUES (?, ?, ?)
  ON CONFLICT(date) DO UPDATE SET
    content = excluded.content,
    mood = excluded.mood,
    updated_at = datetime('now')
  RETURNING *
`);

const listRecent = db.prepare<[number, number], Entry>(
  "SELECT * FROM entries ORDER BY date DESC LIMIT ? OFFSET ?",
);

const listMonth = db.prepare<[string], Entry>(
  "SELECT * FROM entries WHERE substr(date, 1, 7) = ? ORDER BY date",
);

const moodCounts = db.prepare<[string, string], { mood: Mood; count: number }>(
  "SELECT mood, COUNT(*) AS count FROM entries WHERE date BETWEEN ? AND ? GROUP BY mood",
);

function badRequest(res: Response, error: string): void {
  res.status(400).json({ error });
}

function parseIntParam(
  value: unknown,
  fallback: number,
  min: number,
  max: number,
): number {
  const n = typeof value === "string" ? Number.parseInt(value, 10) : NaN;
  if (Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

export const router = Router();

router.get("/today", (_req, res) => {
  const date = today();
  res.json({ date, entry: getByDate.get(date) ?? null });
});

// Only today's entry is writable; past days are read-only by design.
router.put("/today", (req, res) => {
  const { content, mood } = req.body ?? {};

  if (typeof content !== "string" || content.trim() === "") {
    return badRequest(res, "Content is required.");
  }
  const text = content.trim();
  if ([...text].length > MAX_CONTENT_LENGTH) {
    return badRequest(
      res,
      `Content must be at most ${MAX_CONTENT_LENGTH} characters.`,
    );
  }
  if (!isMood(mood)) {
    return badRequest(res, `Mood must be one of: ${MOODS.join(", ")}.`);
  }

  res.json(upsertEntry.get(today(), text, mood));
});

router.get("/entries", (req, res) => {
  const { month } = req.query;

  if (month !== undefined) {
    if (typeof month !== "string" || !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
      return badRequest(res, "month must be in YYYY-MM format.");
    }
    res.json(listMonth.all(month));
    return;
  }

  const limit = parseIntParam(req.query.limit, 20, 1, 100);
  const offset = parseIntParam(req.query.offset, 0, 0, Number.MAX_SAFE_INTEGER);
  res.json(listRecent.all(limit, offset));
});

router.get("/stats", (req, res) => {
  const range = req.query.range === "month" ? "month" : "week";
  const { from, to } = range === "month" ? monthRange() : weekRange();

  const counts = Object.fromEntries(MOODS.map((m) => [m, 0])) as Record<
    Mood,
    number
  >;
  for (const row of moodCounts.all(from, to)) counts[row.mood] = row.count;

  const total = MOODS.reduce((sum, m) => sum + counts[m], 0);
  const max = Math.max(...MOODS.map((m) => counts[m]));
  const mostCommon = max > 0 ? MOODS.filter((m) => counts[m] === max) : [];

  res.json({ range, from, to, total, counts, mostCommon });
});
