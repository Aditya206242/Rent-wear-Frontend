import { Sparkline } from "./Sparkline";
import type { AnalyticsSeries } from "@/lib/console/types";

export function PulsePanel({ series, improvesWhenDown = false }: { series: AnalyticsSeries; improvesWhenDown?: boolean }) {
  const isImprovement = improvesWhenDown ? series.changePct < 0 : series.changePct > 0;
  const latest = series.points[series.points.length - 1];

  return (
    <div className="px-4 py-4 md:px-10">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-ui text-xs uppercase tracking-wide text-brand-navy/50">{series.label}</p>
          <p className="mt-1 font-display text-2xl font-medium text-brand-navy">
            {latest}
            <span className="ml-1 font-ui text-sm font-normal text-brand-navy/50">{series.unit}</span>
          </p>
        </div>
        <span
          className={`font-mono text-xs font-medium tabular-nums ${
            isImprovement ? "text-signal-success" : "text-signal-danger"
          }`}
        >
          {series.changePct > 0 ? "+" : "−"}
          {Math.abs(series.changePct)}%
        </span>
      </div>

      <div className="mt-3">
        <Sparkline points={series.points} ariaLabel={`${series.label} trend`} positive={isImprovement} />
      </div>

      <p className="mt-3 font-ui text-xs leading-relaxed text-brand-navy/60">{series.narrative}</p>
    </div>
  );
}
