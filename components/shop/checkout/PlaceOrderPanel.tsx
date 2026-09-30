"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Lock, RotateCcw } from "lucide-react";
import {
  confirmStripePaymentAction,
  createPaymentSessionAction,
  placeOrderAction,
  reportPaymentFailureAction,
  verifyRazorpayPaymentAction,
} from "@/lib/shop/checkout-actions";
import { formatMoney } from "@/lib/shop/format";
import { RazorpayCheckout, type RazorpayFailure } from "@/components/shop/payment/RazorpayCheckout";
import { StripeCardForm } from "@/components/shop/payment/StripeCardForm";
import type { ApiOrderPreview, ApiPaymentSession } from "@/lib/shop/checkout-types";

type Phase = "ready" | "placing" | "paying" | "verifying" | "interrupted" | "expired";

const CART_CODES = new Set(["cart_invalid", "cart_empty", "out_of_stock", "variant_unavailable", "product_unavailable", "coupon_invalid", "rental_date_invalid"]);

function holdUntil(iso: string | null) {
  return iso ? new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }) : null;
}

/**
 * Place order → pay → verify, driven entirely by backend state:
 *  - the order is created with the total the customer just reviewed
 *    (`expectedTotalPaise`); if the backend's recomputed total differs it
 *    refuses (`price_changed`) and the review screen refreshes;
 *  - the idempotency key is fixed for this reviewed total (the parent
 *    remounts this panel when it changes), so retries never duplicate;
 *  - a failed or abandoned payment leaves the order payable until its hold
 *    expires; "Retry payment" re-opens the same gateway order;
 *  - the order is only shown as placed after the backend verifies payment.
 */
