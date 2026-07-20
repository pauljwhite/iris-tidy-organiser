export function todayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function formatDayLabel(dateKey: string): { weekday: string; date: string } {
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return {
    weekday: date.toLocaleDateString(undefined, { weekday: 'long' }),
    date: date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }),
  };
}
