import Link from "next/link";
import { LIFECYCLE_STAGES, STAGE_META, type LifecycleStage } from "@/lib/console/types";

type LifecycleLineProps = {
  counts: Record<LifecycleStage, number>;
  activeStage?: LifecycleStage;
};

export function LifecycleLine({ counts, activeStage }: LifecycleLineProps) {
  return (
    <section aria-label="Garment lifecycle, live" className="relative px-4 py-8 md:px-10 md:py-10">
      <div className="relative flex flex-col gap-7 md:flex-row md:items-start md:gap-0">
        {/* connecting rail: vertical on mobile */}
        <div className="absolute bottom-6 left-[21px] top-6 w-px bg-brand-navy/15 md:hidden" aria-hidden="true" />

        {/* connecting rail: horizontal on desktop, with a drifting current */}
        <svg
          className="pointer-events-none absolute left-[6%] right-[6%] top-[21px] hidden h-1 w-[88%] md:block"
          aria-hidden="true"
          preserveAspectRatio="none"
        >
          <line x1="0" y1="0.5" x2="100%" y2="0.5" stroke="var(--color-rule-strong)" strokeWidth={1} />
          <line
            x1="0"
            y1="0.5"
            x2="100%"
            y2="0.5"
            stroke="var(--color-brand-gold)"
            strokeWidth={1}
            strokeDasharray="1 7"
            style={{ animation: "drift 1.4s linear infinite" }}
          />
        </svg>

        {LIFECYCLE_STAGES.map((stage) => {
          const meta = STAGE_META[stage];
          const Icon = meta.icon;
          const count = counts[stage] ?? 0;
          const isActive = activeStage === stage;

          return (
            <Link
              key={stage}
              href={`/inventory?stage=${stage}`}
              className="group relative z-10 flex items-center gap-4 md:flex-1 md:flex-col md:items-center md:gap-3"
            >
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-[1.5px] bg-white transition-transform duration-150 group-hover:scale-[1.08] group-focus-visible:scale-[1.08]"
                style={{ borderColor: meta.color, boxShadow: isActive ? `0 0 0 3px ${meta.color}33` : undefined }}
              >
                <Icon size={18} strokeWidth={1.5} style={{ color: meta.color }} aria-hidden="true" />
              </span>

              <span className="flex items-center gap-2 md:flex-col md:items-center md:gap-1">
                <span className="font-mono text-lg font-semibold tabular-nums text-brand-navy">{count}</span>
                <span className="text-center font-ui text-[11px] font-medium uppercase tracking-wide text-brand-navy/55">
                  {meta.label}
                </span>
              </span>

              <span className="sr-only">{meta.description}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
