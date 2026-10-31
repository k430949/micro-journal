import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, type Entry } from "../api";
import { formatDate, formatLong } from "../dates";
import { MOOD_INFO } from "../moods";

const PAGE_SIZE = 20;

export function EntriesPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const todayStr = formatDate(new Date());

  const loadMore = useCallback(async (offset: number) => {
    setLoading(true);
    setError(null);
    try {
      const page = await api.getRecent(PAGE_SIZE, offset);
      setEntries((prev) => (offset === 0 ? page : [...prev, ...page]));
      setHasMore(page.length === PAGE_SIZE);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMore(0);
  }, [loadMore]);

  return (
    <div className="page">
      {error && <p className="error">{error}</p>}
      {!loading && !error && entries.length === 0 && (
        <div className="card empty">
          <p>No entries yet.</p>
          <Link to="/">Write today's entry →</Link>
        </div>
      )}

      <ul className="entry-list">
        {entries.map((entry) => {
          const mood = MOOD_INFO[entry.mood];
          return (
            <li key={entry.id}>
              <article
                className="card entry"
                style={{ borderLeftColor: mood.color }}
              >
                <header>
                  <span className="entry-emoji" title={mood.label}>
                    {mood.emoji}
                  </span>
                  <time dateTime={entry.date}>{formatLong(entry.date)}</time>
                  {entry.date === todayStr && (
                    <Link to="/" className="edit-link">
                      Edit
                    </Link>
                  )}
                </header>
                <p>{entry.content}</p>
              </article>
            </li>
          );
        })}
      </ul>

      {hasMore && entries.length > 0 && (
        <button
          type="button"
          className="load-more"
          onClick={() => loadMore(entries.length)}
          disabled={loading}
        >
          {loading ? "Loading…" : "Load more"}
        </button>
      )}
    </div>
  );
}