export function PlaceOrderPanel({
  preview,
  addressId,
  deliveryMethod,
  idempotencyKey,
  disabled,
  onPriceChanged,
  onCartChanged,
  onRestart,
}: {
  preview: ApiOrderPreview;
  addressId: string;
  deliveryMethod: string;
  idempotencyKey: string;
  disabled: boolean;
  onPriceChanged: (fresh: ApiOrderPreview) => void;
  onCartChanged: () => void;
  /** Start a fresh attempt (new idempotency key) — after the old order's hold expired. */
  onRestart: () => void;
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("ready");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [session, setSession] = useState<ApiPaymentSession | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  // A ref, not state: Razorpay keeps the callbacks it was opened with, so
  // onDismiss must read the latest failure through something mutable.
  const lastFailure = useRef<string | null>(null);
  const [, startTransition] = useTransition();

  const total = formatMoney(preview.pricing.display.grandTotal, preview.pricing.displayCurrency);

  function goToOrder(id: string) {
    router.push(`/orders/${encodeURIComponent(id)}?placed=1`);
  }

  function placeOrder() {
    setMessage(null);
    setPhase("placing");
    startTransition(async () => {
      const res = await placeOrderAction({ addressId, deliveryMethod, expectedTotalPaise: preview.expectedTotalPaise }, idempotencyKey);
      if (!res.ok) {
        setPhase("ready");
        if (res.code === "price_changed") {
          const fresh = (res.details as { preview?: ApiOrderPreview } | undefined)?.preview;
          setMessage("Some prices changed since you started checking out. Please review the new total and place your order again.");
          if (fresh) onPriceChanged(fresh);
          else onCartChanged();
        } else if (CART_CODES.has(res.code)) {
          setMessage(res.error);
          onCartChanged();
        } else if (res.code === "unauthorized") {
          router.push("/sign-in?redirectTo=/checkout");
        } else {
          setMessage(res.error);
        }
        return;
      }

      const { order, payment, paymentError } = res.data;
      setOrderId(order.id);
      if (order.status !== "pending_payment") return goToOrder(order.id);
      if (payment) {
        setSession(payment);
        setAttempt((a) => a + 1);
        setPhase("paying");
      } else {
        setMessage(paymentError?.message ?? "We couldn't start the payment.");
        setPhase("interrupted");
      }
    });
  }

  function retryPayment() {
    if (!orderId) return;
    setMessage(null);
    lastFailure.current = null;
    setPhase("placing");
    startTransition(async () => {
      const res = await createPaymentSessionAction(orderId);
      if (res.ok) {
        setSession(res.data);
        setAttempt((a) => a + 1);
        setPhase("paying");
        return;
      }
      setMessage(res.error);
      setPhase(res.code === "order_expired" || res.code === "order_not_payable" ? "expired" : "interrupted");
    });
  }

  function verifyRazorpay(response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
    setPhase("verifying");
    startTransition(async () => {
      const res = await verifyRazorpayPaymentAction(response);
      if (res.ok) return goToOrder(res.data.order.id);
      setMessage(res.error);
      setPhase("interrupted");
    });
  }

  function onFailedAttempt(failure: RazorpayFailure) {
    lastFailure.current = failure.description ?? "The payment was declined";
    if (orderId) {
      reportPaymentFailureAction({
        orderId,
        kind: "failed",
        razorpayPaymentId: failure.paymentId,
        code: failure.code,
        description: failure.description,
        reason: failure.reason,
      });
    }
  }

  function onDismiss() {
    if (orderId) reportPaymentFailureAction({ orderId, kind: "dismissed" });
    setMessage(lastFailure.current ? `Payment failed: ${lastFailure.current}` : "The payment wasn't completed.");
    setPhase("interrupted");
  }

  function confirmStripe(paymentIntentId: string) {
    setPhase("verifying");
    startTransition(async () => {
      const res = await confirmStripePaymentAction(paymentIntentId);
      if (res.ok) return goToOrder(res.data.orderId);
      setMessage(res.error);
      setPhase("interrupted");
    });
  }

  const busy = phase === "placing" || phase === "verifying";

  return (
    <div className="mt-5">
      {message && (
        <div role="alert" className="mb-3 flex items-start gap-2 rounded-lg border border-signal-danger/25 bg-signal-danger/6 px-3.5 py-3">
          <AlertCircle size={15} strokeWidth={1.75} className="mt-0.5 shrink-0 text-signal-danger" />
          <p className="font-ui text-xs text-signal-danger">{message}</p>
        </div>
      )}

      {(phase === "ready" || phase === "placing") && (
        <button
          type="button"
          onClick={placeOrder}
          disabled={disabled || busy}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-navy py-3.5 font-ui text-sm font-semibold text-white transition-colors hover:bg-brand-navy-dark disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Lock size={14} strokeWidth={2} />
          {phase === "placing" ? "Placing your order…" : `Place order & pay ${total}`}
        </button>
      )}

      {phase === "paying" && session?.gateway === "razorpay" && (
        <>
          <p className="text-center font-ui text-xs text-brand-navy/55">Complete the payment in the secure Razorpay window…</p>
          <RazorpayCheckout
            key={attempt}
            session={session}
            orderLabel={`Order ${session.orderId}`}
            onPaid={verifyRazorpay}
            onFailedAttempt={onFailedAttempt}
            onDismiss={onDismiss}
            onError={(m) => {
              setMessage(m);
              setPhase("interrupted");
            }}
          />
        </>
      )}

      {phase === "paying" && session?.gateway === "stripe" && (
        <StripeCardForm
          clientSecret={session.clientSecret}
          onPaid={confirmStripe}
          onError={(m) => {
            setMessage(m);
          }}
        />
      )}

      {phase === "verifying" && <p className="py-3 text-center font-ui text-sm text-brand-navy/60">Confirming your payment with the bank…</p>}

      {phase === "interrupted" && orderId && (
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={retryPayment}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-navy py-3.5 font-ui text-sm font-semibold text-white transition-colors hover:bg-brand-navy-dark"
          >
            <RotateCcw size={14} strokeWidth={2} />
            Retry payment · {total}
          </button>
          <p className="text-center font-ui text-xs text-brand-navy/50">
            Your items are reserved{session?.expiresAt ? ` until ${holdUntil(session.expiresAt)}` : ""} and your bag is unchanged.{" "}
            <Link href={`/orders/${encodeURIComponent(orderId)}`} className="font-semibold text-brand-cyan-deep hover:underline">
              View order
            </Link>
          </p>
        </div>
      )}

      {phase === "expired" && (
        <button
          type="button"
          onClick={onRestart}
          className="w-full rounded-lg border border-brand-navy/20 py-3 font-ui text-sm font-semibold text-brand-navy hover:bg-brand-cream"
        >
          Start checkout again
        </button>
      )}

      {phase === "ready" && !message && (
        <p className="mt-2 text-center font-ui text-xs text-brand-navy/45">
          Your items are held for {preview.holdMinutes} minutes while you pay. Nothing is charged until you confirm in the payment window.
        </p>
      )}
    </div>
  );
}
