"use client";

import { useState } from "react";
import { AvailabilityBadge } from "./AvailabilityBadge";
import type { Availability } from "@/lib/shop/types";

function addDays(iso: string, days: number) {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

export function AvailabilityPicker({
  status,
  rentDays,
  deliveryDays,
  availableFrom,
}: {
  status: Availability;
  rentDays: number;
  deliveryDays: number;
  availableFrom: string;
}) {
  const [start, setStart] = useState("");

  return (
    <div className="border border-brand-navy/12 p-4">
      <div className="flex items-center justify-between">
        <p className="font-ui text-xs font-semibold uppercase tracking-wide text-brand-navy/50">Choose your dates</p>
        <AvailabilityBadge status={status} />
      </div>

      <div className="mt-3 flex flex-wrap items-end gap-4">
        <label className="block">
          <span className="font-ui text-xs text-brand-navy/55">Start date</span>
          <input
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="mt-1 block border-0 border-b border-brand-navy/20 bg-transparent py-1 font-mono text-sm text-brand-navy focus:border-brand-gold focus:outline-none"
          />
        </label>
        <div>
          <span className="block font-ui text-xs text-brand-navy/55">Return by</span>
          <span className="font-mono text-sm text-brand-navy">{start ? addDays(start, rentDays) : "—"}</span>
        </div>
        <div>
          <span className="block font-ui text-xs text-brand-navy/55">Delivered by</span>
          <span className="font-mono text-sm text-brand-navy">{start ? addDays(start, deliveryDays) : `in ${deliveryDays} days`}</span>
        </div>
      </div>

      {!start && <p className="mt-2 font-ui text-xs text-brand-navy/45">Available from {availableFrom} if you don&apos;t pick a date.</p>}
    </div>
  );
}
