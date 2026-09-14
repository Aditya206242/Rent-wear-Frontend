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
  const padding = size === "sm" ? "py-2.5" : "py-4";
  const priceSize = size === "sm" ? "text-lg" : "text-2xl";

  return (
    <div className="relative grid grid-cols-2 border border-brand-navy/15" role="radiogroup" aria-label="Rent or buy">
      <button
        type="button"
        role="radio"
        aria-checked={value === "rent"}
        onClick={() => onChange("rent")}
        className={`flex flex-col items-center gap-0.5 ${padding} transition-colors ${
          value === "rent" ? "bg-brand-gold/12" : "bg-white hover:bg-brand-cream"
        }`}
      >
        <span
          className={`font-mono text-[10px] font-semibold uppercase tracking-wide ${
            value === "rent" ? "text-brand-gold-deep" : "text-brand-navy/40"
          }`}
        >
          Rent
        </span>
        <span className={`font-display ${priceSize} font-medium text-brand-navy`}>{formatMoney(rentPrice, currency)}</span>
        <span className="font-ui text-xs text-brand-navy/50">{rentDays} days</span>
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
        <span className="font-ui text-xs text-brand-navy/50">Own it</span>
      </button>

      {/* perforation between the two stubs */}
      <div
        className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 border-l border-dashed border-brand-navy/20"
        aria-hidden="true"
      >
        <span className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-brand-cream" />
        <span className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-brand-cream" />
      </div>

      {/* selected indicator tab */}
      <div
        className="absolute -top-px h-0.5 w-1/2 transition-transform"
        style={{
          transform: value === "buy" ? "translateX(100%)" : "translateX(0)",
          backgroundColor: value === "buy" ? "var(--color-brand-navy)" : "var(--color-brand-gold)",
        }}
        aria-hidden="true"
      />
    </div>
  );
}
