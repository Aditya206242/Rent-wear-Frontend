"use client";

import { useEffect, useRef, useState } from "react";
import type { GarmentView } from "@/lib/shop/types";

function isLight(hex: string) {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150;
}

const VIEW_LABEL: Record<GarmentView, string> = {
  front: "Front",
  back: "Back",
  fabric: "Fabric",
  model: "Styled",
  detail: "Detail",
};

export function GarmentSwatch({
  colorHex,
  name,
  view = "front",
  imageUrl,
  className,
  zoomOnHover = false,
}: {
  colorHex: string;
  name: string;
  view?: GarmentView;
  /** Real product photo from the backend, when it has one for this view — falls back to the color placeholder below when absent. */
  imageUrl?: string;
  className?: string;
  /** Magnifying-glass style zoom that tracks the cursor — used for the quick-view/PDP hero image, not thumbnails or card grids. */
  zoomOnHover?: boolean;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [broken, setBroken] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  useEffect(() => {
    setBroken(false);
    // A cross-origin image that's already failed by the time this effect
    // runs (blocked, 404, etc.) never fires `onError` — the browser starts
    // loading the server-rendered <img> before React hydrates and attaches
    // the listener, so the failure happens in the gap. Catch that case here.
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setBroken(true);
  }, [imageUrl]);

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    if (!zoomOnHover) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;
    setOrigin(`${x}% ${y}%`);
  }

  if (imageUrl && !broken) {
    return (
      <div
        className={`relative h-full w-full overflow-hidden ${className ?? ""}`}
        style={{ backgroundColor: colorHex }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => zoomOnHover && setZoomed(true)}
        onMouseLeave={() => zoomOnHover && setZoomed(false)}
      >
        <img
          ref={imgRef}
          src={imageUrl}
          alt={`${name} — ${VIEW_LABEL[view]}`}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-150 ease-out"
          style={zoomOnHover ? { transformOrigin: origin, transform: zoomed ? "scale(2.2)" : "scale(1)" } : undefined}
          loading="lazy"
          onError={() => setBroken(true)}
        />
      </div>
    );
  }

  const light = isLight(colorHex);
  const ink = light ? "rgba(23,43,77,0.7)" : "rgba(255,255,255,0.85)";
  const inkFaint = light ? "rgba(23,43,77,0.35)" : "rgba(255,255,255,0.4)";
  const silhouette = light ? "rgba(23,43,77,0.3)" : "rgba(255,255,255,0.4)";
  const initial = name.trim().charAt(0).toUpperCase();

  return (
    <div
      className={`relative flex h-full w-full items-center justify-center overflow-hidden ${className ?? ""}`}
      style={{
        backgroundImage: `linear-gradient(155deg, ${colorHex} 0%, ${colorHex} 55%, rgba(0,0,0,0.14) 100%)`,
      }}
      aria-hidden="true"
    >
      {view === "fabric" && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, ${ink} 0, ${ink} 1px, transparent 1px, transparent 7px)`,
            opacity: 0.12,
          }}
        />
      )}

      <span
        className="absolute left-3 top-3 font-mono text-[10px] uppercase tracking-wide"
        style={{ color: inkFaint }}
      >
        {VIEW_LABEL[view]}
      </span>

      {view === "model" ? (
        <span
          className="px-6 text-center font-display text-lg font-medium leading-tight"
          style={{ color: ink }}
        >
          {name}
        </span>
      ) : (
        <>
          {/* stylised garment silhouette — stands in for a product photo until one is uploaded */}
          <svg viewBox="0 0 90 110" className="h-[58%] w-auto" fill="none" stroke={silhouette} strokeWidth="1.4">
            <path d="M45 8 L30 22 L22 34 L30 40 L30 100 L60 100 L60 40 L68 34 L60 22 Z" />
            <circle cx="45" cy="6" r="5" />
          </svg>
          <span
            className="absolute bottom-3 right-3 flex h-7 w-7 items-center justify-center rounded-full font-display text-xs font-semibold"
            style={{ color: ink, backgroundColor: light ? "rgba(23,43,77,0.08)" : "rgba(255,255,255,0.16)" }}
          >
            {initial}
          </span>
        </>
      )}
    </div>
  );
}
