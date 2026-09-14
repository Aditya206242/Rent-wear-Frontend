// Fixed reference point so the mock dataset stays internally consistent
// regardless of when the console is viewed.
export const TODAY = new Date("2026-09-13T12:00:00Z");

export function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const ms = target.getTime() - TODAY.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export function formatRelativeDay(dateStr: string): string {
  const diff = daysUntil(dateStr);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  if (diff > 1) return `In ${diff} days`;
  return `${Math.abs(diff)} days overdue`;
}
