import { useEffect, useState } from "react";
import { api, type Stats } from "../api";
import { MOOD_INFO, MOODS } from "../moods";

const TITLES = { week: "This week", month: "This month" } as const;

function StatsCard({ stats }: { stats: Stats }) {
  return (
    <div className="card stats-card">
      <h3>{TITLES[stats.range]}</h3>
      {stats.total === 0 ? (
        <p className="muted">No entries yet.</p>
      ) : (
        <>
          <p className="most-common">
            {stats.mostCommon.map((m) => MOOD_INFO[m].emoji).join(" ")}
            <span>
              {stats.mostCommon.map((m) => MOOD_INFO[m].label).join(" / ")}
              <small className="muted"> most common</small>
            </span>
          </p>
          <div className="mood-bar" aria-label="Mood distribution">
            {MOODS.filter((m) => stats.counts[m.value] > 0).map((m) => (
              <div
                key={m.value}
                style={{ flexGrow: stats.counts[m.value], background: m.color }}
                title={`${m.label}: ${stats.counts[m.value]}`}
              />
            ))}
          </div>
          <p className="muted small">
            {stats.total} {stats.total === 1 ? "entry" : "entries"}
          </p>
        </>
      )}
    </div>
  );
}

export function MoodStats({ refreshKey = 0 }: { refreshKey?: number }) {
  const [stats, setStats] = useState<Stats[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([api.getStats("week"), api.getStats("month")])
      .then((s) => !cancelled && setStats(s))
      .catch((e: Error) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  if (error) return <p className="error">{error}</p>;
  if (!stats) return null;

  return (
    <section className="stats">
      {stats.map((s) => (
        <StatsCard key={s.range} stats={s} />
      ))}
    </section>
  );
}
