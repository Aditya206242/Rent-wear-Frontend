"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { GarmentSwatch } from "./GarmentSwatch";
import type { GarmentView } from "@/lib/shop/types";

export function ImageFilmstrip({
  colorHex,
  name,
  views,
  imageUrls,
  coverImageUrl,
}: {
  colorHex: string;
  name: string;
  views: GarmentView[];
  imageUrls?: Partial<Record<GarmentView, string>>;
  /** Admin-uploaded fallback thumbnail, shown as the sole "view" when this
   * color has no photos of its own (views is empty) — see
   * Garment.coverImageUrl. */
  coverImageUrl?: string | null;
}) {
  const [active, setActive] = useState(0);
  const previous = () => setActive((current) => (current - 1 + views.length) % views.length);
  const next = () => setActive((current) => (current + 1) % views.length);
  const heroImageUrl = views.length > 0 ? imageUrls?.[views[active]] : (coverImageUrl ?? undefined);

  return (
    <div>
      <div className="relative aspect-4/5 w-full cursor-zoom-in overflow-hidden rounded-xl">
        <GarmentSwatch colorHex={colorHex} name={name} view={views[active] ?? "front"} imageUrl={heroImageUrl} zoomOnHover />
        {views.length > 1 && (
          <>
            <button
              type="button"
              onClick={previous}
              aria-label="Previous product view"
              className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-brand-navy shadow-sm transition-colors hover:bg-white"
            >
              <ChevronLeft size={18} strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next product view"
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-brand-navy shadow-sm transition-colors hover:bg-white"
            >
              <ChevronRight size={18} strokeWidth={1.75} />
            </button>
          </>
        )}
      </div>
      <div className="mt-2 flex gap-2">
        {views.map((view, i) => (
          <button
            key={view}
            type="button"
            onClick={() => setActive(i)}
            aria-current={active === i}
            aria-label={`Show ${view} view`}
            className={`h-16 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
              active === i ? "border-brand-cyan" : "border-transparent opacity-60 hover:opacity-100"
            }`}
          >
            <GarmentSwatch colorHex={colorHex} name={name} view={view} imageUrl={imageUrls?.[view]} />
          </button>
        ))}
      </div>
    </div>
  );
}
