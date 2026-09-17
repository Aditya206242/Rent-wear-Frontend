"use client";

import Link from "next/link";
import { Plus, ShoppingBag } from "lucide-react";
import { GarmentSwatch } from "./GarmentSwatch";
import { useShopCart } from "@/lib/shop/cart-context";
import { formatMoney } from "@/lib/shop/format";
import type { Garment, Outfit } from "@/lib/shop/types";

export function OutfitSpread({ outfit, garments }: { outfit: Outfit; garments: Garment[] }) {
  const { addLine } = useShopCart();

  function addLook() {
    for (const g of garments) {
      const size = g.sizes.find((s) => s.available)?.size;
      if (size) {
        addLine({
          garmentId: g.id,
          mode: "rent",
          size,
          product: { id: g.id, name: g.name, brand: g.brand, colorHex: g.colorHex },
          currency: g.currency,
          rentPrice: g.rentPrice,
          deposit: g.deposit,
          buyPrice: g.buyPrice,
        });
      }
    }
  }

  return (
    <article className="overflow-hidden rounded-xl border border-brand-navy/12 bg-white">
      <div className="flex items-center justify-between border-b border-brand-navy/10 px-5 py-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wide text-brand-cyan-deep">The Look · {outfit.occasion}</p>
          <h3 className="font-display text-xl font-medium text-brand-navy">{outfit.name}</h3>
        </div>
        <div className="text-right">
          <p className="font-display text-xl font-medium text-brand-navy">{formatMoney(outfit.lookRentPrice, outfit.currency)}</p>
          <p className="font-ui text-xs text-brand-navy/50">complete look · {outfit.lookRentDays} days</p>
        </div>
      </div>

      <div className="flex items-stretch gap-px overflow-x-auto bg-brand-navy/10 p-px">
        {garments.map((g, i) => (
          <div key={g.id} className="relative flex flex-1 items-stretch">
            <Link href={`/product/${g.id}`} className="relative block aspect-square w-full min-w-24 bg-white">
              <GarmentSwatch colorHex={g.colorHex} name={g.name} view="front" imageUrl={g.imageUrls?.front} />
              <span className="absolute bottom-1.5 left-1.5 right-1.5 truncate bg-white/85 px-1.5 py-0.5 font-ui text-[10px] text-brand-navy">
                {g.name}
              </span>
            </Link>
            {i < garments.length - 1 && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-2.5 top-1/2 z-10 flex h-5 w-5 -translate-y-1/2 items-center justify-center bg-brand-cream text-brand-navy/50"
              >
                <Plus size={13} strokeWidth={2} />
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between px-5 py-3.5">
        <p className="font-ui text-xs text-brand-navy/50">
          {garments.length} pieces · buy the look for {formatMoney(outfit.lookBuyPrice, outfit.currency)}
        </p>
        <button
          type="button"
          onClick={addLook}
          className="flex items-center gap-1.5 rounded-lg bg-brand-cyan px-3.5 py-2 font-ui text-xs font-semibold text-brand-navy-dark transition-colors hover:bg-brand-cyan-light"
        >
          <ShoppingBag size={14} strokeWidth={1.75} />
          Rent the complete look
        </button>
      </div>
    </article>
  );
}
