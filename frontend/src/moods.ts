import type { Mood } from "./api";

export interface MoodInfo {
  value: Mood;
  emoji: string;
  label: string;
  color: string;
}

export const MOODS: MoodInfo[] = [
  { value: "great", emoji: "😄", label: "Great", color: "#22c55e" },
  { value: "good", emoji: "🙂", label: "Good", color: "#84cc16" },
  { value: "okay", emoji: "😐", label: "Okay", color: "#eab308" },
  { value: "rough", emoji: "😕", label: "Rough", color: "#f97316" },
  { value: "bad", emoji: "😞", label: "Bad", color: "#ef4444" },
];

export const MOOD_INFO = Object.fromEntries(
  MOODS.map((m) => [m.value, m]),
) as Record<Mood, MoodInfo>;
