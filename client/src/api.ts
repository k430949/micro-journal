export type Mood = "great" | "good" | "okay" | "rough" | "bad";

export interface Entry {
  id: number;
  date: string;
  content: string;
  mood: Mood;
  created_at: string;
  updated_at: string;
}

export interface Stats {
  range: "week" | "month";
  from: string;
  to: string;
  total: number;
  counts: Record<Mood, number>;
  mostCommon: Mood[];
}

export const MAX_CONTENT_LENGTH = 280;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.error ?? `Request failed (${res.status})`);
  }
  return data as T;
}

export const api = {
  getToday: () => request<{ date: string; entry: Entry | null }>("/today"),
  saveToday: (content: string, mood: Mood) =>
    request<Entry>("/today", {
      method: "PUT",
      body: JSON.stringify({ content, mood }),
    }),
  getRecent: (limit: number, offset: number) =>
    request<Entry[]>(`/entries?limit=${limit}&offset=${offset}`),
  getMonth: (month: string) =>
    request<Entry[]>(`/entries?month=${encodeURIComponent(month)}`),
  getStats: (range: "week" | "month") =>
    request<Stats>(`/stats?range=${range}`),
};
