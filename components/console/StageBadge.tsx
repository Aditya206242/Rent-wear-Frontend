import { STAGE_META, type LifecycleStage } from "@/lib/console/types";

export function StageBadge({ stage }: { stage: LifecycleStage }) {
  const meta = STAGE_META[stage];
  const Icon = meta.icon;
  return (
    <span className="inline-flex items-center gap-1.5 font-ui text-xs font-medium text-brand-navy">
      <Icon size={13} strokeWidth={1.75} style={{ color: meta.color }} aria-hidden="true" />
      {meta.label}
    </span>
  );
}
