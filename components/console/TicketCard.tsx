"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { StageBadge } from "./StageBadge";
import { STAGE_META, type Garment } from "@/lib/console/types";

const CONDITION_LABEL: Record<Garment["condition"], string> = {
  excellent: "Excellent",
  good: "Good",
  fair: "Fair",
  "needs review": "Needs review",
};

export function TicketCard({ garment }: { garment: Garment }) {
  const [open, setOpen] = useState(false);

  return (
    <article className="border border-brand-navy/12 bg-white transition-colors hover:border-brand-navy/25">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="block w-full text-left"
      >
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <p className="font-mono text-[11px] tracking-wide text-brand-navy/40">{garment.sku}</p>
            <ChevronDown
              size={14}
              strokeWidth={1.5}
              className={`shrink-0 text-brand-navy/35 transition-transform ${open ? "rotate-180" : ""}`}
            />
          </div>
          <h3 className="mt-1 font-display text-base font-medium text-brand-navy">{garment.name}</h3>
          <p className="mt-0.5 font-ui text-xs text-brand-navy/55">
            {garment.category} · {garment.size} · {garment.color}
          </p>
        </div>

        {/* perforation */}
        <div className="relative border-t border-dashed border-brand-navy/20" aria-hidden="true">
          <span className="absolute -left-1.5 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-brand-cream" />
          <span className="absolute -right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-brand-cream" />
        </div>

        <div className="flex items-center justify-between p-4">
          <StageBadge stage={garment.stage} />
          <span className="font-ui text-xs text-brand-navy/50">{CONDITION_LABEL[garment.condition]}</span>
        </div>
      </button>

      {garment.currentCustomer && (
        <p className="border-t border-brand-navy/8 px-4 py-2 font-ui text-xs text-brand-navy/50">
          With {garment.currentCustomer}
        </p>
      )}

      {open && (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 border-t border-brand-navy/10 bg-brand-cream p-4">
          <div>
            <dt className="font-ui text-[10px] uppercase tracking-wide text-brand-navy/45">Times rented</dt>
            <dd className="mt-0.5 font-mono text-sm text-brand-navy">{garment.timesRented}</dd>
          </div>
          <div>
            <dt className="font-ui text-[10px] uppercase tracking-wide text-brand-navy/45">Last moved</dt>
            <dd className="mt-0.5 font-mono text-sm text-brand-navy">
              {new Date(garment.lastMovedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
            </dd>
          </div>
          <div className="col-span-2">
            <dt className="font-ui text-[10px] uppercase tracking-wide text-brand-navy/45">Stage</dt>
            <dd className="mt-0.5 font-ui text-sm text-brand-navy/70">{STAGE_META[garment.stage].description}</dd>
          </div>
        </dl>
      )}
    </article>
  );
}
