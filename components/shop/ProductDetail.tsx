"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, ShoppingBag, Star, Zap } from "lucide-react";
import { ImageFilmstrip } from "./ImageFilmstrip";
import { RentBuyToggle } from "./RentBuyToggle";
import { SizeSelector } from "./SizeSelector";
import { VariantPicker } from "./VariantPicker";
import { QuantityStepper } from "./QuantityStepper";
import { AvailabilityPicker } from "./AvailabilityPicker";
import { GarmentLifecycleStrip } from "./GarmentLifecycleStrip";
import { GarmentSwatch } from "./GarmentSwatch";
import { useShopCart } from "@/lib/shop/cart-context";
import { useVariantSelection } from "@/lib/shop/use-variant-selection";
import { bagInputFor } from "@/lib/shop/bag-input";
import { formatMoney } from "@/lib/shop/format";
import type { Garment, RentOrBuy } from "@/lib/shop/types";

export function ProductDetail({ garment, similar }: { garment: Garment; similar: Garment[] }) {
  const [mode, setMode] = useState<RentOrBuy>("rent");
  const {
    variantId,
    setVariantId,
    variant,
    sizes,
    activeSize,
    setSize,
    units,
    maxQuantity,
    quantity: activeQuantity,
    setQuantity,
    soldOutVariantIds,
  } = useVariantSelection(garment, mode);
  const [startDate, setStartDate] = useState("");
  const [status, setStatus] = useState<"idle" | "adding" | "added">("idle");
  const { addLine, buyNow, toggleWishlist, isWishlisted, cartError } = useShopCart();
  const wishlisted = isWishlisted(garment.id);

  const canAdd = !!activeSize && status !== "adding";
  const input = () => bagInputFor(garment, { mode, size: activeSize!, variantId: variantId ?? undefined, quantity: activeQuantity, startDate });

  async function handleAdd() {
    if (!canAdd) return;
    setStatus("adding");
    const ok = await addLine(input());
    setStatus(ok ? "added" : "idle");
    if (ok) setTimeout(() => setStatus("idle"), 2000);
  }

  async function handleBuyNow() {
    if (!canAdd) return;
    setStatus("adding");
    await buyNow(input());
    setStatus("idle");
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-8 px-4 py-8 md:px-10 lg:grid-cols-2 lg:gap-12">
        <ImageFilmstrip
          key={variantId ?? "default"}
          colorHex={variant?.colorHex ?? garment.colorHex}
          name={garment.name}
          views={variant?.views ?? garment.views}
          imageUrls={variant?.imageUrls ?? garment.imageUrls}
          coverImageUrl={garment.coverImageUrl}
        />

        <div className="max-w-lg">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-mono text-xs uppercase tracking-wide text-brand-navy/40">{garment.brand}</p>
              <h1 className="mt-1 font-ui text-3xl font-medium text-brand-navy">{garment.name}</h1>
              <p className="mt-1 font-ui text-sm text-brand-navy/55">
                {garment.category} · {variant?.color ?? garment.color}
              </p>
            </div>
            <button
              type="button"
              onClick={() => toggleWishlist(garment.id)}
              aria-pressed={wishlisted}
              aria-label={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand-navy/15 text-brand-navy/60 hover:text-brand-cyan-deep"
            >
              <Heart size={16} strokeWidth={1.75} fill={wishlisted ? "var(--color-brand-cyan-deep)" : "none"} />
            </button>
          </div>

          <div className="mt-2 flex items-center gap-1.5 font-ui text-sm text-brand-navy/60">
            <Star size={14} fill="var(--color-brand-cyan)" strokeWidth={0} />
            {garment.rating} <span className="text-brand-navy/40">({garment.reviewCount} reviews)</span>
          </div>

          {garment.description && <p className="mt-4 font-ui text-sm leading-relaxed text-brand-navy/70">{garment.description}</p>}

          <div className="mt-6">
            <RentBuyToggle value={mode} onChange={setMode} rentPrice={garment.rentPrice} rentDays={garment.rentDays} buyPrice={garment.buyPrice} currency={garment.currency} />
            {mode === "rent" && (
              <p className="mt-2 font-ui text-xs text-brand-navy/50">
                Refundable deposit {formatMoney(garment.deposit, garment.currency)}, returned after inspection.
              </p>
            )}
          </div>

          {garment.variants.length > 1 && (
            <div className="mt-6">
              <p className="font-ui text-xs font-semibold uppercase tracking-wide text-brand-navy/50">
                Colour <span className="ml-1 font-normal normal-case tracking-normal text-brand-navy/70">{variant?.color}</span>
              </p>
              <div className="mt-2">
                <VariantPicker variants={garment.variants} selectedId={variantId} onSelect={setVariantId} soldOutIds={soldOutVariantIds} />
              </div>
            </div>
          )}

          <div className="mt-6">
            <p className="font-ui text-xs font-semibold uppercase tracking-wide text-brand-navy/50">Size</p>
            <div className="mt-2">
              {sizes.length === 0 ? (
                <p className="font-ui text-xs text-brand-navy/45">This colour isn&apos;t offered in any size right now.</p>
              ) : (
                <SizeSelector sizes={sizes} selected={activeSize} onSelect={setSize} />
              )}
            </div>
            {activeSize && units !== null && units > 0 && units <= 2 && (
              <p className="mt-2 font-ui text-xs font-medium text-signal-warning">Only {units} left in {activeSize}</p>
            )}
            {sizes.length > 0 && !activeSize && (
              <p className="mt-2 font-ui text-xs text-signal-danger">Out of stock in this colour{mode === "buy" ? " to buy" : " for rent"}.</p>
            )}
          </div>

          {mode === "rent" && (
            <div className="mt-6">
              <AvailabilityPicker
                status={garment.availability}
                rentDays={garment.rentDays}
                deliveryDays={garment.deliveryDays}
                availableFrom={garment.availableFrom}
                value={startDate}
                onChange={setStartDate}
              />
            </div>
          )}

          <div className="mt-6 flex items-center gap-3">
            <QuantityStepper value={activeQuantity} max={maxQuantity} onChange={setQuantity} disabled={!activeSize} />
            <button
              type="button"
              onClick={handleAdd}
              disabled={!canAdd}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand-navy py-3 font-ui text-sm font-semibold text-white transition-colors hover:bg-brand-navy-dark disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ShoppingBag size={16} strokeWidth={1.75} />
              {status === "adding" ? "Adding…" : status === "added" ? "Added to bag" : mode === "rent" ? "Add rental to bag" : "Add to bag"}
            </button>
          </div>
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={!canAdd}
            className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-lg border border-brand-navy/25 py-3 font-ui text-sm font-semibold text-brand-navy transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Zap size={15} strokeWidth={1.75} />
            {mode === "rent" ? "Rent now" : "Buy now"}
          </button>
          {cartError && status === "idle" && (
            <p role="alert" className="mt-2 font-ui text-xs text-signal-danger">
              {cartError}
            </p>
          )}

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
          <p className="font-ui text-xs font-semibold uppercase tracking-wide text-brand-navy/50">You might also like</p>
          <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
            {similar.map((g) => (
              <Link key={g.id} href={`/product/${g.id}`} className="w-40 shrink-0">
                <div className="aspect-[3/4] overflow-hidden rounded-lg">
                  <GarmentSwatch colorHex={g.colorHex} name={g.name} imageUrl={g.imageUrls?.front ?? g.coverImageUrl ?? undefined} />
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
