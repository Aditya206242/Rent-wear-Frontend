"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

type RazorpaySuccess = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
export type RazorpayFailure = { code?: string; description?: string; reason?: string; paymentId?: string };

type RazorpayInstance = {
  open: () => void;
  on: (event: "payment.failed", handler: (response: { error: { code?: string; description?: string; reason?: string; metadata?: { payment_id?: string } } }) => void) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  prefill: { name?: string; email?: string; contact?: string };
  theme: { color: string };
  retry: { enabled: boolean };
  handler: (response: RazorpaySuccess) => void;
  modal: { ondismiss: () => void; confirm_close: boolean };
};

/**
 * Opens Razorpay Checkout for a payment session the backend created. The
 * amount and Razorpay order come from the backend; nothing here decides
 * what's charged. A failed attempt (`payment.failed`) keeps the modal open
 * so the customer can try another method; `onDismiss` fires when they close
 * it. Success only hands the signed response to the caller to verify
 * server-side — it is not proof of payment on its own.
 */
export function RazorpayCheckout({
  session,
  orderLabel,
  onPaid,
  onFailedAttempt,
  onDismiss,
  onError,
}: {
  session: { razorpayOrderId: string; keyId: string; amount: number; currency: string; prefill: { name: string; email: string; contact: string } };
  orderLabel: string;
  onPaid: (response: RazorpaySuccess) => void;
  onFailedAttempt: (failure: RazorpayFailure) => void;
  onDismiss: () => void;
  onError: (message: string) => void;
}) {
  const [scriptReady, setScriptReady] = useState(typeof window !== "undefined" && !!window.Razorpay);
  const opened = useRef(false);

  useEffect(() => {
    if (!scriptReady || opened.current) return;
    if (!window.Razorpay) {
      onError("Razorpay's checkout didn't load. Check your connection and try again.");
      return;
    }
    opened.current = true;

    const rzp = new window.Razorpay({
      key: session.keyId,
      amount: session.amount,
      currency: session.currency,
      order_id: session.razorpayOrderId,
      name: "LoopWear",
      description: orderLabel,
      prefill: { name: session.prefill.name, email: session.prefill.email, contact: session.prefill.contact },
      theme: { color: "#172b4d" },
      retry: { enabled: true },
      handler: onPaid,
      modal: { ondismiss: onDismiss, confirm_close: true },
    });
    rzp.on("payment.failed", ({ error }) =>
      onFailedAttempt({ code: error?.code, description: error?.description, reason: error?.reason, paymentId: error?.metadata?.payment_id })
    );
    rzp.open();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scriptReady]);

  return <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" onReady={() => setScriptReady(true)} />;
}
