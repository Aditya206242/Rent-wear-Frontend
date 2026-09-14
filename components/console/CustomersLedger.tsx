"use client";

import { Fragment, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Customer } from "@/lib/console/types";

const TIER_LABEL: Record<Customer["tier"], string> = {
  signature: "Signature",
  member: "Member",
  new: "New",
};

const TIER_COLOR: Record<Customer["tier"], string> = {
  signature: "var(--color-brand-gold-deep)",
  member: "var(--color-brand-navy)",
  new: "var(--color-ink-muted)",
};

export function CustomersLedger({ customers }: { customers: Customer[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-160 border-collapse">
        <thead>
          <tr className="border-b border-brand-navy/10 text-left">
            {["Customer", "Member since", "Rentals", "On-time rate", "Tier", ""].map((h) => (
              <th key={h} className="px-4 py-3 font-ui text-xs font-semibold uppercase tracking-wide text-brand-navy/45 md:px-10 md:first:pl-10">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-navy/8">
          {customers.map((c) => {
            const isOpen = expanded === c.id;
            return (
              <Fragment key={c.id}>
                <tr
                  tabIndex={0}
                  aria-expanded={isOpen}
                  onClick={() => setExpanded(isOpen ? null : c.id)}
                  onKeyDown={(e) => e.key === "Enter" && setExpanded(isOpen ? null : c.id)}
                  className={`cursor-pointer border-l-2 transition-colors hover:bg-white focus-visible:bg-white ${
                    isOpen ? "border-l-brand-gold bg-white" : "border-l-transparent"
                  }`}
                >
                  <td className="px-4 py-3.5 md:px-10">
                    <p className="font-ui text-sm font-medium text-brand-navy">{c.name}</p>
                    <p className="font-ui text-xs text-brand-navy/50">{c.email}</p>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs text-brand-navy/60">{c.memberSince}</td>
                  <td className="px-4 py-3.5 font-mono text-sm tabular-nums text-brand-navy">{c.totalRentals}</td>
                  <td className="px-4 py-3.5 font-mono text-sm tabular-nums text-brand-navy">{Math.round(c.onTimeRate * 100)}%</td>
                  <td className="px-4 py-3.5">
                    <span className="font-ui text-xs font-medium" style={{ color: TIER_COLOR[c.tier] }}>
                      {TIER_LABEL[c.tier]}
                    </span>
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
                    <td colSpan={6} className="px-4 py-5 md:px-10">
                      <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
                        {[
                          ["Email", c.email],
                          ["Member since", c.memberSince],
                          ["Total rentals", String(c.totalRentals)],
                          ["On-time rate", `${Math.round(c.onTimeRate * 100)}%`],
                        ].map(([label, value]) => (
                          <div key={label}>
                            <p className="font-ui text-xs uppercase tracking-wide text-brand-navy/45">{label}</p>
                            <p className="mt-0.5 font-ui text-sm text-brand-navy">{value}</p>
                          </div>
                        ))}
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
