"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import {
  cancelOrderAction,
  createPaymentSessionAction,
  getOrderStatusAction,
  reportPaymentFailureAction,
  verifyRazorpayPaymentAction,
} from "@/lib/shop/checkout-actions";
import { RazorpayCheckout } from "@/components/shop/payment/RazorpayCheckout";
import type { ApiPaymentSession, OrderStatus } from "@/lib/shop/checkout-types";

/**
 * Right after checkout the payment may still be settling (the backend
 * answered "processing" because it couldn't reach Razorpay, or the webhook
 * hasn't landed). Poll the lightweight status endpoint for a while and
 * refresh the page as soon as the order moves on.
 */
export function PaymentSettlingPoller({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const router = useRouter();
  const [gaveUp, setGaveUp] = useState(false);

  useEffect(() => {
    if (status !== "pending_payment") return;
    let tries = 0;
    const timer = setInterval(async () => {
      tries += 1;
      const res = await getOrderStatusAction(orderId);
      if (res.ok && res.data.status !== "pending_payment") {
        clearInterval(timer);
        router.refresh();
      } else if (tries >= 20) {
        clearInterval(timer);
        setGaveUp(true);
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [orderId, status, router]);

  if (status !== "pending_payment") return null;
  return (
    <p className="mt-2 font-ui text-sm text-brand-navy/60">
      {gaveUp
        ? "We haven't received confirmation from the bank yet. If you were charged, this page will update automatically — or complete the payment below."
        : "Confirming your payment with the bank — this usually takes a few seconds…"}
    </p>
  );
}

/** "Complete payment" for an order that's still payable (failed/abandoned attempt). */
export function CompletePaymentButton({ orderId, label }: { orderId: string; label: string }) {
  const router = useRouter();
  const [session, setSession] = useState<ApiPaymentSession | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const lastFailure = useRef<string | null>(null);

  function open() {
    setError(null);
    lastFailure.current = null;
    startTransition(async () => {
      const res = await createPaymentSessionAction(orderId);
      if (!res.ok) {
        setError(res.error);
        if (res.code === "order_expired" || res.code === "order_not_payable") router.refresh();
        return;
      }
      if (res.data.gateway !== "razorpay") {
        setError("Please complete this payment from checkout.");
        return;
      }
      setSession(res.data);
      setAttempt((a) => a + 1);
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={open}
        disabled={isPending}
        className="flex items-center gap-2 rounded-lg bg-brand-navy px-5 py-2.5 font-ui text-sm font-semibold text-white transition-colors hover:bg-brand-navy-dark disabled:opacity-50"
      >
        <RotateCcw size={14} strokeWidth={2} />
        {isPending ? "Opening payment…" : label}
      </button>
      {error && (
        <p role="alert" className="mt-2 font-ui text-xs text-signal-danger">
          {error}
        </p>
      )}
      {session?.gateway === "razorpay" && (
        <RazorpayCheckout
          key={attempt}
          session={session}
          orderLabel={`Order ${orderId}`}
          onPaid={(response) =>
            startTransition(async () => {
              const res = await verifyRazorpayPaymentAction(response);
              setSession(null);
              if (!res.ok) setError(res.error);
              router.refresh();
            })
          }
          onFailedAttempt={(failure) => {
            lastFailure.current = failure.description ?? "The payment was declined";
            reportPaymentFailureAction({ orderId, kind: "failed", razorpayPaymentId: failure.paymentId, code: failure.code, description: failure.description, reason: failure.reason });
          }}
          onDismiss={() => {
            reportPaymentFailureAction({ orderId, kind: "dismissed" });
            setSession(null);
            setError(lastFailure.current ? `Payment failed: ${lastFailure.current}` : "The payment wasn't completed.");
          }}
          onError={(m) => {
            setSession(null);
            setError(m);
          }}
        />
      )}
    </div>
  );
}

export function CancelOrderButton({ orderId, paid }: { orderId: string; paid: boolean }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function cancel() {
    const prompt = paid ? "Cancel this order? You'll get a full refund to your original payment method." : "Cancel this order?";
    if (!window.confirm(prompt)) return;
    setError(null);
    startTransition(async () => {
      const res = await cancelOrderAction(orderId);
      if (!res.ok) setError(res.error);
      router.refresh();
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={cancel}
        disabled={isPending}
        className="rounded-lg border border-brand-navy/20 px-4 py-2.5 font-ui text-sm font-medium text-brand-navy/70 transition-colors hover:border-signal-danger/40 hover:text-signal-danger disabled:opacity-50"
      >
        {isPending ? "Cancelling…" : "Cancel order"}
      </button>
      {error && (
        <p role="alert" className="mt-2 font-ui text-xs text-signal-danger">
          {error}
        </p>
      )}
    </div>
  );
}
