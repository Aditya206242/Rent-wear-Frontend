"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { GarmentSwatch } from "./GarmentSwatch";
import { useShopCart } from "@/lib/shop/cart-context";
import { formatMoney } from "@/lib/shop/format";
import { MOCK_GARMENTS } from "@/lib/shop/mock-garments";
import type { Garment, RentOrBuy } from "@/lib/shop/types";

const FEATURED_IDS = ["mock-emerald-gown", "mock-ivory-slip-dress"];
const FEATURED = FEATURED_IDS.map((id) => MOCK_GARMENTS.find((g) => g.id === id)).filter(
  (g): g is Garment => !!g
);

/** Thin viewfinder corners around the stage — the "fashion-tech" framing cue. */
function CornerBrackets() {
  const base = "absolute h-5 w-5 border-white/25";
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <span className={`${base} left-0 top-0 border-l border-t`} />
      <span className={`${base} right-0 top-0 border-r border-t`} />
      <span className={`${base} bottom-0 left-0 border-b border-l`} />
      <span className={`${base} bottom-0 right-0 border-b border-r`} />
    </div>
  );
}

function FloatingProductCard({
  garment,
  className,
  delayMs,
}: {
  garment: Garment;
  className?: string;
  delayMs: number;
}) {
  const [mode, setMode] = useState<RentOrBuy>("rent");
  const { toggleWishlist, isWishlisted } = useShopCart();
  const wishlisted = isWishlisted(garment.id);
  const price = mode === "rent" ? garment.rentPrice : garment.buyPrice;

  return (
    <div
      style={{ animation: "rise-in 0.7s ease-out both", animationDelay: `${delayMs}ms` }}
      className={`pointer-events-auto w-[166px] rounded-xl border border-white/15 bg-white/10 p-3 shadow-[0_20px_44px_-18px_rgba(4,10,22,0.7)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-brand-cyan/40 hover:bg-white/[0.14] md:w-[186px] ${className ?? ""}`}
    >
      <div className="flex items-start gap-2.5">
        <Link
          href={`/product/${garment.id}`}
          aria-label={garment.name}
          className="relative block h-16 w-12 shrink-0 overflow-hidden rounded-md"
        >
          <GarmentSwatch colorHex={garment.colorHex} name={garment.name} view="front" imageUrl={garment.imageUrls?.front} />
        </Link>
        <div className="min-w-0 flex-1 pt-0.5">
          <Link href={`/product/${garment.id}`} className="block">
            <p className="truncate font-display text-[13px] font-medium leading-snug text-white">{garment.name}</p>
            <p className="mt-0.5 font-mono text-[9.5px] uppercase tracking-wide text-white/45">{garment.brand}</p>
          </Link>
        </div>
        <button
          type="button"
          onClick={() => toggleWishlist(garment.id)}
          aria-pressed={wishlisted}
          aria-label={wishlisted ? `Remove ${garment.name} from wishlist` : `Save ${garment.name} to wishlist`}
          className="-mr-1 -mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white/55 transition-colors hover:text-brand-cyan-light active:scale-90"
        >
          <Heart
            size={14}
            strokeWidth={1.75}
            fill={wishlisted ? "var(--color-brand-cyan)" : "none"}
            className={wishlisted ? "text-brand-cyan" : ""}
          />
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <div role="radiogroup" aria-label="Rent or buy" className="inline-flex overflow-hidden rounded-md border border-white/20">
          <button
            type="button"
            role="radio"
            aria-checked={mode === "rent"}
            onClick={() => setMode("rent")}
            className={`px-2 py-1 font-mono text-[9px] font-semibold uppercase tracking-wide transition-colors active:scale-95 ${
              mode === "rent" ? "bg-brand-cyan text-brand-navy-dark" : "text-white/55 hover:text-white"
            }`}
          >
            Rent
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={mode === "buy"}
            onClick={() => setMode("buy")}
            className={`px-2 py-1 font-mono text-[9px] font-semibold uppercase tracking-wide transition-colors active:scale-95 ${
              mode === "buy" ? "bg-white text-brand-navy-dark" : "text-white/55 hover:text-white"
            }`}
          >
            Buy
          </button>
        </div>
        <p className="font-ui text-[13px] font-semibold text-white">
          {formatMoney(price, garment.currency)}
          {mode === "rent" && <span className="ml-0.5 font-normal text-white/50">/{garment.rentDays}d</span>}
        </p>
      </div>
    </div>
  );
}

