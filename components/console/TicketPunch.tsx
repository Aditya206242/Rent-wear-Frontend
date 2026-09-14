import { ORDER_STATUS_META, ORDER_STATUS_STEPS } from "@/lib/console/order-status";
import type { OrderStatus } from "@/lib/console/types";

export function TicketPunch({ status }: { status: OrderStatus }) {
  const meta = ORDER_STATUS_META[status];

  return (
    <span className="inline-flex items-center gap-2" title={meta.label}>
      <span className="flex items-center gap-[3px]" role="img" aria-label={`${meta.label}, step ${meta.step} of ${ORDER_STATUS_STEPS}`}>
        {Array.from({ length: ORDER_STATUS_STEPS }).map((_, i) => (
          <span
            key={i}
            className="h-2.5 w-1 rounded-[1px]"
            style={{ backgroundColor: i < meta.step ? "var(--color-brand-gold)" : "var(--color-rule)" }}
          />
        ))}
      </span>
      <span className="font-ui text-xs font-medium text-brand-navy">{meta.label}</span>
    </span>
  );
}
