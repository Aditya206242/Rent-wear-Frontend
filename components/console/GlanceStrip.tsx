type GlanceItem = {
  label: string;
  value: string;
  tone?: "default" | "warning" | "danger" | "success";
};

const TONE_CLASS: Record<NonNullable<GlanceItem["tone"]>, string> = {
  default: "text-brand-navy",
  success: "text-signal-success",
  warning: "text-signal-warning",
  danger: "text-signal-danger",
};

export function GlanceStrip({ items }: { items: GlanceItem[] }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-8 gap-y-3 border-b border-brand-navy/10 px-4 py-5 md:px-10">
      {items.map((item, i) => (
        <div key={item.label} className="flex items-baseline gap-2">
          {i > 0 && <span className="hidden h-4 w-px bg-brand-navy/15 sm:block" aria-hidden="true" />}
          <span className={`font-mono text-2xl font-semibold tabular-nums ${TONE_CLASS[item.tone ?? "default"]}`}>
            {item.value}
          </span>
          <span className="font-ui text-xs uppercase tracking-wide text-brand-navy/50">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
