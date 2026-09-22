"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { GarmentSwatch } from "./GarmentSwatch";
import { RentBuyToggle } from "./RentBuyToggle";
import { ProductQuickView } from "./ProductQuickView";
import { useShopCart } from "@/lib/shop/cart-context";
import type { Garment, RentOrBuy } from "@/lib/shop/types";

export function ProductTicket({
  garment,
  aspect = "portrait",
  className,
  initialMode = "rent",
}: {
  garment: Garment;
  aspect?: "portrait" | "wide";
  className?: string;
  /** Lets a page-level rent/buy filter (e.g. the discover grid) pick which price is shown. */
  initialMode?: RentOrBuy;
}) {
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [highlighted, setHighlighted] = useState<RentOrBuy>(initialMode);
  const { addLine, buyNow, toggleWishlist, isWishlisted } = useShopCart();
  const wishlisted = isWishlisted(garment.id);
  const firstAvailableSize = garment.sizes.find((s) => s.available)?.size;
  const cardImageUrl = garment.imageUrls?.model ?? garment.imageUrls?.front ?? garment.imageUrls?.detail ?? garment.coverImageUrl ?? undefined;
  // The product-list endpoint doesn't return per-size stock (see lib/shop/api.ts) —
  // `sizes` is only populated once we've loaded the full detail. Until then we
  // don't know a size to add, so the quick-action opens the detail page instead
  // of guessing.
  const knowsSizes = garment.sizes.length > 0;
  const canAddDirectly = knowsSizes && garment.availability !== "unavailable" && !!firstAvailableSize;

  return (
    <article className={`group overflow-hidden rounded-xl border border-brand-navy/10 bg-white transition-shadow hover:shadow-[0_16px_36px_-18px_rgba(11,31,58,0.28)] ${className ?? ""}`}>
      <div className={`relative ${aspect === "wide" ? "aspect-16/10" : "aspect-3/4"}`}>
        <button
          type="button"
          onClick={() => setQuickViewOpen(true)}
          className="absolute inset-0 block w-full cursor-pointer text-left"
          aria-label={`Quick view ${garment.name}`}
        >
          <GarmentSwatch colorHex={garment.colorHex} name={garment.name} view={garment.imageUrls?.model ? "model" : "front"} imageUrl={cardImageUrl} />
        </button>

        <div className="pointer-events-none absolute inset-x-3 top-3 flex justify-end">
          <button
            type="button"
            onClick={() => toggleWishlist(garment.id)}
            aria-pressed={wishlisted}
            aria-label={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
            className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-brand-navy/60 transition-colors hover:text-brand-cyan-deep"
          >
            <Heart size={15} strokeWidth={1.75} fill={wishlisted ? "var(--color-brand-cyan-deep)" : "none"} className={wishlisted ? "text-brand-cyan-deep" : ""} />
          </button>
        </div>
      </div>

      <div className="p-4">
        <Link href={`/product/${garment.id}`} className="block">
          <h3 className="mt-0.5 font-ui text-lg font-medium leading-tight text-brand-navy">{garment.name}</h3>
        </Link>

        <div className="mt-3">
          <RentBuyToggle
            value={highlighted}
            onChange={setHighlighted}
            rentPrice={garment.rentPrice}
            rentDays={garment.rentDays}
            buyPrice={garment.buyPrice}
            currency={garment.currency}
            size="sm"
          />
        </div>

        <div className="mt-3 flex items-center gap-2">
          {canAddDirectly ? (
            <>
              <button
                type="button"
                onClick={() =>
                  addLine({
                    garmentId: garment.id,
                    mode: "rent",
                    size: firstAvailableSize!,
                    product: { id: garment.id, name: garment.name, brand: garment.brand, colorHex: garment.colorHex, imageUrls: garment.imageUrls, coverImageUrl: garment.coverImageUrl },
                    currency: garment.currency,
                    rentPrice: garment.rentPrice,
                    deposit: garment.deposit,
                    buyPrice: garment.buyPrice,
                  })
                }
                aria-label="Add rental to bag"
                className="flex-1 rounded-md border border-brand-navy/20 py-1.5 font-ui text-xs font-semibold text-brand-navy transition-colors hover:bg-brand-cream"
              >
                Add to Cart
              </button>
              <button
                type="button"
                onClick={() =>
                  buyNow({
                    garmentId: garment.id,
                    mode: "buy",
                    size: firstAvailableSize!,
                    product: { id: garment.id, name: garment.name, brand: garment.brand, colorHex: garment.colorHex, imageUrls: garment.imageUrls, coverImageUrl: garment.coverImageUrl },
                    currency: garment.currency,
                    rentPrice: garment.rentPrice,
                    deposit: garment.deposit,
                    buyPrice: garment.buyPrice,
                  })
                }
                aria-label={`Buy ${garment.name} now`}
                className="flex-1 rounded-md bg-brand-navy py-1.5 font-ui text-xs font-semibold text-white transition-colors hover:bg-brand-navy-dark"
              >
                Buy
              </button>
            </>
          ) : (
            <Link
              href={`/product/${garment.id}`}
              className="flex-1 rounded-md bg-brand-navy py-1.5 text-center font-ui text-xs font-semibold text-white transition-colors hover:bg-brand-navy-dark"
            >
              Select size
            </Link>
          )}
        </div>
      </div>
      {quickViewOpen && <ProductQuickView garment={garment} onClose={() => setQuickViewOpen(false)} />}
    </article>
  );
}
