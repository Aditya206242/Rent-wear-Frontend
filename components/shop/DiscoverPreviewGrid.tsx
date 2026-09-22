"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal, ChevronDown, X } from "lucide-react";
import { ProductTicket } from "./ProductTicket";
import type { Garment, RentOrBuy } from "@/lib/shop/types";

const PRICE_MAX = 20000;
const PRICE_STEP = 100;

type SortKey = "recommended" | "price-asc" | "price-desc";
type OpenMenu = "category" | "size" | "price" | "sort" | null;

function Dropdown({
  label,
  active,
  open,
  onToggle,
  children,
}: {
  label: string;
  active: boolean;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={`flex items-center gap-1.5 rounded-lg border px-4 py-2.5 font-ui text-sm font-medium transition-colors ${
          active || open ? "border-brand-navy/35 bg-white text-brand-navy" : "border-brand-navy/15 bg-white text-brand-navy/70 hover:border-brand-navy/30"
        }`}
      >
        {label}
        <ChevronDown size={13} strokeWidth={2} className={`text-brand-navy/40 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-20 mt-2 min-w-45 rounded-lg border border-brand-navy/10 bg-white p-2 shadow-[0_16px_36px_-14px_rgba(11,31,58,0.25)]">
          {children}
        </div>
      )}
    </div>
  );
}

function MenuOption({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`block w-full rounded-md px-3 py-2 text-left font-ui text-[13px] transition-colors ${
        active ? "bg-brand-cyan/12 text-brand-cyan-deep" : "text-brand-navy/75 hover:bg-brand-surface"
      }`}
    >
      {label}
    </button>
  );
}

/**
 * Product grid for the /discover page. Filtering, sorting and the rent/buy
 * toggle all run client-side against `garments` — the real catalog, fetched
 * server-side by the page and passed in as a prop (see
 * app/(shop)/discover/page.tsx). Previously this rendered fixed dummy data
 * from lib/shop/mock-garments.ts regardless of what was actually in the
 * database — a product created in the admin panel would never appear here.
 */
export function DiscoverPreviewGrid({ garments }: { garments: Garment[] }) {
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [size, setSize] = useState<string | null>(null);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [mode, setMode] = useState<RentOrBuy>("rent");
  const [sort, setSort] = useState<SortKey>("recommended");
  const minPrice = Number(priceMin || 0);
  const maxPrice = Number(priceMax || PRICE_MAX);

  const categories = useMemo(() => Array.from(new Set(garments.map((g) => g.category))).sort(), [garments]);
  const sizes = useMemo(() => Array.from(new Set(garments.flatMap((g) => g.sizes.map((s) => s.size)))).sort(), [garments]);

  function toggle(menu: OpenMenu) {
    setOpenMenu((current) => (current === menu ? null : menu));
  }

  function updatePriceAt(clientX: number, type: "min" | "max", track: HTMLElement) {
    const bounds = track.getBoundingClientRect();
    const next = Math.round(Math.max(0, Math.min(PRICE_MAX, ((clientX - bounds.left) / bounds.width) * PRICE_MAX)) / PRICE_STEP) * PRICE_STEP;
    if (type === "min" && next <= maxPrice) setPriceMin(next ? String(next) : "");
    if (type === "max" && next >= minPrice) setPriceMax(next >= PRICE_MAX ? "" : String(next));
  }

  function updatePriceFromPointer(event: React.PointerEvent<HTMLElement>, type: "min" | "max") {
    const track = event.currentTarget.parentElement;
    if (track) updatePriceAt(event.clientX, type, track);
  }

  const filtered = useMemo(() => {
    let items = garments.filter((g) => {
      if (category && g.category !== category) return false;
      if (size && !g.sizes.some((s) => s.size === size && s.available)) return false;
      const price = mode === "rent" ? g.rentPrice : g.buyPrice;
      if (priceMin && price < Number(priceMin)) return false;
      if (priceMax && price > Number(priceMax)) return false;
      return true;
    });
    if (sort === "price-asc") items = [...items].sort((a, b) => (mode === "rent" ? a.rentPrice - b.rentPrice : a.buyPrice - b.buyPrice));
    if (sort === "price-desc") items = [...items].sort((a, b) => (mode === "rent" ? b.rentPrice - a.rentPrice : b.buyPrice - a.buyPrice));
    return items;
  }, [garments, category, size, priceMin, priceMax, mode, sort]);

  const activeCount = (category ? 1 : 0) + (size ? 1 : 0) + (priceMin || priceMax ? 1 : 0);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-navy/10 bg-brand-surface/65 px-4 py-2.5 md:px-10">
        <div className="flex flex-wrap items-center gap-2">
          <span className="hidden items-center gap-1.5 font-ui text-sm font-medium text-brand-navy/55 sm:flex">
            <SlidersHorizontal size={15} strokeWidth={1.75} />
            {activeCount > 0 ? `${activeCount} filters` : "Filter"}
          </span>

          <Dropdown label="Category" active={!!category} open={openMenu === "category"} onToggle={() => toggle("category")}>
            <MenuOption label="All categories" active={!category} onClick={() => { setCategory(null); setOpenMenu(null); }} />
            {categories.map((c) => (
              <MenuOption key={c} label={c} active={category === c} onClick={() => { setCategory(c); setOpenMenu(null); }} />
            ))}
          </Dropdown>

          <Dropdown label="Size" active={!!size} open={openMenu === "size"} onToggle={() => toggle("size")}>
            <MenuOption label="All sizes" active={!size} onClick={() => { setSize(null); setOpenMenu(null); }} />
            {sizes.map((s) => (
              <MenuOption key={s} label={s} active={size === s} onClick={() => { setSize(s); setOpenMenu(null); }} />
            ))}
          </Dropdown>

          <Dropdown label="Price" active={!!(priceMin || priceMax)} open={openMenu === "price"} onToggle={() => toggle("price")}>
            <div className="w-72 p-3">
              <div className="flex items-center justify-between font-ui text-xs font-semibold text-brand-navy">
                <span>Min: ₹{minPrice.toLocaleString("en-IN")}</span>
                <span>Max: {priceMax ? `₹${maxPrice.toLocaleString("en-IN")}` : "Any"}</span>
              </div>
              <div
                className="relative mt-3 h-7 cursor-pointer touch-none"
                role="group"
                aria-label="Price range"
                onPointerDown={(event) => {
                  if (event.target !== event.currentTarget) return;
                  const midpoint = (minPrice + maxPrice) / 2;
                  const clickedPrice = ((event.clientX - event.currentTarget.getBoundingClientRect().left) / event.currentTarget.getBoundingClientRect().width) * PRICE_MAX;
                  updatePriceAt(event.clientX, Math.abs(clickedPrice - minPrice) <= Math.abs(clickedPrice - maxPrice) ? "min" : "max", event.currentTarget);
                  if (clickedPrice === midpoint) updatePriceAt(event.clientX, "max", event.currentTarget);
                }}
              >
                <div className="pointer-events-none absolute left-0 right-0 top-2.5 h-1 rounded-full bg-brand-navy/15" />
                <div className="pointer-events-none absolute top-2.5 h-1 rounded-full bg-brand-cyan" style={{ left: `${(minPrice / PRICE_MAX) * 100}%`, width: `${((maxPrice - minPrice) / PRICE_MAX) * 100}%` }} />
                <div
                  role="slider"
                  tabIndex={0}
                  aria-label="Minimum price"
                  aria-valuemin={0}
                  aria-valuemax={maxPrice}
                  aria-valuenow={minPrice}
                  onPointerDown={(event) => event.currentTarget.setPointerCapture(event.pointerId)}
                  onPointerMove={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) updatePriceFromPointer(event, "min"); }}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowRight") setPriceMin(String(Math.min(minPrice + PRICE_STEP, maxPrice)));
                    if (event.key === "ArrowLeft") setPriceMin(String(Math.max(minPrice - PRICE_STEP, 0)));
                  }}
                  className="absolute cursor-pointer top-0 h-6 w-6 -translate-x-1/2 rounded-full border-2 border-white bg-brand-cyan shadow-md focus:outline-none focus:ring-2 focus:ring-brand-cyan/40"
                  style={{ left: `${(minPrice / PRICE_MAX) * 100}%` }}
                />
                <div
                  role="slider"
                  tabIndex={0}
                  aria-label="Maximum price"
                  aria-valuemin={minPrice}
                  aria-valuemax={PRICE_MAX}
                  aria-valuenow={maxPrice}
                  onPointerDown={(event) => event.currentTarget.setPointerCapture(event.pointerId)}
                  onPointerMove={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) updatePriceFromPointer(event, "max"); }}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowRight") setPriceMax(maxPrice >= PRICE_MAX - PRICE_STEP ? "" : String(maxPrice + PRICE_STEP));
                    if (event.key === "ArrowLeft") setPriceMax(String(Math.max(maxPrice - PRICE_STEP, minPrice)));
                  }}
                  className="absolute top-0 h-6 w-6 -translate-x-1/2 cursor-pointer rounded-full border-2 border-white bg-brand-navy shadow-md focus:outline-none focus:ring-2 focus:ring-brand-navy/30"
                  style={{ left: `${(maxPrice / PRICE_MAX) * 100}%` }}
                />
              </div>
              <div className="mt-2 flex items-center gap-2">
                <label className="flex min-w-0 flex-1 items-center gap-1 font-ui text-[10px] font-semibold uppercase tracking-wide text-brand-navy/45">
                  Min
                  <input
                    type="number"
                    min={0}
                    max={PRICE_MAX}
                    step={PRICE_STEP}
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    placeholder="0"
                    className="w-full min-w-0 rounded-md border border-brand-navy/15 px-2 py-1.5 font-ui text-sm font-normal text-brand-navy focus:border-brand-cyan-deep/60 focus:outline-none"
                  />
                </label>
                <label className="flex min-w-0 flex-1 items-center gap-1 font-ui text-[10px] font-semibold uppercase tracking-wide text-brand-navy/45">
                  Max
                  <input
                    type="number"
                    min={0}
                    max={PRICE_MAX}
                    step={PRICE_STEP}
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    placeholder="Any"
                    className="w-full min-w-0 rounded-md border border-brand-navy/15 px-2 py-1.5 font-ui text-sm font-normal text-brand-navy focus:border-brand-cyan-deep/60 focus:outline-none"
                  />
                </label>
              </div>
            </div>
          </Dropdown>

          <div className="flex items-center rounded-lg border border-brand-navy/20 bg-brand-navy/20 p-1">
            <button
              type="button"
              onClick={() => setMode("rent")}
              className={`rounded-md px-4 py-2 font-ui text-sm font-semibold transition-colors ${
                mode === "rent" ? "bg-white text-brand-navy shadow-sm" : "text-brand-navy/75 hover:bg-white/70"
              }`}
            >
              Rent
            </button>
            <button
              type="button"
              onClick={() => setMode("buy")}
              className={`rounded-md px-4 py-2 font-ui text-sm font-semibold transition-colors ${
                mode === "buy" ? "bg-white text-brand-navy shadow-sm" : "text-brand-navy/75 hover:bg-white/70"
              }`}
            >
              Buy
            </button>
          </div>

          {activeCount > 0 && (
            <button
              type="button"
              onClick={() => {
                setCategory(null);
                setSize(null);
                setPriceMin("");
                setPriceMax("");
                setMode("rent");
                setOpenMenu(null);
              }}
              aria-label="Clear filters"
              title="Clear filters"
              className="flex items-center justify-center text-signal-danger transition-colors hover:text-signal-danger/70"
            >
              <X size={18} strokeWidth={2} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <span className="font-ui text-[13px] text-brand-navy/50">{filtered.length} items</span>
          <Dropdown label={`Sort: ${sort === "recommended" ? "Recommended" : sort === "price-asc" ? "Price: Low to High" : "Price: High to Low"}`} active={sort !== "recommended"} open={openMenu === "sort"} onToggle={() => toggle("sort")}>
            <MenuOption label="Recommended" active={sort === "recommended"} onClick={() => { setSort("recommended"); setOpenMenu(null); }} />
            <MenuOption label="Price: Low to High" active={sort === "price-asc"} onClick={() => { setSort("price-asc"); setOpenMenu(null); }} />
            <MenuOption label="Price: High to Low" active={sort === "price-desc"} onClick={() => { setSort("price-desc"); setOpenMenu(null); }} />
          </Dropdown>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="px-4 py-20 text-center md:px-10">
          <p className="font-display text-xl text-brand-navy">Nothing matches those filters.</p>
          <p className="mt-2 font-ui text-sm text-brand-navy/55">Try clearing a filter or two.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:p-10 lg:grid-cols-4">
          {filtered.map((g) => (
            <ProductTicket key={g.id} garment={g} initialMode={mode} />
          ))}
        </div>
      )}
    </div>
  );
}
