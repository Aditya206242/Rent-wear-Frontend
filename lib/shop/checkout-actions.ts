"use server";

import { getToken } from "@/lib/auth/session";
import { apiFetch } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";

/**
 * Thin server-side proxies to the real backend's checkout/payments endpoints
 * — same reasoning as lib/shop/cart-actions.ts: the session token lives in
 * an httpOnly cookie, so only a Server Action can attach it, and the
 * payment UI itself is a client component.
 */

export type ApiCheckoutOrder = {
  id: string;
  status: string;
  currency: string;
  totalPaise: number;
  depositTotalPaise: number;
};

type ApiRazorpayPayment = {
  id: string;
  status: string;
  razorpayOrderId: string;
  razorpayKeyId: string;
  amount: number;
  currency: string;
};

type ApiStripePayment = {
  id: string;
  status: string;
  clientSecret: string;
};

type ApiPlainPayment = {
  id: string;
  status: string;
};

export type CheckoutResult =
  | { ok: true; order: ApiCheckoutOrder; gateway: "razorpay"; payment: ApiRazorpayPayment }
  | { ok: true; order: ApiCheckoutOrder; gateway: "stripe"; payment: ApiStripePayment }
  | { ok: true; order: ApiCheckoutOrder; gateway: "already_paid"; payment: ApiPlainPayment }
  | { ok: false; error: string };

/**
 * Creates the order (or returns the existing one for this idempotency key)
 * and, in the same call, the backend's chosen gateway's charge object:
 * a Razorpay order for INR, a Stripe PaymentIntent for everything else.
 * `idempotencyKey` must be generated once per checkout attempt on the
 * client and reused across retries — see PaymentPanel.
 */
export async function createCheckoutAction(idempotencyKey: string): Promise<CheckoutResult> {
  const token = await getToken();
  if (!token) return { ok: false, error: "Please sign in to place an order." };

  try {
    const data = await apiFetch<{
      order: ApiCheckoutOrder;
      payment: ApiRazorpayPayment | ApiStripePayment | ApiPlainPayment;
    }>("/checkout", { method: "POST", token, idempotencyKey, body: {} });

    const { payment } = data;
    if ("razorpayOrderId" in payment) return { ok: true, order: data.order, gateway: "razorpay", payment };
    if ("clientSecret" in payment) return { ok: true, order: data.order, gateway: "stripe", payment };
    return { ok: true, order: data.order, gateway: "already_paid", payment };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof ApiError ? error.message : "Couldn't start checkout. Please try again.",
    };
  }
}

export type ConfirmResult = { ok: true; orderId: string } | { ok: false; error: string };

/**
 * Razorpay Checkout hands the client a signature it can't have forged
 * (it's HMAC'd with a secret that never leaves the backend) — this just
 * relays what the widget returned so the backend can check it.
 */
export async function verifyRazorpayPaymentAction(input: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}): Promise<ConfirmResult> {
  const token = await getToken();
  if (!token) return { ok: false, error: "Please sign in." };

  try {
    const { payment } = await apiFetch<{ payment: { orderId: string } }>("/payments/razorpay/verify", {
      method: "POST",
      token,
      body: input,
    });
    return { ok: true, orderId: payment.orderId };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof ApiError ? error.message : "We couldn't confirm that payment. Please try again.",
    };
  }
}

export async function confirmStripePaymentAction(paymentIntentId: string): Promise<ConfirmResult> {
  const token = await getToken();
  if (!token) return { ok: false, error: "Please sign in." };

  try {
    const { payment } = await apiFetch<{ payment: { orderId: string } }>("/payments/confirm", {
      method: "POST",
      token,
      body: { paymentIntentId },
    });
    return { ok: true, orderId: payment.orderId };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof ApiError ? error.message : "We couldn't confirm that payment. Please try again.",
    };
  }
}
