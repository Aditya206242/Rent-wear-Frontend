import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import type { Availability } from "@/lib/shop/types";

const META: Record<Availability, { label: string; icon: typeof CheckCircle2; color: string }> = {
  available: { label: "Available", icon: CheckCircle2, color: "var(--color-signal-success)" },
  limited: { label: "Limited availability", icon: AlertTriangle, color: "var(--color-signal-warning)" },
  unavailable: { label: "Unavailable", icon: XCircle, color: "var(--color-signal-danger)" },
};

export function AvailabilityBadge({ status, compact = false }: { status: Availability; compact?: boolean }) {
  const meta = META[status];
  const Icon = meta.icon;
  return (
    <span className="inline-flex items-center gap-1.5 font-ui text-xs font-medium" style={{ color: meta.color }}>
      <Icon size={13} strokeWidth={1.75} aria-hidden="true" />
      {compact ? meta.label.split(" ")[0] : meta.label}
    </span>
  );
}
