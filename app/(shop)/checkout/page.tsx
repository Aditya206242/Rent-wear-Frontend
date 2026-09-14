import Link from "next/link";
import { GarmentSwatch } from "@/components/shop/GarmentSwatch";
import { fetchCartAction, type ApiCartItem } from "@/lib/shop/cart-actions";
import { formatMoney } from "@/lib/shop/format";
import { requireUser } from "@/lib/auth/session";

export const metadata = { title: "Checkout — LoopWear" };

function lineName(item: ApiCartItem) {
  return item.product?.name ?? item.productId;
}

export default async function CheckoutPage() {
  const user = await requireUser("/checkout");

  const { items } = await fetchCartAction();
  const currency = items.find((i) => i.pricing?.displayCurrency)?.pricing?.displayCurrency ?? "INR";
  const rentals = items.filter((i) => i.mode === "rent");
  const purchases = items.filter((i) => i.mode === "buy");
  const rentTotal = rentals.reduce((sum, i) => sum + (i.pricing?.display?.rentPrice ?? 0), 0);
  const depositTotal = rentals.reduce((sum, i) => sum + (i.pricing?.display?.deposit ?? 0), 0);
  const buyTotal = purchases.reduce((sum, i) => sum + (i.pricing?.display?.buyPrice ?? 0), 0);
  const dueNow = rentTotal + depositTotal + buyTotal;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 md:px-0">
      <p className="font-mono text-xs uppercase tracking-wide text-brand-gold-deep">Signed in as {user.name}</p>
      <h1 className="mt-1 font-display text-3xl font-medium text-brand-navy">Checkout</h1>

      {items.length === 0 ? (
        <div className="mt-10 border border-brand-navy/12 bg-white px-6 py-14 text-center">
          <p className="font-ui text-sm text-brand-navy/55">Your bag is empty.</p>
          <Link
            href="/discover"
            className="mt-4 inline-block bg-brand-navy px-4 py-2 font-ui text-sm font-semibold text-white hover:bg-brand-navy-dark"
          >
            Continue browsing
          </Link>
        </div>
      ) : (
        <div className="mt-8 border border-brand-navy/12 bg-white">
          <ul className="divide-y divide-brand-navy/10">
            {items.map((item) => (
              <li key={`${item.productId}-${item.mode}`} className="flex gap-4 px-6 py-4">
                <div className="h-20 w-14 shrink-0">
                  <GarmentSwatch colorHex="#172b4d" name={lineName(item)} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-ui text-sm font-medium text-brand-navy">{lineName(item)}</p>
                  <p className="font-ui text-xs text-brand-navy/55">
                    Size {item.size} · {item.mode === "rent" ? "Rental" : "Purchase"}
                  </p>
                </div>
                <p className="shrink-0 font-mono text-sm text-brand-navy/80">
                  {formatMoney(
                    item.mode === "rent" ? item.pricing?.display?.rentPrice ?? 0 : item.pricing?.display?.buyPrice ?? 0,
                    item.pricing?.displayCurrency ?? currency
                  )}
                </p>
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

          <div className="border-t border-brand-navy/10 px-6 py-5">
            <button
              type="button"
              disabled
              title="Payment isn't wired up yet"
              className="w-full cursor-not-allowed bg-brand-navy py-3 font-ui text-sm font-semibold text-white opacity-40"
            >
              Place order
            </button>
            <p className="mt-2 text-center font-ui text-xs text-brand-navy/45">Payment isn&apos;t connected yet — this is an order preview.</p>
          </div>
        </div>
      )}
    </div>
  );
}
