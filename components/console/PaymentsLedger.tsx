import { CheckCircle2, Clock, Undo2, XCircle } from "lucide-react";
import type { Payment } from "@/lib/console/types";

const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

const STATUS_META: Record<Payment["status"], { label: string; icon: typeof CheckCircle2; color: string }> = {
  paid: { label: "Paid", icon: CheckCircle2, color: "var(--color-signal-success)" },
  pending: { label: "Pending", icon: Clock, color: "var(--color-signal-warning)" },
  refunded: { label: "Refunded", icon: Undo2, color: "var(--color-ink-muted)" },
  failed: { label: "Failed", icon: XCircle, color: "var(--color-signal-danger)" },
};

export function PaymentsLedger({ payments }: { payments: Payment[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse">
        <thead>
          <tr className="border-b border-brand-navy/10 text-left">
            {["Payment", "Order", "Customer", "Method", "Amount", "Status"].map((h) => (
              <th key={h} className="px-4 py-3 font-ui text-xs font-semibold uppercase tracking-wide text-brand-navy/45 md:px-10 md:first:pl-10">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-navy/8">
          {payments.map((p) => {
            const status = STATUS_META[p.status];
            const Icon = status.icon;
            return (
              <tr key={p.id} className="border-l-2 border-l-transparent transition-colors hover:border-l-brand-gold hover:bg-white">
                <td className="px-4 py-3.5 font-mono text-xs text-brand-navy md:px-10">{p.id}</td>
                <td className="px-4 py-3.5 font-mono text-xs text-brand-navy/60">{p.order}</td>
                <td className="px-4 py-3.5 font-ui text-sm text-brand-navy">{p.customer}</td>
                <td className="px-4 py-3.5 font-ui text-xs capitalize text-brand-navy/60">{p.method}</td>
                <td className="px-4 py-3.5 font-mono text-sm tabular-nums text-brand-navy">{currency.format(p.amount)}</td>
                <td className="px-4 py-3.5">
                  <span className="flex items-center gap-1.5 font-ui text-xs font-medium" style={{ color: status.color }}>
                    <Icon size={13} strokeWidth={1.75} aria-hidden="true" />
                    {status.label}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
