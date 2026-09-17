"use client";

import type { RentOrBuy } from "@/lib/shop/types";
import { formatMoney } from "@/lib/shop/format";

export function RentBuyToggle({
  value,
  onChange,
  rentPrice,
  rentDays,
  buyPrice,
  currency,
  size = "md",
}: {
  value: RentOrBuy;
  onChange: (mode: RentOrBuy) => void;
  rentPrice: number;
  rentDays: number;
  buyPrice: number;
  currency: string;
  size?: "sm" | "md";
}) {
  const padding = size === "sm" ? "py-1.5" : "py-4";
  const priceSize = size === "sm" ? "text-sm" : "text-2xl";

  return (
    <div className="relative grid grid-cols-2 overflow-hidden rounded-lg border border-brand-navy/15" role="radiogroup" aria-label="Rent or buy">
      <button
        type="button"
        role="radio"
        aria-checked={value === "rent"}
        onClick={() => onChange("rent")}
        className={`flex flex-col items-center gap-0.5 ${padding} transition-colors ${
          value === "rent" ? "bg-brand-cyan/12" : "bg-white hover:bg-brand-cream"
        }`}
      >
        <span
          className={`font-mono text-[10px] font-semibold uppercase tracking-wide ${
            value === "rent" ? "text-brand-cyan-deep" : "text-brand-navy/40"
          }`}
        >
          Rent
        </span>
        <span className={`font-display ${priceSize} font-medium text-brand-navy`}>{formatMoney(rentPrice, currency)}</span>
        {size !== "sm" && <span className="font-ui text-xs text-brand-navy/50">{rentDays} days</span>}
      </button>

      <button
        type="button"
        role="radio"
        aria-checked={value === "buy"}
        onClick={() => onChange("buy")}
        className={`flex flex-col items-center gap-0.5 ${padding} transition-colors ${
          value === "buy" ? "bg-brand-navy/6" : "bg-white hover:bg-brand-cream"
        }`}
      >
        <span
          className={`font-mono text-[10px] font-semibold uppercase tracking-wide ${
            value === "buy" ? "text-brand-navy" : "text-brand-navy/40"
          }`}
        >
          Buy
        </span>
        <span className={`font-display ${priceSize} font-medium text-brand-navy`}>{formatMoney(buyPrice, currency)}</span>
        {size !== "sm" && <span className="font-ui text-xs text-brand-navy/50">Own it</span>}
      </button>

      {/* divider between the two options */}
      <div
        className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-brand-navy/12"
        aria-hidden="true"
      />

      {/* selected indicator tab */}
      <div
        className="absolute -top-px h-0.5 w-1/2 transition-transform"
        style={{
          transform: value === "buy" ? "translateX(100%)" : "translateX(0)",
          backgroundColor: value === "buy" ? "var(--color-brand-navy)" : "var(--color-brand-cyan)",
        }}
        aria-hidden="true"
      />
    </div>
  );
}
