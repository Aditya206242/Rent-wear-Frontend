"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createCheckoutAction,
  verifyRazorpayPaymentAction,
  confirmStripePaymentAction,
  type CheckoutResult,
} from "@/lib/shop/checkout-actions";
import { RazorpayCheckout } from "./RazorpayCheckout";
import { StripeCardForm } from "./StripeCardForm";
import { formatMoney } from "@/lib/shop/format";

type Customer = { name: string; email: string; phone: string };
type Phase = "idle" | "awaiting-gateway" | "verifying";

/**
 * Drives checkout end to end: creates the order, then hands off to
 * whichever gateway the backend picked for this currency (Razorpay's own
 * popup for INR, an in-page Stripe card form otherwise), then verifies the
 * result and lands on the order page. See docs/BACKEND_API_SPEC.md for the
 * two-lane gateway contract this mirrors.
 */
export function PaymentPanel({
  disabled,
  dueNow,
  currency,
  customer,
}: {
  disabled: boolean;
  dueNow: number;
  currency: string;
  customer: Customer;
}) {
  const router = useRouter();
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<Extract<CheckoutResult, { ok: true }> | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setResult(null);
    setPhase("idle");
  }

  function placeOrder() {
    setError(null);
    setPhase("awaiting-gateway");
    startTransition(async () => {
      const res = await createCheckoutAction(idempotencyKey);
      if (!res.ok) {
        setError(res.error);
        setPhase("idle");
        return;
      }
      setResult(res);

      if (res.gateway === "already_paid") {
        if (res.payment.status === "paid") {
          router.push(`/orders/${res.order.id}`);
        } else {
          setError("A payment is already in progress for this order — check your orders, or try again shortly.");
          reset();
        }
      }
    });
  }

  function handleRazorpayPaid(response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) {
    setPhase("verifying");
    startTransition(async () => {
      const res = await verifyRazorpayPaymentAction(response);
      if (res.ok) router.push(`/orders/${res.orderId}`);
      else {
        setError(res.error);
        reset();
      }
    });
  }

  function handleStripePaid(paymentIntentId: string) {
    setPhase("verifying");
    startTransition(async () => {
      const res = await confirmStripePaymentAction(paymentIntentId);
      if (res.ok) router.push(`/orders/${res.orderId}`);
      else {
        setError(res.error);
        reset();
      }
    });
  }

  const showPlaceOrderButton = phase === "idle";

  return (
    <div className="border-t border-brand-navy/10 px-6 py-5">
      {showPlaceOrderButton && (
        <button
          type="button"
          onClick={placeOrder}
          disabled={disabled || isPending}
          className="w-full cursor-pointer bg-brand-navy py-3 font-ui text-sm font-semibold text-white transition-colors hover:bg-brand-navy-dark disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isPending ? "Starting checkout…" : `Place order · ${formatMoney(dueNow, currency)}`}
        </button>
      )}

      {result?.gateway === "razorpay" && phase === "awaiting-gateway" && (
        <>
          <p className="text-center font-ui text-xs text-brand-navy/55">Opening secure checkout…</p>
          <RazorpayCheckout
            order={result.order}
            payment={result.payment}
            customer={customer}
            onPaid={handleRazorpayPaid}
            onCancel={reset}
            onError={(message) => {
              setError(message);
              reset();
            }}
          />
        </>
      )}

      {result?.gateway === "stripe" && phase === "awaiting-gateway" && (
        <StripeCardForm
          clientSecret={result.payment.clientSecret}
          onPaid={handleStripePaid}
          onError={(message) => setError(message)}
        />
      )}

      {phase === "verifying" && <p className="text-center font-ui text-sm text-brand-navy/60">Confirming your payment…</p>}

      {error && (
        <p role="alert" className="mt-3 text-center font-ui text-sm text-signal-danger">
          {error}
        </p>
      )}

      {!disabled && showPlaceOrderButton && !error && (
        <p className="mt-2 text-center font-ui text-xs text-brand-navy/45">
          You&apos;ll complete payment securely — nothing is charged until you confirm.
        </p>
      )}
    </div>
  );
}
