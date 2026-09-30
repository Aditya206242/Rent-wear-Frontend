import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { GarmentSwatch } from "@/components/shop/GarmentSwatch";
import { OrderTimeline } from "@/components/shop/orders/OrderTimeline";
import { CancelOrderButton, CompletePaymentButton, PaymentSettlingPoller } from "@/components/shop/orders/OrderPaymentActions";
import { fetchOrderAction } from "@/lib/shop/order-actions";
import { formatMoney } from "@/lib/shop/format";
import { requireUser } from "@/lib/auth/session";
import type { ApiOrderDetail } from "@/lib/shop/checkout-types";

export const metadata = { title: "Order — LoopWear" };

const PAID_STATUSES = new Set(["confirmed", "packed", "shipped", "with_customer", "return_in_transit", "closed"]);

function date(iso: string | null, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" }) {
  return iso ? new Date(iso).toLocaleDateString(undefined, opts) : "—";
}

function time(iso: string | null) {
  return iso ? new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }) : "—";
}

function heading(order: ApiOrderDetail, justPlaced: boolean) {
  if (PAID_STATUSES.has(order.status)) {
    return { icon: <CheckCircle2 size={28} strokeWidth={1.75} className="text-emerald-600" />, title: justPlaced ? "Order confirmed!" : "You're all set.", tone: "text-emerald-800" };
  }
  if (order.status === "pending_payment") {
    return { icon: <Clock size={28} strokeWidth={1.75} className="text-signal-warning" />, title: "Almost there.", tone: "text-signal-warning" };
  }
  return { icon: <XCircle size={28} strokeWidth={1.75} className="text-signal-danger" />, title: order.statusLabel, tone: "text-signal-danger" };
}

