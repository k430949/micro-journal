import { useEffect, useState, type FormEvent } from "react";
import { api, MAX_CONTENT_LENGTH, type Entry, type Mood } from "../api";
import { MoodPicker } from "../components/MoodPicker";
import { MoodStats } from "../components/MoodStats";
import { formatLong } from "../dates";

export function TodayPage() {
  const [date, setDate] = useState<string | null>(null);
  const [saved, setSaved] = useState<Entry | null>(null);
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<Mood | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [statsKey, setStatsKey] = useState(0);

  useEffect(() => {
    api
      .getToday()
      .then(({ date, entry }) => {
        setDate(date);
        if (entry) {
          setSaved(entry);
          setContent(entry.content);
          setMood(entry.mood);
        }
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const length = [...content].length;
  const remaining = MAX_CONTENT_LENGTH - length;
  const dirty =
    !saved || saved.content !== content.trim() || saved.mood !== mood;
  const canSave =
    !loading &&
    !saving &&
    content.trim() !== "" &&
    remaining >= 0 &&
    mood !== null &&
    dirty;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSave || !mood) return;
    setSaving(true);
    setError(null);
    try {
      const entry = await api.saveToday(content, mood);
      setMessage(saved ? "Entry updated." : "Entry saved.");
      setSaved(entry);
      setContent(entry.content);
      setStatsKey((k) => k + 1);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="muted">Loading…</p>;

  return (
    <div className="page">
      <form className="card today-form" onSubmit={handleSubmit}>
        <h2>{date ? formatLong(date) : "Today"}</h2>

        <label htmlFor="content" className="field-label">
          How was your day?
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setMessage(null);
          }}
          placeholder="Keep it short — 280 characters max."
          rows={4}
          disabled={saving}
        />
        <div
          className={`counter${remaining < 0 ? " over" : remaining <= 20 ? " warn" : ""}`}
        >
          {remaining}
        </div>

        <span className="field-label">Mood</span>
        <MoodPicker
          value={mood}
          onChange={(m) => {
            setMood(m);
            setMessage(null);
          }}
          disabled={saving}
        />

        <div className="form-footer">
          <button type="submit" className="primary" disabled={!canSave}>
            {saving ? "Saving…" : saved ? "Update entry" : "Save entry"}
          </button>
          {message && <span className="success">{message}</span>}
          {error && <span className="error">{error}</span>}
        </div>
      </form>

      <MoodStats refreshKey={statsKey} />
    </div>
  );
}
