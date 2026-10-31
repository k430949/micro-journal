export function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function today(): string {
  return formatDate(new Date());
}

/** Monday–Sunday week containing `now`. */
export function weekRange(now = new Date()): { from: string; to: string } {
  const offset = (now.getDay() + 6) % 7;
  const start = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - offset,
  );
  const end = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate() + 6,
  );
  return { from: formatDate(start), to: formatDate(end) };
}

export function monthRange(now = new Date()): { from: string; to: string } {
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { from: formatDate(start), to: formatDate(end) };
}
