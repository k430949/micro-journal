import { useEffect, useMemo, useState } from "react";
import { api, type Entry } from "../api";
import { formatDate, formatLong } from "../dates";
import { MOOD_INFO, MOODS } from "../moods";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function CalendarPage() {
  const now = new Date();
  const todayStr = formatDate(now);
  const [view, setView] = useState({
    year: now.getFullYear(),
    month: now.getMonth(),
  });
  const [entries, setEntries] = useState<Entry[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const monthKey = `${view.year}-${String(view.month + 1).padStart(2, "0")}`;

  useEffect(() => {
    let cancelled = false;
    setError(null);
    api
      .getMonth(monthKey)
      .then((e) => !cancelled && setEntries(e))
      .catch((e: Error) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [monthKey]);

  const byDate = useMemo(
    () => new Map(entries.map((e) => [e.date, e])),
    [entries],
  );

  const offset = (new Date(view.year, view.month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array<null>(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const isCurrentMonth =
    view.year === now.getFullYear() && view.month === now.getMonth();
  const title = new Date(view.year, view.month, 1).toLocaleDateString(
    undefined,
    {
      month: "long",
      year: "numeric",
    },
  );

  function shift(delta: number) {
    const d = new Date(view.year, view.month + delta, 1);
    setView({ year: d.getFullYear(), month: d.getMonth() });
    setSelected(null);
  }

  const selectedEntry = selected ? byDate.get(selected) : undefined;

  return (
    <div className="page">
      <div className="card">
        <div className="calendar-header">
          <button
            type="button"
            onClick={() => shift(-1)}
            aria-label="Previous month"
          >
            ‹
          </button>
          <h2>{title}</h2>
          <button
            type="button"
            onClick={() => shift(1)}
            disabled={isCurrentMonth}
            aria-label="Next month"
          >
            ›
          </button>
        </div>

        {error && <p className="error">{error}</p>}

        <div className="calendar-grid">
          {WEEKDAYS.map((d) => (
            <div key={d} className="weekday">
              {d}
            </div>
          ))}
          {cells.map((day, i) => {
            if (day === null) return <div key={`empty-${i}`} />;
            const date = `${monthKey}-${String(day).padStart(2, "0")}`;
            const entry = byDate.get(date);
            const mood = entry ? MOOD_INFO[entry.mood] : null;
            const classes = [
              "day",
              entry && "has-entry",
              date === todayStr && "today",
              date > todayStr && "future",
              date === selected && "selected",
            ]
              .filter(Boolean)
              .join(" ");
            return (
              <button
                key={date}
                type="button"
                className={classes}
                style={mood ? { background: mood.color } : undefined}
                title={mood ? `${mood.label}: ${entry!.content}` : undefined}
                onClick={() => setSelected(date)}
                disabled={!entry}
              >
                <span className="day-number">{day}</span>
                {mood && <span className="day-emoji">{mood.emoji}</span>}
              </button>
            );
          })}
        </div>

        <div className="legend">
          {MOODS.map((m) => (
            <span key={m.value}>
              <i style={{ background: m.color }} /> {m.label}
            </span>
          ))}
        </div>
      </div>

      {selectedEntry && (
        <article className="card entry">
          <header>
            <span className="entry-emoji">
              {MOOD_INFO[selectedEntry.mood].emoji}
            </span>
            <time dateTime={selectedEntry.date}>
              {formatLong(selectedEntry.date)}
            </time>
          </header>
          <p>{selectedEntry.content}</p>
        </article>
      )}
    </div>
  );
}
