import { PackageCheck, PackagePlus, CircleDot } from "lucide-react";
import type { DeliveryJob } from "@/lib/console/types";

const STATUS_LABEL: Record<DeliveryJob["status"], { label: string; color: string }> = {
  scheduled: { label: "Scheduled", color: "var(--color-brand-navy)" },
  "en route": { label: "En route", color: "var(--color-signal-success)" },
  completed: { label: "Completed", color: "var(--color-ink-muted)" },
  delayed: { label: "Delayed", color: "var(--color-signal-danger)" },
};

export function DeparturesRail({ jobs }: { jobs: DeliveryJob[] }) {
  return (
    <ul className="divide-y divide-brand-navy/8">
      {jobs.map((job) => {
        const status = STATUS_LABEL[job.status];
        const Icon = job.type === "pickup" ? PackagePlus : PackageCheck;
        return (
          <li key={job.id} className="flex items-center gap-3 px-4 py-3 md:px-10">
            <span className="font-mono text-xs tabular-nums text-brand-navy/50">{job.window.split(" – ")[0]}</span>
            <Icon size={15} strokeWidth={1.5} className="shrink-0 text-brand-navy/60" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-ui text-sm font-medium text-brand-navy">
                {job.type === "pickup" ? "Pickup" : "Drop-off"} · {job.customer}
              </p>
              <p className="truncate font-ui text-xs text-brand-navy/50">
                {job.zone} · {job.courier}
              </p>
            </div>
            <span className="flex shrink-0 items-center gap-1.5 font-ui text-xs" style={{ color: status.color }}>
              <CircleDot size={10} fill={status.color} strokeWidth={0} />
              {status.label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
