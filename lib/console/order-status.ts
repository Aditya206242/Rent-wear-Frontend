import type { OrderStatus } from "./types";

export const ORDER_STATUS_META: Record<OrderStatus, { label: string; color: string; step: number }> = {
  confirmed: { label: "Confirmed", color: "var(--color-brand-navy)", step: 1 },
  packed: { label: "Packed", color: "var(--color-stage-reserved)", step: 2 },
  shipped: { label: "Shipped", color: "var(--color-stage-laundry)", step: 3 },
  "with customer": { label: "With customer", color: "var(--color-signal-success)", step: 4 },
  "return in transit": { label: "Return in transit", color: "var(--color-stage-returned)", step: 5 },
  closed: { label: "Closed", color: "var(--color-ink-muted)", step: 6 },
};

export const ORDER_STATUS_STEPS = 6;
