"use client";

import type { VariantOption } from "@/lib/shop/types";

/** Colour swatches for a product's variants; a colour with no stock at all is shown struck through. */
export function VariantPicker({
  variants,
  selectedId,
  onSelect,
  soldOutIds,
}: {
  variants: VariantOption[];
  selectedId: string | null;
  onSelect: (variantId: string) => void;
  soldOutIds?: ReadonlySet<string>;
}) {
  if (variants.length <= 1) return null;
  return (
    <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-label="Colour">
      {variants.map((v) => {
        const selected = v.id === selectedId;
        const soldOut = soldOutIds?.has(v.id) ?? false;
        return (
          <button
            key={v.id}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={`${v.color}${soldOut ? " — sold out" : ""}`}
            title={`${v.color}${soldOut ? " — sold out" : ""}`}
            onClick={() => onSelect(v.id)}
            className={`relative h-9 w-9 rounded-full border-2 transition-shadow ${
              selected ? "border-brand-navy shadow-[0_0_0_2px_var(--color-brand-cream),0_0_0_4px_var(--color-brand-navy)]" : "border-brand-navy/15 hover:border-brand-navy/40"
            }`}
            style={{ backgroundColor: v.colorHex }}
          >
            {soldOut && <span className="absolute inset-x-0.5 top-1/2 h-0.5 -translate-y-1/2 -rotate-45 bg-brand-navy/60" aria-hidden="true" />}
          </button>
        );
      })}
    </div>
  );
}
