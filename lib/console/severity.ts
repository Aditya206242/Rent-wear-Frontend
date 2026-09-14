import { AlertTriangle, Info, CheckCircle2, OctagonAlert } from "lucide-react";

export type Severity = "info" | "success" | "warning" | "danger";

export const SEVERITY_ICON = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: OctagonAlert,
} as const;

export const SEVERITY_COLOR: Record<Severity, string> = {
  info: "var(--color-brand-navy)",
  success: "var(--color-signal-success)",
  warning: "var(--color-signal-warning)",
  danger: "var(--color-signal-danger)",
};
