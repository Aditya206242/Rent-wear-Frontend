"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { TicketCard } from "./TicketCard";
import { LIFECYCLE_STAGES, STAGE_META, type Garment, type LifecycleStage } from "@/lib/console/types";

export function InventoryBoard({ garments, initialStage }: { garments: Garment[]; initialStage?: LifecycleStage }) {
  const [stage, setStage] = useState<LifecycleStage | "all">(initialStage ?? "all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return garments.filter((g) => {
      const matchesStage = stage === "all" || g.stage === stage;
      const q = query.trim().toLowerCase();
      const matchesQuery = !q || g.name.toLowerCase().includes(q) || g.sku.toLowerCase().includes(q);
      return matchesStage && matchesQuery;
    });
  }, [garments, stage, query]);

  return (
    <div>
      <div className="flex flex-col gap-4 border-b border-brand-navy/10 px-4 py-5 md:flex-row md:items-center md:justify-between md:px-10">
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setStage("all")}
            className={`border px-3 py-1.5 font-ui text-xs font-medium transition-colors ${
              stage === "all" ? "border-brand-navy bg-brand-navy text-white" : "border-brand-navy/15 text-brand-navy/60 hover:border-brand-navy/30"
            }`}
          >
            All ({garments.length})
          </button>
          {LIFECYCLE_STAGES.map((s) => {
            const count = garments.filter((g) => g.stage === s).length;
            const active = stage === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setStage(s)}
                className={`border px-3 py-1.5 font-ui text-xs font-medium transition-colors ${
                  active ? "text-white" : "border-brand-navy/15 text-brand-navy/60 hover:border-brand-navy/30"
                }`}
                style={active ? { backgroundColor: STAGE_META[s].color, borderColor: STAGE_META[s].color } : undefined}
              >
                {STAGE_META[s].label} ({count})
              </button>
            );
          })}
        </div>

        <label className="flex items-center gap-2 border-b border-brand-navy/20 px-1 py-1.5 md:w-64">
          <Search size={14} strokeWidth={1.5} className="text-brand-navy/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or SKU"
            aria-label="Search garments"
            className="w-full bg-transparent font-ui text-sm text-brand-navy placeholder:text-brand-navy/40 focus:outline-none"
          />
        </label>
      </div>

      {filtered.length === 0 ? (
        <p className="px-4 py-16 text-center font-ui text-sm text-brand-navy/45 md:px-10">
          No garments match this filter.
        </p>
      ) : (
        <div className="grid grid-cols-1 items-start gap-3 p-4 sm:grid-cols-2 md:p-10 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((g) => (
            <TicketCard key={g.id} garment={g} />
          ))}
        </div>
      )}
    </div>
  );
}
