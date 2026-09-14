"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { X, Trash2 } from "lucide-react";
import { GarmentSwatch } from "./GarmentSwatch";
import { useShopCart } from "@/lib/shop/cart-context";
import { formatMoney } from "@/lib/shop/format";
import type { CartLine } from "@/lib/shop/types";

function lineName(line: CartLine) {
  return line.product?.name ?? line.garmentId;
}
function lineColorHex(line: CartLine) {
  return line.product?.colorHex ?? "#172b4d";
}

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { lines, removeLine, isAuthenticated, requireAuth } = useShopCart();
  const router = useRouter();
  const closeRef = useRef<HTMLButtonElement>(null);

  function handleCheckout() {
    if (!isAuthenticated) {
      onClose();
      requireAuth("/checkout");
      return;
    }
    onClose();
    router.push("/checkout");
  }

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const rentals = lines.filter((l) => l.mode === "rent");
  const purchases = lines.filter((l) => l.mode === "buy");
  // Assumes one display currency per session (the backend geo-detects it
  // once per request) — falls back to the first line that has one.
  const currency = lines.find((l) => l.currency)?.currency ?? "INR";

  const rentTotal = rentals.reduce((sum, l) => sum + (l.rentPrice ?? 0), 0);
  const depositTotal = rentals.reduce((sum, l) => sum + (l.deposit ?? 0), 0);
  const buyTotal = purchases.reduce((sum, l) => sum + (l.buyPrice ?? 0), 0);

  return (
    <div className="fixed inset-0 z-[80]">
      <div role="presentation" className="absolute inset-0 bg-brand-navy/30" onClick={onClose} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Your bag"
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-brand-navy/10 bg-white"
      >
        <div className="flex items-center justify-between border-b border-brand-navy/10 px-6 py-5">
          <h2 className="font-display text-xl font-medium text-brand-navy">Your bag</h2>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close bag" className="text-brand-navy/50 hover:text-brand-navy">
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {lines.length === 0 && (
            <p className="px-6 py-14 text-center font-ui text-sm text-brand-navy/50">Your bag is empty — add a rental or a piece to own.</p>
          )}

          {rentals.length > 0 && (
            <section className="border-b border-brand-navy/10 px-6 py-5">
              <p className="font-mono text-[10px] uppercase tracking-wide text-brand-gold-deep">Rentals</p>
              <ul className="mt-3 space-y-3">
                {rentals.map((line) => (
                  <li key={`${line.garmentId}-rent`} className="flex gap-3">
                    <div className="h-16 w-12 shrink-0">
                      <GarmentSwatch colorHex={lineColorHex(line)} name={lineName(line)} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-ui text-sm font-medium text-brand-navy">{lineName(line)}</p>
                      <p className="font-ui text-xs text-brand-navy/55">
                        Size {line.size}
                        {line.deposit !== undefined && ` · deposit ${formatMoney(line.deposit, line.currency ?? currency)}`}
                      </p>
                      {line.rentPrice !== undefined && (
                        <p className="font-mono text-xs text-brand-navy/70">{formatMoney(line.rentPrice, line.currency ?? currency)}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLine(line.garmentId, "rent")}
                      aria-label={`Remove ${lineName(line)}`}
                      className="shrink-0 self-start text-brand-navy/30 hover:text-signal-danger"
                    >
                      <Trash2 size={15} strokeWidth={1.5} />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {purchases.length > 0 && (
            <section className="px-6 py-5">
              <p className="font-mono text-[10px] uppercase tracking-wide text-brand-navy/50">Purchases</p>
              <ul className="mt-3 space-y-3">
                {purchases.map((line) => (
                  <li key={`${line.garmentId}-buy`} className="flex gap-3">
                    <div className="h-16 w-12 shrink-0">
                      <GarmentSwatch colorHex={lineColorHex(line)} name={lineName(line)} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-ui text-sm font-medium text-brand-navy">{lineName(line)}</p>
                      <p className="font-ui text-xs text-brand-navy/55">Size {line.size}</p>
                      {line.buyPrice !== undefined && (
                        <p className="font-mono text-xs text-brand-navy/70">{formatMoney(line.buyPrice, line.currency ?? currency)}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLine(line.garmentId, "buy")}
                      aria-label={`Remove ${lineName(line)}`}
                      className="shrink-0 self-start text-brand-navy/30 hover:text-signal-danger"
                    >
                      <Trash2 size={15} strokeWidth={1.5} />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {lines.length > 0 && (
          <div className="border-t border-brand-navy/10 px-6 py-5">
            <dl className="space-y-1.5 font-ui text-sm">
              {rentTotal > 0 && (
                <div className="flex justify-between text-brand-navy/70">
                  <dt>Rental total</dt>
                  <dd className="font-mono">{formatMoney(rentTotal, currency)}</dd>
                </div>
              )}
              {depositTotal > 0 && (
                <div className="flex justify-between text-brand-navy/50">
                  <dt>Refundable deposit</dt>
                  <dd className="font-mono">{formatMoney(depositTotal, currency)}</dd>
                </div>
              )}
              {buyTotal > 0 && (
                <div className="flex justify-between text-brand-navy/70">
                  <dt>Purchase total</dt>
                  <dd className="font-mono">{formatMoney(buyTotal, currency)}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-brand-navy/10 pt-2 font-semibold text-brand-navy">
                <dt>Due now</dt>
                <dd className="font-mono">{formatMoney(rentTotal + depositTotal + buyTotal, currency)}</dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={handleCheckout}
              className="mt-4 w-full bg-brand-navy py-3 font-ui text-sm font-semibold text-white hover:bg-brand-navy-dark"
            >
              Checkout
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