export default async function OrderPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ placed?: string }> }) {
  const { id } = await params;
  const { placed } = await searchParams;
  await requireUser(`/orders/${id}`);

  const order = await fetchOrderAction(id);
  if (!order) notFound();

  const justPlaced = placed === "1";
  const paid = PAID_STATUSES.has(order.status);
  const currency = order.pricing.displayCurrency;
  const d = order.pricing.display;
  const head = heading(order, justPlaced);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-0">
      <p className="font-ui text-[11px] font-semibold uppercase tracking-wide text-brand-cyan-deep">Order {order.id}</p>
      <div className="mt-1 flex flex-wrap items-center gap-3">
        {head.icon}
        <h1 className="font-display text-3xl font-medium text-brand-navy">{head.title}</h1>
        <span className={`rounded-full bg-brand-surface px-3 py-1 font-ui text-xs font-semibold ${head.tone}`}>{order.statusLabel}</span>
      </div>

      {paid && justPlaced && (
        <p className="mt-2 font-ui text-sm text-brand-navy/60">
          Thank you for your order. A confirmation is on its way to {order.delivery.email ?? "your email"}.
        </p>
      )}
      {order.status === "pending_payment" && justPlaced && <PaymentSettlingPoller orderId={order.id} status={order.status} />}
      {order.status === "pending_payment" && !justPlaced && (
        <p className="mt-2 font-ui text-sm text-brand-navy/60">
          {order.isPayable
            ? `Payment hasn't been completed. Your items are held until ${time(order.paymentExpiresAt)}.`
            : "The time to pay for this order has run out."}
        </p>
      )}
      {order.timeline.terminal?.message && <p className="mt-2 font-ui text-sm text-brand-navy/60">{order.timeline.terminal.message}</p>}

      {(order.isPayable || order.canCancel) && (
        <div className="mt-5 flex flex-wrap items-start gap-3">
          {order.isPayable && <CompletePaymentButton orderId={order.id} label={`Complete payment · ${formatMoney(d.grandTotal, currency)}`} />}
          {order.canCancel && <CancelOrderButton orderId={order.id} paid={paid} />}
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr] lg:items-start">
        <div className="space-y-6">
          <div className="rounded-xl border border-brand-navy/10 bg-white px-6 py-5">
            <h2 className="font-display text-base font-semibold text-brand-navy">Items</h2>
            <ul className="mt-3 divide-y divide-brand-navy/8">
              {order.lines.map((line) => (
                <li key={line.key} className="flex gap-4 py-4 first:pt-3">
                  <div className="h-20 w-14 shrink-0 overflow-hidden rounded-lg">
                    <GarmentSwatch colorHex="#0B1F3A" name={line.productName} imageUrl={line.imageUrl ?? undefined} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-ui text-sm font-medium text-brand-navy">{line.productName}</p>
                    <p className="mt-1 font-ui text-xs text-brand-navy/55">
                      {line.mode === "rent" ? "Rental" : "Purchase"}
                      {line.color ? ` · ${line.color}` : ""} · Size {line.size} · Qty {line.quantity}
                    </p>
                    {line.rentStartDate && (
                      <p className="font-ui text-xs text-brand-navy/45">
                        {date(line.rentStartDate, { day: "numeric", month: "short" })} – return by {date(line.rentReturnDate, { day: "numeric", month: "short" })}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-mono text-sm text-brand-navy/80">{formatMoney(line.pricing.display.lineTotal, currency)}</p>
                    {order.status === "closed" && (
                      <Link href={`/product/${line.productId}`} className="mt-1.5 inline-block font-ui text-xs font-semibold text-brand-cyan-deep hover:underline">
                        {line.mode === "rent" ? "Rent again" : "Buy again"}
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            <dl className="space-y-1.5 border-t border-brand-navy/8 pt-4 font-ui text-sm">
              <div className="flex justify-between text-brand-navy/70">
                <dt>Subtotal</dt>
                <dd className="font-mono">{formatMoney(d.subtotal, currency)}</dd>
              </div>
              {d.discount > 0 && (
                <div className="flex justify-between text-signal-success">
                  <dt>Discount{order.couponCode ? ` · ${order.couponCode}` : ""}</dt>
                  <dd className="font-mono">−{formatMoney(d.discount, currency)}</dd>
                </div>
              )}
              <div className="flex justify-between text-brand-navy/70">
                <dt>Delivery{order.deliveryMethod?.label ? ` · ${order.deliveryMethod.label}` : ""}</dt>
                <dd className="font-mono">{d.deliveryFee === 0 ? "Free" : formatMoney(d.deliveryFee, currency)}</dd>
              </div>
              {d.depositTotal > 0 && (
                <div className="flex justify-between text-brand-navy/50">
                  <dt>Refundable deposit</dt>
                  <dd className="font-mono">{formatMoney(d.depositTotal, currency)}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-brand-navy/8 pt-2 font-semibold text-brand-navy">
                <dt>{paid ? "Paid" : "Total"}</dt>
                <dd className="font-mono">{formatMoney(d.grandTotal, currency)}</dd>
              </div>
            </dl>

            {order.refunds.length > 0 && (
              <ul className="mt-3 space-y-1 border-t border-brand-navy/8 pt-3 font-ui text-xs text-brand-navy/60">
                {order.refunds.map((r) => (
                  <li key={r.id} className="flex justify-between">
                    <span>Refund · {r.status === "processed" ? "processed" : r.status === "failed" ? "being retried by our team" : "on its way (5–7 business days)"}</span>
                    <span className="font-mono">{formatMoney(r.pricing.display.amount, currency)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-brand-navy/10 bg-white px-6 py-5">
            <h2 className="font-display text-base font-semibold text-brand-navy">Delivery</h2>
            <div className="mt-3 grid gap-4 font-ui text-sm sm:grid-cols-2">
              <div>
                <p className="font-medium text-brand-navy">{order.delivery.fullName}</p>
                <p className="text-brand-navy/65">{order.delivery.addressLine1}</p>
                {order.delivery.addressLine2 && <p className="text-brand-navy/65">{order.delivery.addressLine2}</p>}
                <p className="text-brand-navy/65">
                  {order.delivery.city}, {order.delivery.state} {order.delivery.postalCode}
                </p>
                <p className="mt-1 text-brand-navy/50">{order.delivery.phone}</p>
              </div>
              <dl className="space-y-2">
                <div>
                  <dt className="text-xs text-brand-navy/45">Placed</dt>
                  <dd className="text-brand-navy">{date(order.placedAt)}</dd>
                </div>
                {order.deliveryMethod?.estimatedFrom && paid && (
                  <div>
                    <dt className="text-xs text-brand-navy/45">Estimated delivery</dt>
                    <dd className="text-brand-navy">
                      {date(order.deliveryMethod.estimatedFrom, { day: "numeric", month: "short" })} – {date(order.deliveryMethod.estimatedTo, { day: "numeric", month: "short" })}
                    </dd>
                  </div>
                )}
                {order.payment && (
                  <div>
                    <dt className="text-xs text-brand-navy/45">Payment</dt>
                    <dd className="capitalize text-brand-navy">
                      {order.payment.status === "paid" ? `Paid · ${order.payment.method.replace("_", " ")}` : order.payment.status.replace("_", " ")}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-brand-navy/10 bg-white px-6 py-5">
          <h2 className="font-display text-base font-semibold text-brand-navy">Track order</h2>
          <div className="mt-4">
            {order.status === "pending_payment" ? (
              <p className="font-ui text-sm text-brand-navy/55">Tracking starts once payment is confirmed.</p>
            ) : (
              <OrderTimeline timeline={order.timeline} />
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/discover" className="rounded-lg bg-brand-navy px-5 py-2.5 font-ui text-sm font-semibold text-white transition-colors hover:bg-brand-navy-dark">
          Continue shopping
        </Link>
        <Link href="/account/orders" className="rounded-lg border border-brand-navy/20 px-5 py-2.5 font-ui text-sm font-medium text-brand-navy hover:border-brand-navy/40">
          All orders
        </Link>
      </div>
    </div>
  );
}
