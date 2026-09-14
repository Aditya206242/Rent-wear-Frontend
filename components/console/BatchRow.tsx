import { LAUNDRY_STAGE_ORDER, LAUNDRY_STAGE_META } from "@/lib/console/laundry-stages";
import type { LaundryBatch } from "@/lib/console/types";

export function BatchRow({ batch }: { batch: LaundryBatch }) {
  const currentIndex = LAUNDRY_STAGE_ORDER.indexOf(batch.stage);
  const meta = LAUNDRY_STAGE_META[batch.stage];
  const Icon = meta.icon;

  return (
    <div className="flex flex-col gap-4 border-b border-brand-navy/10 px-4 py-5 md:flex-row md:items-center md:gap-8 md:px-10">
      <div className="w-full shrink-0 md:w-44">
        <div className="flex items-center gap-2">
          <p className="font-mono text-sm font-semibold text-brand-navy">{batch.id}</p>
          {batch.priority === "rush" && (
            <span className="bg-brand-gold px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wide text-brand-navy-dark">
              Rush
            </span>
          )}
        </div>
        <p className="mt-0.5 font-ui text-xs text-brand-navy/55">
          {batch.garmentCount} garments · {batch.facility}
        </p>
      </div>

      <div className="flex flex-1 items-center gap-3">
        <span className="flex items-center gap-[3px]" role="img" aria-label={`${meta.label}, stage ${currentIndex + 1} of ${LAUNDRY_STAGE_ORDER.length}`}>
          {LAUNDRY_STAGE_ORDER.map((stage, i) => (
            <span
              key={stage}
              className="h-3 w-1.5 rounded-[1px]"
              style={{
                backgroundColor:
                  i < currentIndex ? "var(--color-brand-navy)" : i === currentIndex ? "var(--color-brand-gold)" : "var(--color-rule)",
              }}
            />
          ))}
        </span>
        <Icon size={14} strokeWidth={1.75} className="text-brand-navy/70" aria-hidden="true" />
        <span className="font-ui text-sm font-medium text-brand-navy">{meta.label}</span>
      </div>

      <div className="shrink-0 text-right">
        <p className="font-mono text-sm font-semibold tabular-nums text-brand-navy">{batch.etaMinutes}m</p>
        <p className="font-ui text-[10px] uppercase tracking-wide text-brand-navy/45">to next stage</p>
      </div>
    </div>
  );
}
