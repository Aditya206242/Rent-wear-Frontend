"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import type { Style } from "@/lib/shop/types";

const STYLES: Style[] = ["Minimal", "Classic", "Street", "Formal", "Traditional", "Contemporary"];

export function FilterBar({ activeStyle }: { activeStyle?: Style }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [priceMin, setPriceMin] = useState(searchParams.get("priceMin") ?? "");
  const [priceMax, setPriceMax] = useState(searchParams.get("priceMax") ?? "");

  const hasPriceFilter = !!(searchParams.get("priceMin") || searchParams.get("priceMax"));
  const activeCount = (activeStyle ? 1 : 0) + (hasPriceFilter ? 1 : 0);

  function navigate(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    router.push(`/discover?${params.toString()}`);
  }

  function toggleStyle(style: Style) {
    navigate((params) => {
      if (params.get("style") === style) params.delete("style");
      else params.set("style", style);
    });
  }

  function applyPrice(e: React.FormEvent) {
    e.preventDefault();
    navigate((params) => {
      if (priceMin) params.set("priceMin", priceMin);
      else params.delete("priceMin");
      if (priceMax) params.set("priceMax", priceMax);
      else params.delete("priceMax");
    });
    setOpen(false);
  }

  function clearAll() {
    setPriceMin("");
    setPriceMax("");
    navigate((params) => {
      params.delete("style");
      params.delete("priceMin");
      params.delete("priceMax");
    });
    setOpen(false);
  }

  return (
    <div className="relative border-b border-brand-navy/10 bg-white/60 px-4 py-3.5 md:px-10">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 font-ui text-xs font-medium transition-colors ${
            open || activeCount > 0
              ? "border-brand-navy bg-brand-navy text-white"
              : "border-brand-navy/20 bg-white text-brand-navy/70 hover:border-brand-navy/40"
          }`}
        >
          <SlidersHorizontal size={13} strokeWidth={1.75} />
          Filters
          {activeCount > 0 && (
            <span className="font-mono text-[10px] tabular-nums">({activeCount})</span>
          )}
        </button>

        <span aria-hidden="true" className="mx-1 hidden h-4 w-px bg-brand-navy/12 sm:block" />

        {STYLES.map((style) => {
          const active = activeStyle === style;
          return (
            <button
              key={style}
              type="button"
              onClick={() => toggleStyle(style)}
              aria-pressed={active}
              className={`rounded-full border px-3.5 py-1.5 font-ui text-xs font-medium transition-colors ${
                active
                  ? "border-brand-cyan-deep/40 bg-brand-cyan/15 text-brand-cyan-deep"
                  : "border-brand-navy/15 bg-white text-brand-navy/60 hover:border-brand-navy/35 hover:text-brand-navy"
              }`}
            >
              {style}
            </button>
          );
        })}

        {activeCount > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="flex items-center gap-1 font-ui text-xs text-brand-navy/45 hover:text-signal-danger"
          >
            <X size={12} strokeWidth={1.75} />
            Clear
          </button>
        )}
      </div>

      {open && (
        <form
          onSubmit={applyPrice}
          className="absolute left-4 top-full z-10 mt-2 flex items-end gap-3 rounded-xl border border-brand-navy/10 bg-white p-5 shadow-[0_16px_36px_-14px_rgba(11,31,58,0.22)] md:left-10"
        >
          <label className="block">
            <span className="font-ui text-[10.5px] font-semibold uppercase tracking-wide text-brand-navy/45">Min price</span>
            <input
              type="number"
              min={0}
              inputMode="numeric"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              placeholder="0"
              className="mt-1.5 block w-24 rounded-lg border border-brand-navy/15 bg-white px-3 py-2 font-ui text-sm text-brand-navy focus:border-brand-cyan-deep/60 focus:outline-none focus:ring-2 focus:ring-brand-cyan/25"
            />
          </label>
          <label className="block">
            <span className="font-ui text-[10.5px] font-semibold uppercase tracking-wide text-brand-navy/45">Max price</span>
            <input
              type="number"
              min={0}
              inputMode="numeric"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              placeholder="Any"
              className="mt-1.5 block w-24 rounded-lg border border-brand-navy/15 bg-white px-3 py-2 font-ui text-sm text-brand-navy focus:border-brand-cyan-deep/60 focus:outline-none focus:ring-2 focus:ring-brand-cyan/25"
            />
          </label>
          <button
            type="submit"
            className="rounded-lg bg-brand-navy px-4 py-2 font-ui text-sm font-semibold text-white transition-colors hover:bg-brand-navy-dark"
          >
            Apply
          </button>
        </form>
      )}
    </div>
  );
}
