"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import type { ApiCheckoutOrder } from "@/lib/shop/checkout-actions";

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
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
  handler: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
  modal: { ondismiss: () => void };
};

export function RazorpayCheckout({
  order,
  payment,
  customer,
  onPaid,
  onCancel,
  onError,
}: {
  order: ApiCheckoutOrder;
  payment: { razorpayOrderId: string; razorpayKeyId: string; amount: number; currency: string };
  customer: { name: string; email: string; phone: string };
  onPaid: (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => void;
  onCancel: () => void;
  onError: (message: string) => void;
}) {
  const [scriptReady, setScriptReady] = useState(false);
  const opened = useRef(false);

  // Opens automatically the moment the script is ready — the customer
  // already committed by clicking "Place order"; this widget IS that step,
  // not a second button to click.
  useEffect(() => {
    if (!scriptReady || opened.current) return;
    if (!window.Razorpay) {
      onError("Razorpay's checkout script didn't load. Check your connection and try again.");
      return;
    }
    opened.current = true;

    const rzp = new window.Razorpay({
      key: payment.razorpayKeyId,
      amount: payment.amount,
      currency: payment.currency,
      order_id: payment.razorpayOrderId,
      name: "LoopWear",
      description: `Order ${order.id}`,
      prefill: { name: customer.name, email: customer.email, contact: customer.phone },
      theme: { color: "#172b4d" },
      handler: onPaid,
      modal: { ondismiss: onCancel },
    });
    rzp.open();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scriptReady]);

  return <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" onReady={() => setScriptReady(true)} />;
}
