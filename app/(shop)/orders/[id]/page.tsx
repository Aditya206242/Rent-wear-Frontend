import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { GarmentSwatch } from "@/components/shop/GarmentSwatch";
import { fetchOrderAction } from "@/lib/shop/order-actions";
import { formatMoney } from "@/lib/shop/format";
import { requireUser } from "@/lib/auth/session";
import { SHOP_ORDER_STEPS, SHOP_ORDER_TONE_CLASSES, shopOrderStepIndex, shopOrderTone } from "@/lib/shop/order-status";

export const metadata = { title: "Order — LoopWear" };

const PAID_STATUSES = new Set(["confirmed", "packed", "shipped", "with customer", "return in transit", "closed"]);

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireUser(`/orders/${id}`);

  const order = await fetchOrderAction(id);
  if (!order) notFound();

  const currency = order.pricing.displayCurrency;
  const paid = PAID_STATUSES.has(order.status);
  const tone = shopOrderTone(order.status);
  const currentStep = shopOrderStepIndex(order.status);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-0">
      <p className="font-ui text-[11px] font-semibold uppercase tracking-wide text-brand-cyan-deep">
        Order {order.id}
      </p>
      <div className="mt-1 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl font-medium text-brand-navy">
          {paid ? "You're all set." : "Almost there."}
        </h1>
        <span className={`rounded-full px-3 py-1 font-ui text-xs font-semibold ${SHOP_ORDER_TONE_CLASSES[tone]}`}>
          {order.statusLabel}
        </span>
      </div>
      <p className="mt-2 font-ui text-sm text-brand-navy/60">
        {paid
          ? "We've got your order — a confirmation is on its way."
          : "Payment hasn't been confirmed for this order yet."}
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr] lg:items-start">
        <div className="space-y-6">
          <div className="rounded-xl border border-brand-navy/10 bg-white px-6 py-5">
            <h2 className="font-display text-base font-semibold text-brand-navy">Order Information</h2>
            <dl className="mt-3 divide-y divide-brand-navy/8 font-ui text-sm">
              <div className="flex items-center justify-between py-2.5">
                <dt className="text-brand-navy/50">Order ID</dt>
                <dd className="font-medium text-brand-navy">{order.id}</dd>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <dt className="text-brand-navy/50">Order Date</dt>
                <dd className="font-medium text-brand-navy">
                  {new Date(order.placedAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </dd>
              </div>
              {order.eventDate && (
                <div className="flex items-center justify-between py-2.5">
                  <dt className="text-brand-navy/50">Event Date</dt>
                  <dd className="font-medium text-brand-navy">{new Date(order.eventDate).toLocaleDateString()}</dd>
                </div>
              )}
              <div className="flex items-center justify-between py-2.5">
                <dt className="text-brand-navy/50">Payment Status</dt>
                <dd>
                  <span className={`rounded-full px-2.5 py-0.5 font-ui text-[11px] font-semibold ${paid ? "bg-emerald-700/10 text-emerald-800" : "bg-amber-700/10 text-amber-800"}`}>
                    {paid ? "Paid" : "Pending"}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-brand-navy/10 bg-white px-6 py-5">
            <h2 className="font-display text-base font-semibold text-brand-navy">Product Information</h2>
            <ul className="mt-3 divide-y divide-brand-navy/8">
              {order.items?.map((item) => (
                <li key={item.id} className="flex gap-4 py-4 first:pt-3">
                  <div className="h-20 w-14 shrink-0 overflow-hidden rounded-lg">
                    <GarmentSwatch colorHex="#0B1F3A" name={item.product?.name ?? item.productId} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-ui text-sm font-medium text-brand-navy">
                      {item.product?.name ?? item.productId}
                    </p>
                    <p className="mt-1 font-ui text-xs text-brand-navy/55">
                      Size {item.size} · {item.mode === "rent" ? "Rental" : "Purchase"}
                      {item.rentReturnDate ? ` · return by ${new Date(item.rentReturnDate).toLocaleDateString()}` : ""}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-mono text-sm text-brand-navy/80">
                      {formatMoney(item.pricing.display.unitPrice, item.pricing.displayCurrency)}
                    </p>
                    {order.status === "closed" && (
                      <Link
                        href={`/product/${item.productId}`}
                        className="mt-1.5 inline-block font-ui text-xs font-semibold text-brand-cyan-deep hover:underline"
                      >
                        {item.mode === "rent" ? "Rent again" : "Buy again"}
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            <dl className="space-y-1.5 border-t border-brand-navy/8 pt-4 font-ui text-sm">
              {order.pricing.display.depositTotal > 0 && (
                <div className="flex justify-between text-brand-navy/50">
                  <dt>Refundable deposit</dt>
                  <dd className="font-mono">{formatMoney(order.pricing.display.depositTotal, currency)}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-brand-navy/8 pt-2 font-semibold text-brand-navy">
                <dt>Total</dt>
                <dd className="font-mono">{formatMoney(order.pricing.display.total, currency)}</dd>
              </div>
            </dl>
          </div>

          {order.city && (
            <div className="rounded-xl border border-brand-navy/10 bg-white px-6 py-5">
              <h2 className="font-display text-base font-semibold text-brand-navy">Delivery Information</h2>
              <dl className="mt-3 divide-y divide-brand-navy/8 font-ui text-sm">
                <div className="flex items-center justify-between py-3">
                  <dt className="text-brand-navy/50">Delivery City</dt>
                  <dd className="font-medium text-brand-navy">{order.city}</dd>
                </div>
              </dl>
            </div>
          )}
        </div>

        {/* timeline — view only, no status controls */}
        <div className="rounded-xl border border-brand-navy/10 bg-white px-6 py-5">
          <h2 className="font-display text-base font-semibold text-brand-navy">Order Timeline</h2>
          <ol className="mt-4">
            {SHOP_ORDER_STEPS.map((step, i) => {
              const done = i < currentStep;
              const current = i === currentStep;
              const last = i === SHOP_ORDER_STEPS.length - 1;
              return (
                <li key={step.key} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                        done
                          ? "bg-emerald-600"
                          : current
                            ? "bg-brand-cyan ring-4 ring-brand-cyan/20"
                            : "border-2 border-brand-navy/15 bg-white"
                      }`}
                    >
                      {done && <Check size={11} strokeWidth={3} className="text-white" />}
                      {current && <span className="h-1.5 w-1.5 rounded-full bg-brand-navy-dark" />}
                    </span>
                    {!last && <span className={`w-px flex-1 ${done ? "bg-emerald-600" : "bg-brand-navy/15"}`} style={{ minHeight: 32 }} />}
                  </div>
                  <div className={`pb-6 ${last ? "pb-0" : ""}`}>
                    <p className={`font-ui text-[13.5px] font-semibold ${done || current ? "text-brand-navy" : "text-brand-navy/45"}`}>
                      {step.label}
                    </p>
                    <p className="mt-0.5 font-ui text-xs text-brand-navy/45">{step.description}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      <Link
        href="/discover"
        className="mt-8 inline-block rounded-lg bg-brand-navy px-5 py-2.5 font-ui text-sm font-semibold text-white transition-colors hover:bg-brand-navy-dark"
      >
        Continue browsing
      </Link>
    </div>
  );
}
