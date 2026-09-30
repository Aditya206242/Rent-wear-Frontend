"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { X, AlertCircle, Info } from "lucide-react";
import { BagLineItem } from "./BagLineItem";
import { useShopCart } from "@/lib/shop/cart-context";
import { formatMoney } from "@/lib/shop/format";

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const {
    lines,
    summary,
    coupon,
    updateQuantity,
    removeLine,
    busyLineIds,
    isAuthenticated,
    requireAuth,
    cartError,
    dismissCartError,
    mergeNotice,
    dismissMergeNotice,
    refreshCart,
  } = useShopCart();
  const router = useRouter();
  const closeRef = useRef<HTMLButtonElement>(null);
  const blocked = lines.some((l) => l.status === "blocked");

  // Stock and prices can change while the bag sits there — re-read on open.
  useEffect(() => {
    if (open) refreshCart();
  }, [open, refreshCart]);

  function handleCheckout() {
    onClose();
    // Checkout gate: guests sign in first and come back with their bag merged.
    if (!isAuthenticated) requireAuth("/checkout");
    else router.push("/checkout");
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
          {cartError && (
            <div role="alert" className="mx-6 mt-4 flex items-start gap-2 rounded-lg border border-signal-danger/30 bg-signal-danger/8 px-3.5 py-3">
              <AlertCircle size={15} strokeWidth={1.75} className="mt-0.5 shrink-0 text-signal-danger" />
              <p className="flex-1 font-ui text-xs text-signal-danger">{cartError}</p>
              <button type="button" onClick={dismissCartError} aria-label="Dismiss" className="shrink-0 text-signal-danger/60 hover:text-signal-danger">
                <X size={14} strokeWidth={1.75} />
              </button>
            </div>
          )}
          {mergeNotice && (
            <div role="status" className="mx-6 mt-4 flex items-start gap-2 rounded-lg border border-signal-warning/30 bg-signal-warning/8 px-3.5 py-3">
              <Info size={15} strokeWidth={1.75} className="mt-0.5 shrink-0 text-signal-warning" />
              <p className="flex-1 font-ui text-xs text-signal-warning">Some items from before you signed in changed: {mergeNotice}</p>
              <button type="button" onClick={dismissMergeNotice} aria-label="Dismiss" className="shrink-0 text-signal-warning/60 hover:text-signal-warning">
                <X size={14} strokeWidth={1.75} />
              </button>
            </div>
          )}

          {lines.length === 0 && (
            <p className="px-6 py-14 text-center font-ui text-sm text-brand-navy/50">Your bag is empty — add a rental or a piece to own.</p>
          )}

          {[
            { label: "Rentals", tone: "text-brand-cyan-deep", items: rentals },
            { label: "Purchases", tone: "text-brand-navy/50", items: purchases },
          ]
            .filter((group) => group.items.length > 0)
            .map((group) => (
              <section key={group.label} className="border-b border-brand-navy/10 px-6 py-5 last:border-b-0">
                <p className={`font-mono text-[10px] uppercase tracking-wide ${group.tone}`}>{group.label}</p>
                <ul className="mt-3 space-y-4">
                  {group.items.map((line) => (
                    <BagLineItem
                      key={line.id}
                      line={line}
                      compact
                      busy={busyLineIds.has(line.id)}
                      onQuantityChange={(q) => updateQuantity(line.id, q)}
                      onRemove={() => removeLine(line.id)}
                    />
                  ))}
                </ul>
              </section>
            ))}
        </div>

        {lines.length > 0 && summary && (
          <div className="border-t border-brand-navy/10 px-6 py-5">
            <dl className="space-y-1.5 font-ui text-sm">
              <div className="flex justify-between text-brand-navy/70">
                <dt>Subtotal</dt>
                <dd className="font-mono">{formatMoney(summary.subtotal, summary.currency)}</dd>
              </div>
              {summary.discount > 0 && (
                <div className="flex justify-between text-signal-success">
                  <dt>Discount{coupon?.applied ? ` (${coupon.code})` : ""}</dt>
                  <dd className="font-mono">−{formatMoney(summary.discount, summary.currency)}</dd>
                </div>
              )}
              {summary.depositTotal > 0 && (
                <div className="flex justify-between text-brand-navy/50">
                  <dt>Refundable deposit</dt>
                  <dd className="font-mono">{formatMoney(summary.depositTotal, summary.currency)}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-brand-navy/10 pt-2 font-semibold text-brand-navy">
                <dt>Estimated total</dt>
                <dd className="font-mono">{formatMoney(summary.grandTotal, summary.currency)}</dd>
              </div>
            </dl>
            <p className="mt-1.5 font-ui text-[11px] text-brand-navy/45">
              Delivery is added at checkout.
              {!isAuthenticated && " Prices and stock are confirmed when you sign in."}
            </p>
            <button
              type="button"
              onClick={handleCheckout}
              disabled={blocked}
              className="mt-4 w-full rounded-lg bg-brand-navy py-3 font-ui text-sm font-semibold text-white transition-colors hover:bg-brand-navy-dark disabled:cursor-not-allowed disabled:opacity-40"
            >
              {blocked ? "Fix the items above to check out" : "Checkout"}
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
