"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { ImageFilmstrip } from "./ImageFilmstrip";
import { RentBuyToggle } from "./RentBuyToggle";
import { SizeSelector } from "./SizeSelector";
import { AvailabilityPicker } from "./AvailabilityPicker";
import { GarmentLifecycleStrip } from "./GarmentLifecycleStrip";
import { GarmentSwatch } from "./GarmentSwatch";
import { useShopCart } from "@/lib/shop/cart-context";
import { formatMoney } from "@/lib/shop/format";
import type { Garment, RentOrBuy } from "@/lib/shop/types";

export function ProductDetail({ garment, similar }: { garment: Garment; similar: Garment[] }) {
  const [mode, setMode] = useState<RentOrBuy>("rent");
  const [size, setSize] = useState<string | null>(garment.sizes.find((s) => s.available)?.size ?? null);
  const [added, setAdded] = useState(false);
  const { addLine, toggleWishlist, isWishlisted } = useShopCart();
  const wishlisted = isWishlisted(garment.id);

  function handleAdd() {
    if (!size) return;
    addLine({
      garmentId: garment.id,
      mode,
      size,
      product: { id: garment.id, name: garment.name, brand: garment.brand, colorHex: garment.colorHex },
      currency: garment.currency,
      rentPrice: garment.rentPrice,
      deposit: garment.deposit,
      buyPrice: garment.buyPrice,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-8 px-4 py-8 md:px-10 lg:grid-cols-2 lg:gap-12">
        <ImageFilmstrip colorHex={garment.colorHex} name={garment.name} views={garment.views} />

        <div className="max-w-lg">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-mono text-xs uppercase tracking-wide text-brand-navy/40">{garment.brand}</p>
              <h1 className="mt-1 font-display text-3xl font-medium text-brand-navy">{garment.name}</h1>
              <p className="mt-1 font-ui text-sm text-brand-navy/55">
                {garment.category} · {garment.color}
              </p>
            </div>
            <button
              type="button"
              onClick={() => toggleWishlist(garment.id)}
              aria-pressed={wishlisted}
              aria-label={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
              className="flex h-9 w-9 shrink-0 items-center justify-center border border-brand-navy/15 text-brand-navy/60 hover:text-brand-gold-deep"
            >
              <Heart size={16} strokeWidth={1.75} fill={wishlisted ? "var(--color-brand-gold-deep)" : "none"} />
            </button>
          </div>

          <div className="mt-2 flex items-center gap-1.5 font-ui text-sm text-brand-navy/60">
            <Star size={14} fill="var(--color-brand-gold)" strokeWidth={0} />
            {garment.rating} <span className="text-brand-navy/40">({garment.reviewCount} reviews)</span>
          </div>

          <div className="mt-6">
            <RentBuyToggle value={mode} onChange={setMode} rentPrice={garment.rentPrice} rentDays={garment.rentDays} buyPrice={garment.buyPrice} currency={garment.currency} />
            {mode === "rent" && (
              <p className="mt-2 font-ui text-xs text-brand-navy/50">
                Refundable deposit {formatMoney(garment.deposit, garment.currency)}, returned after inspection.
              </p>
            )}
          </div>

          <div className="mt-6">
            <p className="font-ui text-xs font-semibold uppercase tracking-wide text-brand-navy/50">Size</p>
            <div className="mt-2">
              <SizeSelector sizes={garment.sizes} selected={size} onSelect={setSize} />
            </div>
          </div>

          <div className="mt-6">
            <AvailabilityPicker
              status={garment.availability}
              rentDays={garment.rentDays}
              deliveryDays={garment.deliveryDays}
              availableFrom={garment.availableFrom}
            />
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={!size}
            className="mt-6 flex w-full items-center justify-center gap-2 bg-brand-navy py-3.5 font-ui text-sm font-semibold text-white transition-colors hover:bg-brand-navy-dark disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ShoppingBag size={16} strokeWidth={1.75} />
            {added ? "Added to bag" : mode === "rent" ? "Add rental to bag" : "Add to bag"}
          </button>

          <p className="mt-3 font-ui text-xs text-brand-navy/50">{garment.conditionCopy}</p>

          <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-brand-navy/10 pt-6 text-sm">
            <div>
              <p className="font-ui text-xs uppercase tracking-wide text-brand-navy/45">Fabric</p>
              <p className="mt-0.5 font-ui text-brand-navy">{garment.fabric}</p>
            </div>
            {garment.measurements.map((m) => (
              <div key={m.label}>
                <p className="font-ui text-xs uppercase tracking-wide text-brand-navy/45">{m.label}</p>
                <p className="mt-0.5 font-mono text-brand-navy">{m.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <p className="font-ui text-xs uppercase tracking-wide text-brand-navy/45">Care</p>
            <ul className="mt-1 space-y-0.5">
              {garment.care.map((c) => (
                <li key={c} className="font-ui text-sm text-brand-navy/70">
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-brand-navy/10 px-4 py-10 md:px-10">
        <p className="font-ui text-xs font-semibold uppercase tracking-wide text-brand-navy/50">This garment&apos;s journey</p>
        <div className="mt-4">
          <GarmentLifecycleStrip />
        </div>
      </div>

      {similar.length > 0 && (
        <div className="border-t border-brand-navy/10 px-4 py-10 md:px-10">
          <p className="font-ui text-xs font-semibold uppercase tracking-wide text-brand-navy/50">Looks similar, worth a look</p>
          <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
            {similar.map((g) => (
              <Link key={g.id} href={`/product/${g.id}`} className="w-40 shrink-0">
                <div className="aspect-[3/4]">
                  <GarmentSwatch colorHex={g.colorHex} name={g.name} />
                </div>
                <p className="mt-2 font-ui text-sm font-medium text-brand-navy">{g.name}</p>
                <p className="font-mono text-xs text-brand-navy/55">{formatMoney(g.rentPrice, g.currency)} / {g.rentDays}d</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
