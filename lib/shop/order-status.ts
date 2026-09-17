/**
 * Customer-facing order lifecycle — view-only. Mirrors the same six backend
 * stages the console's lib/console/order-status.ts maps for staff (confirmed
 * → packed → shipped → with customer → return in transit → closed), kept as
 * a separate copy so the customer shop never imports from the console layer.
 */
export const SHOP_ORDER_STEPS = [
  { key: "confirmed", label: "Order Placed", description: "We've got your order and payment." },
  { key: "packed", label: "Preparing", description: "Your items are being packed." },
  { key: "shipped", label: "Shipped", description: "On its way to you." },
  { key: "with customer", label: "Delivered", description: "With you now." },
  { key: "return in transit", label: "Return in Transit", description: "On its way back to us." },
  { key: "closed", label: "Completed", description: "Order closed." },
] as const;

export function shopOrderStepIndex(status: string): number {
  const idx = SHOP_ORDER_STEPS.findIndex((s) => s.key === status);
  return idx === -1 ? 0 : idx;
}

export type ShopOrderTone = "pending" | "progress" | "done";

export function shopOrderTone(status: string): ShopOrderTone {
  if (status === "closed") return "done";
  if (status === "confirmed") return "pending";
  return "progress";
}

export const SHOP_ORDER_TONE_CLASSES: Record<ShopOrderTone, string> = {
  pending: "bg-brand-cyan-deep/10 text-brand-cyan-deep",
  progress: "bg-brand-cyan/15 text-brand-cyan-deep",
  done: "bg-emerald-700/10 text-emerald-800",
};
