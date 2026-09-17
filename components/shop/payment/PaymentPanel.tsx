"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createCheckoutAction,
  verifyRazorpayPaymentAction,
  confirmStripePaymentAction,
  type CheckoutResult,
  type DeliveryDetails,
} from "@/lib/shop/checkout-actions";
import { useShopCart } from "@/lib/shop/cart-context";
import { DeliveryFields } from "@/components/shop/DeliveryFields";
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
  const { address: savedAddress, saveAddress } = useShopCart();
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<Extract<CheckoutResult, { ok: true }> | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const deliveryForm = useRef<HTMLFormElement>(null);
  const [delivery, setDelivery] = useState<DeliveryDetails>({
    fullName: customer.name,
    email: customer.email,
    phone: customer.phone,
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    deliveryNote: "",
    ...savedAddress,
  });
  const appliedSavedAddress = useRef(false);

  // The saved address loads from localStorage a tick after mount (see
  // ShopProvider), so pick it up once it arrives rather than only at the
  // (still-empty) initial render — but only the first time, so it doesn't
  // clobber what the customer is actively typing.
  useEffect(() => {
    if (savedAddress && !appliedSavedAddress.current) {
      appliedSavedAddress.current = true;
      setDelivery((current) => ({ ...current, ...savedAddress }));
    }
  }, [savedAddress]);

  function reset() {
    setResult(null);
    setPhase("idle");
  }

  function updateDelivery<Key extends keyof DeliveryDetails>(key: Key, value: DeliveryDetails[Key]) {
    setDelivery((current) => ({ ...current, [key]: value }));
  }

  function placeOrder() {
    if (!deliveryForm.current?.reportValidity()) return;
    setError(null);
    setPhase("awaiting-gateway");
    saveAddress(delivery);
    startTransition(async () => {
      const res = await createCheckoutAction(idempotencyKey, delivery);
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
        <>
          <form ref={deliveryForm} className="mb-6 space-y-4" onSubmit={(event) => { event.preventDefault(); placeOrder(); }}>
            <div>
              <p className="font-ui text-sm font-semibold text-brand-navy">Delivery details</p>
              <p className="mt-1 font-ui text-xs text-brand-navy/55">Where should we deliver your order?</p>
            </div>
            <DeliveryFields value={delivery} onChange={updateDelivery} />
          </form>
          <button type="button" onClick={placeOrder} disabled={disabled || isPending} className="w-full cursor-pointer rounded-lg bg-brand-navy py-3 font-ui text-sm font-semibold text-white transition-colors hover:bg-brand-navy-dark disabled:cursor-not-allowed disabled:opacity-40">
            {isPending ? "Starting checkout…" : `Continue to payment · ${formatMoney(dueNow, currency)}`}
          </button>
        </>
      )}

      {result?.gateway === "razorpay" && phase === "awaiting-gateway" && (
        <>
          <p className="text-center font-ui text-xs text-brand-navy/55">Opening secure checkout…</p>
          <RazorpayCheckout
            order={result.order}
            payment={result.payment}
            customer={{ name: delivery.fullName, email: delivery.email, phone: delivery.phone }}
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
