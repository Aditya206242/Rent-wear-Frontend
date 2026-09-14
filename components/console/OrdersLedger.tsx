"use client";

import { Fragment, useState } from "react";
import { ChevronDown } from "lucide-react";
import { TicketPunch } from "./TicketPunch";
import { formatRelativeDay } from "@/lib/console/date";
import { ORDER_STATUS_META } from "@/lib/console/order-status";
import type { Order } from "@/lib/console/types";

const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export function OrdersLedger({ orders }: { orders: Order[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-180 border-collapse">
        <thead>
          <tr className="border-b border-brand-navy/10 text-left">
            {["Order", "Customer", "Event", "City", "Total", "Status", ""].map((h) => (
              <th key={h} className="px-4 py-3 font-ui text-xs font-semibold uppercase tracking-wide text-brand-navy/45 md:px-10 md:first:pl-10">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-navy/8">
          {orders.map((order) => {
            const isOpen = expanded === order.id;
            return (
              <Fragment key={order.id}>
                <tr
                  tabIndex={0}
                  aria-expanded={isOpen}
                  onClick={() => setExpanded(isOpen ? null : order.id)}
                  onKeyDown={(e) => e.key === "Enter" && setExpanded(isOpen ? null : order.id)}
                  className={`cursor-pointer border-l-2 transition-colors hover:bg-white focus-visible:bg-white ${
                    isOpen ? "border-l-brand-gold bg-white" : "border-l-transparent"
                  }`}
                >
                  <td className="px-4 py-3.5 font-mono text-xs text-brand-navy md:px-10">{order.id}</td>
                  <td className="px-4 py-3.5 md:px-4">
                    <p className="font-ui text-sm font-medium text-brand-navy">{order.customer}</p>
                    <p className="font-ui text-xs text-brand-navy/50">{order.garments.join(", ")}</p>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs text-brand-navy/60">{formatRelativeDay(order.eventDate)}</td>
                  <td className="px-4 py-3.5 font-ui text-xs text-brand-navy/60">{order.city}</td>
                  <td className="px-4 py-3.5 text-right font-mono text-sm tabular-nums text-brand-navy md:text-left">
                    {currency.format(order.total)}
                  </td>
                  <td className="px-4 py-3.5 md:px-4">
                    <TicketPunch status={order.status} />
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <ChevronDown
                      size={15}
                      strokeWidth={1.5}
                      className={`inline-block text-brand-navy/40 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  </td>
                </tr>
                {isOpen && (
                  <tr className="bg-brand-cream">
                    <td colSpan={7} className="px-4 py-5 md:px-10">
                      <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
                        {[
                          ["Placed", order.placedAt],
                          ["Event date", order.eventDate],
                          ["Status", ORDER_STATUS_META[order.status].label],
                          ["Total", currency.format(order.total)],
                        ].map(([label, value]) => (
                          <div key={label}>
                            <p className="font-ui text-xs uppercase tracking-wide text-brand-navy/45">{label}</p>
                            <p className="mt-0.5 font-ui text-sm text-brand-navy">{value}</p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 border-t border-brand-navy/10 pt-4">
                        <p className="font-ui text-xs uppercase tracking-wide text-brand-navy/45">Garments</p>
                        <ul className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
                          {order.garments.map((g) => (
                            <li key={g} className="font-ui text-sm text-brand-navy">
                              {g}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
