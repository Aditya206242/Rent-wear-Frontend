"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { GarmentSwatch } from "./GarmentSwatch";
import { PaymentPanel } from "./payment/PaymentPanel";
import { useShopCart } from "@/lib/shop/cart-context";
import { formatMoney } from "@/lib/shop/format";
import type { CartLine } from "@/lib/shop/types";

function lineName(line: CartLine) {
  return line.product?.name ?? line.garmentId;
}

/**
 * Reads the cart from ShopProvider's in-memory `lines` (see
 * lib/shop/cart-context.tsx) rather than re-fetching here — for a signed-in
 * user that state is kept in sync with the backend's own Cart on every
 * add/remove, so this is the same cart the "Continue to payment" step's
 * POST /checkout call will see server-side.
 */
export function CheckoutClient() {
  const { lines, removeLine, address } = useShopCart();
  const currency = lines.find((l) => l.currency)?.currency ?? "INR";
  const rentals = lines.filter((l) => l.mode === "rent");
  const purchases = lines.filter((l) => l.mode === "buy");
  const rentTotal = rentals.reduce((sum, l) => sum + (l.rentPrice ?? 0), 0);
  const depositTotal = rentals.reduce((sum, l) => sum + (l.deposit ?? 0), 0);
  const buyTotal = purchases.reduce((sum, l) => sum + (l.buyPrice ?? 0), 0);
  const dueNow = rentTotal + depositTotal + buyTotal;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 md:px-0">
      <p className="font-mono text-xs uppercase tracking-wide text-brand-cyan-deep">Your bag</p>
      <h1 className="mt-1 font-display text-3xl font-medium text-brand-navy">Checkout</h1>

      {lines.length === 0 ? (
        <div className="mt-10 rounded-xl border border-brand-navy/12 bg-white px-6 py-14 text-center">
          <p className="font-ui text-sm text-brand-navy/55">Your bag is empty.</p>
          <Link
            href="/discover"
            className="mt-4 inline-block rounded-lg bg-brand-navy px-5 py-2.5 font-ui text-sm font-semibold text-white transition-colors hover:bg-brand-navy-dark"
          >
            Continue browsing
          </Link>
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-xl border border-brand-navy/12 bg-white">
          <ul className="divide-y divide-brand-navy/10">
            {lines.map((line) => (
              <li key={`${line.garmentId}-${line.mode}`} className="flex gap-4 px-6 py-4">
                <div className="h-20 w-14 shrink-0 overflow-hidden rounded-lg">
                  <GarmentSwatch colorHex={line.product?.colorHex ?? "#172b4d"} name={lineName(line)} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-ui text-sm font-medium text-brand-navy">{lineName(line)}</p>
                  <p className="font-ui text-xs text-brand-navy/55">
                    Size {line.size} · {line.mode === "rent" ? "Rental" : "Purchase"}
                  </p>
                </div>
                <p className="shrink-0 font-mono text-sm text-brand-navy/80">
                  {formatMoney(line.mode === "rent" ? line.rentPrice ?? 0 : line.buyPrice ?? 0, line.currency ?? currency)}
                </p>
                <button
                  type="button"
                  onClick={() => removeLine(line.garmentId, line.mode)}
                  aria-label={`Remove ${lineName(line)} from bag`}
                  className="shrink-0 self-start text-brand-navy/35 transition-colors hover:text-signal-danger"
                >
                  <X size={16} strokeWidth={1.75} />
                </button>
              </li>
            ))}
          </ul>

          <dl className="space-y-1.5 border-t border-brand-navy/10 px-6 py-5 font-ui text-sm">
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
              <dd className="font-mono">{formatMoney(dueNow, currency)}</dd>
            </div>
          </dl>

          <PaymentPanel
            disabled={lines.length === 0}
            dueNow={dueNow}
            currency={currency}
            customer={{ name: address?.fullName ?? "", email: address?.email ?? "", phone: address?.phone ?? "" }}
          />
        </div>
      )}
    </div>
  );
}
