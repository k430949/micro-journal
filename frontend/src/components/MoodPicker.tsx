import type { CSSProperties } from "react";
import type { Mood } from "../api";
import { MOODS } from "../moods";

interface Props {
  value: Mood | null;
  onChange: (mood: Mood) => void;
  disabled?: boolean;
}

export function MoodPicker({ value, onChange, disabled }: Props) {
  return (
    <div className="mood-picker" role="radiogroup" aria-label="Mood">
      {MOODS.map((m) => (
        <button
          key={m.value}
          type="button"
          role="radio"
          aria-checked={value === m.value}
          className={`mood-option${value === m.value ? " selected" : ""}`}
          style={{ "--mood-color": m.color } as CSSProperties}
          onClick={() => onChange(m.value)}
          disabled={disabled}
        >
          <span className="mood-emoji">{m.emoji}</span>
          <span className="mood-label">{m.label}</span>
        </button>
      ))}
    </div>
  );
}
