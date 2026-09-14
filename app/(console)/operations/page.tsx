import { GlanceStrip } from "@/components/console/GlanceStrip";
import { TicketPunch } from "@/components/console/TicketPunch";
import { listConsoleOrders } from "@/lib/console/api";
import { formatRelativeDay, daysUntil } from "@/lib/console/date";

export const metadata = { title: "Rental Operations — LoopWear Console" };

export default async function OperationsPage() {
  const { items: orders } = await listConsoleOrders({ pageSize: 100 });
  const inField = orders.filter((o) => ["with customer", "shipped", "return in transit"].includes(o.status));
  const upcoming = orders.filter((o) => ["confirmed", "packed"].includes(o.status)).sort(
    (a, b) => daysUntil(a.eventDate) - daysUntil(b.eventDate)
  );
  const overdue = inField.filter((o) => daysUntil(o.eventDate) < 0).length;

  return (
    <div>
      <GlanceStrip
        items={[
          { label: "In the field", value: String(inField.length) },
          { label: "Upcoming reservations", value: String(upcoming.length) },
          { label: "Overdue", value: String(overdue), tone: overdue > 0 ? "danger" : "success" },
          { label: "Avg. rental length", value: "5d" },
        ]}
      />

      <section className="border-b border-brand-navy/10 py-6">
        <h2 className="px-4 font-ui text-xs font-semibold uppercase tracking-wide text-brand-navy/45 md:px-10">
          In the field
        </h2>
        <ul className="mt-4 divide-y divide-brand-navy/8 border-y border-brand-navy/10">
          {inField.map((order) => {
            const relative = formatRelativeDay(order.eventDate);
            const isOverdue = daysUntil(order.eventDate) < 0;
            return (
              <li key={order.id} className="flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3.5 md:px-10">
                <span className="w-24 shrink-0 font-mono text-xs text-brand-navy/45">{order.id}</span>
                <div className="min-w-40 flex-1">
                  <p className="font-ui text-sm font-medium text-brand-navy">{order.customer}</p>
                  <p className="font-ui text-xs text-brand-navy/50">{order.garments.join(", ")}</p>
                </div>
                <span className="w-28 shrink-0 font-ui text-xs text-brand-navy/50">{order.city}</span>
                <span
                  className={`w-32 shrink-0 font-mono text-xs font-medium ${
                    isOverdue ? "text-signal-danger" : "text-brand-navy/60"
                  }`}
                >
                  {relative}
                </span>
                <TicketPunch status={order.status} />
              </li>
            );
          })}
        </ul>
      </section>

      <section className="py-6">
        <h2 className="px-4 font-ui text-xs font-semibold uppercase tracking-wide text-brand-navy/45 md:px-10">
          Upcoming reservations
        </h2>
        <ul className="mt-4 divide-y divide-brand-navy/8 border-y border-brand-navy/10">
          {upcoming.map((order) => (
            <li key={order.id} className="flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3.5 md:px-10">
              <span className="w-24 shrink-0 font-mono text-xs text-brand-navy/45">{order.id}</span>
              <div className="min-w-40 flex-1">
                <p className="font-ui text-sm font-medium text-brand-navy">{order.customer}</p>
                <p className="font-ui text-xs text-brand-navy/50">{order.garments.join(", ")}</p>
              </div>
              <span className="w-28 shrink-0 font-ui text-xs text-brand-navy/50">{order.city}</span>
              <span className="w-32 shrink-0 font-mono text-xs text-brand-navy/60">
                {formatRelativeDay(order.eventDate)}
              </span>
              <TicketPunch status={order.status} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
