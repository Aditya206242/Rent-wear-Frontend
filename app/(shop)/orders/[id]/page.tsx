import Link from "next/link";
import { notFound } from "next/navigation";
import { GarmentSwatch } from "@/components/shop/GarmentSwatch";
import { fetchOrderAction } from "@/lib/shop/order-actions";
import { formatMoney } from "@/lib/shop/format";
import { requireUser } from "@/lib/auth/session";

export const metadata = { title: "Order — LoopWear" };

const PAID_STATUSES = new Set(["confirmed", "packed", "shipped", "with customer", "return in transit", "closed"]);

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireUser(`/orders/${id}`);

  const order = await fetchOrderAction(id);
  if (!order) notFound();

  const currency = order.pricing.displayCurrency;
  const paid = PAID_STATUSES.has(order.status);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 md:px-0">
      <p className="font-mono text-xs uppercase tracking-wide text-brand-gold-deep">
        Order {order.id} · {order.statusLabel}
      </p>
      <h1 className="mt-1 font-display text-3xl font-medium text-brand-navy">
        {paid ? "You're all set." : "Almost there."}
      </h1>
      <p className="mt-2 font-ui text-sm text-brand-navy/60">
        {paid
          ? "We've got your order — a confirmation is on its way."
          : "Payment hasn't been confirmed for this order yet."}
      </p>

      <div className="mt-8 border border-brand-navy/12 bg-white">
        <ul className="divide-y divide-brand-navy/10">
          {order.items?.map((item) => (
            <li key={item.id} className="flex gap-4 px-6 py-4">
              <div className="h-20 w-14 shrink-0">
                <GarmentSwatch colorHex="#172b4d" name={item.product?.name ?? item.productId} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-ui text-sm font-medium text-brand-navy">
                  {item.product?.name ?? item.productId}
                </p>
                <p className="font-ui text-xs text-brand-navy/55">
                  Size {item.size} · {item.mode === "rent" ? "Rental" : "Purchase"}
                  {item.rentReturnDate ? ` · return by ${new Date(item.rentReturnDate).toLocaleDateString()}` : ""}
                </p>
              </div>
              <p className="shrink-0 font-mono text-sm text-brand-navy/80">
                {formatMoney(item.pricing.display.unitPrice, item.pricing.displayCurrency)}
              </p>
            </li>
          ))}
        </ul>

        <dl className="space-y-1.5 border-t border-brand-navy/10 px-6 py-5 font-ui text-sm">
          {order.pricing.display.depositTotal > 0 && (
            <div className="flex justify-between text-brand-navy/50">
              <dt>Refundable deposit</dt>
              <dd className="font-mono">{formatMoney(order.pricing.display.depositTotal, currency)}</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-brand-navy/10 pt-2 font-semibold text-brand-navy">
            <dt>Total</dt>
            <dd className="font-mono">{formatMoney(order.pricing.display.total, currency)}</dd>
          </div>
        </dl>
      </div>

      <Link
        href="/discover"
        className="mt-6 inline-block bg-brand-navy px-4 py-2 font-ui text-sm font-semibold text-white hover:bg-brand-navy-dark"
      >
        Continue browsing
      </Link>
    </div>
  );
}
