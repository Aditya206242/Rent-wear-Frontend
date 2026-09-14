"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { GarmentSwatch } from "./GarmentSwatch";
import { AvailabilityBadge } from "./AvailabilityBadge";
import { RentBuyToggle } from "./RentBuyToggle";
import { useShopCart } from "@/lib/shop/cart-context";
import type { Garment, RentOrBuy } from "@/lib/shop/types";

export function ProductTicket({ garment, aspect = "portrait" }: { garment: Garment; aspect?: "portrait" | "wide" }) {
  const [mode, setMode] = useState<RentOrBuy>("rent");
  const { addLine, toggleWishlist, isWishlisted } = useShopCart();
  const wishlisted = isWishlisted(garment.id);
  const firstAvailableSize = garment.sizes.find((s) => s.available)?.size;
  // The product-list endpoint doesn't return per-size stock (see lib/shop/api.ts) —
  // `sizes` is only populated once we've loaded the full detail. Until then we
  // don't know a size to add, so the quick-action opens the detail page instead
  // of guessing.
  const knowsSizes = garment.sizes.length > 0;
  const canAddDirectly = knowsSizes && garment.availability !== "unavailable" && !!firstAvailableSize;

  return (
    <article className="group border border-brand-navy/12 bg-white">
      <div className={`relative ${aspect === "wide" ? "aspect-[16/10]" : "aspect-[3/4]"}`}>
        <Link href={`/product/${garment.id}`} className="absolute inset-0">
          <GarmentSwatch colorHex={garment.colorHex} name={garment.name} view="front" />
        </Link>

        <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between">
          {knowsSizes ? (
            <span className="pointer-events-auto bg-white/90 px-2 py-1">
              <AvailabilityBadge status={garment.availability} compact />
            </span>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={() => toggleWishlist(garment.id)}
            aria-pressed={wishlisted}
            aria-label={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
            className="pointer-events-auto flex h-8 w-8 items-center justify-center bg-white/90 text-brand-navy/60 transition-colors hover:text-brand-gold-deep"
          >
            <Heart size={15} strokeWidth={1.75} fill={wishlisted ? "var(--color-brand-gold-deep)" : "none"} className={wishlisted ? "text-brand-gold-deep" : ""} />
          </button>
        </div>
      </div>

      {/* perforation */}
      <div className="relative border-t border-dashed border-brand-navy/20" aria-hidden="true">
        <span className="absolute -left-1.5 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-brand-cream" />
        <span className="absolute -right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-brand-cream" />
      </div>

      <div className="p-4">
        <Link href={`/product/${garment.id}`} className="block">
          <p className="font-mono text-[10px] uppercase tracking-wide text-brand-navy/40">{garment.brand}</p>
          <h3 className="mt-0.5 font-display text-lg font-medium leading-tight text-brand-navy">{garment.name}</h3>
          <p className="mt-0.5 font-ui text-xs text-brand-navy/55">
            {garment.category} · {garment.color}
          </p>
        </Link>

        <div className="mt-3">
          <RentBuyToggle
            value={mode}
            onChange={setMode}
            rentPrice={garment.rentPrice}
            rentDays={garment.rentDays}
            buyPrice={garment.buyPrice}
            currency={garment.currency}
            size="sm"
          />
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-ui text-xs text-brand-navy/55">{garment.conditionCopy}</p>
            {garment.availableFrom && (
              <p className="font-ui text-xs text-brand-navy/45">Available from {garment.availableFrom}</p>
            )}
          </div>
          {canAddDirectly ? (
            <button
              type="button"
              onClick={() =>
                addLine({
                  garmentId: garment.id,
                  mode,
                  size: firstAvailableSize!,
                  product: { id: garment.id, name: garment.name, brand: garment.brand, colorHex: garment.colorHex },
                  currency: garment.currency,
                  rentPrice: garment.rentPrice,
                  deposit: garment.deposit,
                  buyPrice: garment.buyPrice,
                })
              }
              aria-label={mode === "rent" ? "Add rental to bag" : "Add purchase to bag"}
              className="flex shrink-0 items-center gap-1.5 bg-brand-navy px-3 py-2 font-ui text-xs font-semibold text-white transition-colors hover:bg-brand-navy-dark"
            >
              <ShoppingBag size={14} strokeWidth={1.75} />
              Add
            </button>
          ) : (
            <Link
              href={`/product/${garment.id}`}
              className="flex shrink-0 items-center gap-1.5 bg-brand-navy px-3 py-2 font-ui text-xs font-semibold text-white transition-colors hover:bg-brand-navy-dark"
            >
              <ShoppingBag size={14} strokeWidth={1.75} />
              Select size
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
