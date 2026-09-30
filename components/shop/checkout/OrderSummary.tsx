import { ShieldCheck } from "lucide-react";
import { formatMoney } from "@/lib/shop/format";
import type { CartSummaryPricing, OrderPricing } from "@/lib/shop/checkout-types";

/**
 * Totals exactly as the backend computed them — this component never adds
 * anything up itself. Before a delivery method is chosen it shows the cart
 * summary (no delivery line yet); on review it shows the order preview.
 */
export function OrderSummary({
  pricing,
  couponCode,
  deliveryLabel,
  itemCount,
  children,
}: {
  pricing: OrderPricing | CartSummaryPricing;
  couponCode?: string | null;
  deliveryLabel?: string | null;
  itemCount: number;
  children?: React.ReactNode;
}) {
  const d = pricing.display as Record<string, number>;
  const currency = pricing.displayCurrency;
  const hasDelivery = typeof d.deliveryFee === "number";

  return (
    <aside className="rounded-xl border border-brand-navy/10 bg-white px-6 py-5 lg:sticky lg:top-28">
      <h2 className="font-display text-lg font-medium text-brand-navy">Order summary</h2>
      <p className="font-ui text-xs text-brand-navy/50">
        {itemCount} item{itemCount === 1 ? "" : "s"}
      </p>

      <dl className="mt-4 space-y-2 font-ui text-sm">
        {d.rentSubtotal > 0 && (
          <div className="flex justify-between text-brand-navy/70">
            <dt>Rentals</dt>
            <dd className="font-mono">{formatMoney(d.rentSubtotal, currency)}</dd>
          </div>
        )}
        {d.buySubtotal > 0 && (
          <div className="flex justify-between text-brand-navy/70">
            <dt>Purchases</dt>
            <dd className="font-mono">{formatMoney(d.buySubtotal, currency)}</dd>
          </div>
        )}
        {d.discount > 0 && (
          <div className="flex justify-between text-signal-success">
            <dt>Discount{couponCode ? ` · ${couponCode}` : ""}</dt>
            <dd className="font-mono">−{formatMoney(d.discount, currency)}</dd>
          </div>
        )}
        <div className="flex justify-between text-brand-navy/70">
          <dt>Delivery{deliveryLabel ? ` · ${deliveryLabel}` : ""}</dt>
          <dd className="font-mono">
            {hasDelivery ? (d.deliveryFee === 0 ? "Free" : formatMoney(d.deliveryFee, currency)) : <span className="font-ui text-xs text-brand-navy/40">Next step</span>}
          </dd>
        </div>
        {d.depositTotal > 0 && (
          <div className="flex justify-between text-brand-navy/50">
            <dt>Refundable deposit</dt>
            <dd className="font-mono">{formatMoney(d.depositTotal, currency)}</dd>
          </div>
        )}
        <div className="flex justify-between border-t border-brand-navy/10 pt-3 text-base font-semibold text-brand-navy">
          <dt>{hasDelivery ? "Total to pay" : "Total so far"}</dt>
          <dd className="font-mono">{formatMoney(d.grandTotal, currency)}</dd>
        </div>
      </dl>

      {children}

      <p className="mt-4 flex items-start gap-1.5 font-ui text-[11px] leading-relaxed text-brand-navy/45">
        <ShieldCheck size={13} strokeWidth={1.75} className="mt-px shrink-0" />
        Prices, stock and discounts are re-checked when you place the order — you&apos;re never charged more than the total you confirm.
      </p>
    </aside>
  );
}