export function HeroVisual() {
  if (FEATURED.length < 2) return null;
  const [first, second] = FEATURED;

  return (
    <div className="w-full self-center md:w-auto md:self-auto">
      <div className="relative mx-auto aspect-[4/5] w-full max-w-[320px] sm:max-w-[360px] md:mx-0 md:h-[480px] md:w-[400px] md:max-w-none lg:h-[540px] lg:w-[440px]">
        {/* very low-opacity editorial figure — faded into the navy backdrop, never competing with the garment */}
        <svg
          aria-hidden="true"
          viewBox="0 0 400 500"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 h-full w-full"
        >
          <circle cx="210" cy="95" r="40" fill="white" fillOpacity="0.045" stroke="white" strokeOpacity="0.12" strokeWidth="1" />
          <path
            d="M162 168 C128 210 100 292 86 400 C78 448 76 470 82 496 L338 496 C344 470 342 448 334 400 C320 292 292 210 258 168 C236 190 184 190 162 168 Z"
            fill="white"
            fillOpacity="0.04"
            stroke="white"
            strokeOpacity="0.12"
            strokeWidth="1"
          />
        </svg>

        {/* ambient glow behind the garment */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[68%] w-[68%] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(34,211,238,0.24), transparent 72%)",
            animation: "glow-pulse 5s ease-in-out infinite",
          }}
        />

        <CornerBrackets />

        {/* micro UI: new drop */}
        <div
          style={{ animation: "rise-in 0.6s ease-out both", animationDelay: "100ms" }}
          className="absolute left-2.5 top-2.5 flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.07] px-2.5 py-1.5 backdrop-blur-sm"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-brand-cyan" />
          <span className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-white/80">New Drop</span>
        </div>

        {/* micro UI: rental ready */}
        <div
          style={{ animation: "rise-in 0.6s ease-out both", animationDelay: "180ms" }}
          className="absolute right-2.5 top-2.5 flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.07] px-2.5 py-1.5 backdrop-blur-sm"
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-signal-success" />
          <span className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-white/80">Rental Ready</span>
        </div>

        {/* centerpiece: animated garment, always the primary focal point */}
        <div
          className="pointer-events-none absolute left-1/2 top-[47%] h-[64%] w-[64%] -translate-x-1/2 -translate-y-1/2"
          style={{ animation: "float-y 6s ease-in-out infinite" }}
        >
          <svg viewBox="0 0 360 340" fill="none" className="h-full w-full" aria-hidden="true">
            <circle
              cx="180"
              cy="172"
              r="152"
              fill="none"
              stroke="rgba(34,211,238,0.32)"
              strokeWidth="1"
              strokeDasharray="2 7"
              style={{ animation: "drift 4.5s linear infinite" }}
            />
            <path d="M180 40 L120 100 L120 300 L240 300 L240 100 Z" fill="rgba(255,255,255,0.06)" stroke="rgba(34,211,238,0.55)" strokeWidth="1.5" />
            <circle cx="180" cy="30" r="12" fill="none" stroke="rgba(34,211,238,0.65)" strokeWidth="1.5" />
            <path d="M100 130 L60 170 L80 300 L150 300" fill="none" stroke="rgba(255,255,255,0.24)" strokeWidth="1.5" />
            <path d="M260 130 L300 170 L280 300 L210 300" fill="none" stroke="rgba(255,255,255,0.24)" strokeWidth="1.5" />
          </svg>
        </div>

        {/* micro UI: look index + thin tick line */}
        <div
          style={{ animation: "rise-in 0.6s ease-out both", animationDelay: "260ms" }}
          className="absolute bottom-2.5 right-2.5 flex items-center gap-2"
        >
          <span className="h-px w-8 bg-white/25" />
          <span className="font-mono text-[10.5px] tabular-nums text-white/55">01 / 04</span>
        </div>

        <FloatingProductCard
          garment={first}
          delayMs={380}
          className="absolute -left-1 bottom-6 sm:-left-5 sm:bottom-8 md:-left-11 md:bottom-10"
        />
        <FloatingProductCard
          garment={second}
          delayMs={520}
          className="absolute -right-1 top-16 hidden sm:-right-4 sm:block md:-right-9 md:top-20"
        />
      </div>
    </div>
  );
}
