import type { Notification } from "@/lib/console/types";

export function AnnouncementTicker({ items }: { items: Notification[] }) {
  if (items.length === 0) return null;

  const line = items.map((n) => n.detail).join("      ·      ");

  return (
    <div aria-live="polite" className="relative w-full max-w-105 overflow-hidden">
      <div className="flex whitespace-nowrap" style={{ animation: "ticker-scroll 32s linear infinite" }}>
        <span className="pr-8 font-ui text-xs text-brand-navy/60">{line}</span>
        <span className="pr-8 font-ui text-xs text-brand-navy/60" aria-hidden="true">
          {line}
        </span>
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-linear-to-l from-brand-cream to-transparent" />
    </div>
  );
}
