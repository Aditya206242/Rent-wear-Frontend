"use server";

import { getToken } from "@/lib/auth/session";
import { apiFetch } from "@/lib/api/client";
import { toResult, signedOut, type ActionResult } from "./action-result";
import type {
  ApiCheckoutSummary,
  ApiDeliveryOption,
  ApiOrderDetail,
  ApiOrderPreview,
  ApiOrderStatus,
  ApiPaymentSession,
  OrderStatus,
} from "./checkout-types";

/**
 * Server-side proxies for the checkout → order → payment flow. The session
 * token lives in an httpOnly cookie, so only a Server Action can attach it.
 * None of these send an amount the backend would trust: placing an order
 * only echoes back the total the backend itself quoted (`expectedTotalPaise`)
 * so it can refuse if anything changed since the review screen.
 */

export async function getCheckoutSummaryAction(): Promise<ActionResult<ApiCheckoutSummary>> {
  const token = await getToken();
  if (!token) return signedOut();
  return toResult(() => apiFetch<ApiCheckoutSummary>("/checkout", { token, cache: "no-store" }), "Couldn't load checkout.");
}

export async function getDeliveryOptionsAction(addressId: string): Promise<ActionResult<ApiDeliveryOption[]>> {
  const token = await getToken();
  if (!token) return signedOut();
  return toResult(
    async () => (await apiFetch<{ items: ApiDeliveryOption[] }>("/shipping/methods", { token, searchParams: { addressId }, cache: "no-store" })).items,
    "Couldn't load delivery options."
  );
}

export async function previewOrderAction(input: { addressId: string; deliveryMethod: string }): Promise<ActionResult<ApiOrderPreview>> {
  const token = await getToken();
  if (!token) return signedOut();
  return toResult(() => apiFetch<ApiOrderPreview>("/orders/preview", { method: "POST", token, body: input }), "Couldn't prepare your order summary.");
}

export type PlaceOrderResponse = {
  order: ApiOrderDetail;
  payment: ApiPaymentSession | null;
  paymentError: { code: string; message: string } | null;
  replayed: boolean;
};

/**
 * `idempotencyKey` is generated once per review of a given total and reused
 * on retries, so a double click or a flaky network can't create two orders.
 */
export async function placeOrderAction(
  input: { addressId: string; deliveryMethod: string; expectedTotalPaise: number },
  idempotencyKey: string
): Promise<ActionResult<PlaceOrderResponse>> {
  const token = await getToken();
  if (!token) return signedOut();
  return toResult(
    () => apiFetch<PlaceOrderResponse>("/orders", { method: "POST", token, idempotencyKey, body: input }),
    "Couldn't place your order. Nothing was charged — please try again."
  );
}

/** Opens (or re-opens, on retry) the payment widget for an unpaid order. */
export async function createPaymentSessionAction(orderId: string): Promise<ActionResult<ApiPaymentSession>> {
  const token = await getToken();
  if (!token) return signedOut();
  return toResult(() => apiFetch<ApiPaymentSession>("/payments/razorpay/order", { method: "POST", token, body: { orderId } }), "Couldn't start the payment.");
}

export type VerifyResponse = {
  status: "confirmed" | "already_processed" | "processing" | "refunded" | "refund_failed";
  order: { id: string; status: OrderStatus };
};

/**
 * Razorpay Checkout hands the browser a signature it can't forge (HMAC'd
 * with a secret that never leaves the backend) — this relays it so the
 * backend can check it and then confirm the payment with Razorpay itself.
 */
export async function verifyRazorpayPaymentAction(input: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}): Promise<ActionResult<VerifyResponse>> {
  const token = await getToken();
  if (!token) return signedOut();
  return toResult(
    () => apiFetch<VerifyResponse>("/payments/razorpay/verify", { method: "POST", token, body: input }),
    "We couldn't confirm that payment yet. If you were charged, your order will update automatically."
  );
}

/** Tells the backend a payment attempt failed or the widget was closed — the order stays payable. */
export async function reportPaymentFailureAction(input: {
  orderId: string;
  kind: "failed" | "dismissed";
  razorpayPaymentId?: string;
  code?: string;
  description?: string;
  reason?: string;
}): Promise<void> {
  const token = await getToken();
  if (!token) return;
  await apiFetch<void>("/payments/razorpay/failure", { method: "POST", token, body: input }).catch(() => {});
}

export async function confirmStripePaymentAction(paymentIntentId: string): Promise<ActionResult<{ orderId: string }>> {
  const token = await getToken();
  if (!token) return signedOut();
  return toResult(async () => {
    const { payment } = await apiFetch<{ payment: { orderId: string } }>("/payments/confirm", { method: "POST", token, body: { paymentIntentId } });
    return { orderId: payment.orderId };
  }, "We couldn't confirm that payment. Please try again.");
}

export async function getOrderStatusAction(orderId: string): Promise<ActionResult<ApiOrderStatus>> {
  const token = await getToken();
  if (!token) return signedOut();
  return toResult(() => apiFetch<ApiOrderStatus>(`/orders/${encodeURIComponent(orderId)}/status`, { token, cache: "no-store" }), "Couldn't load the order status.");
}

export async function cancelOrderAction(orderId: string): Promise<ActionResult<ApiOrderDetail>> {
  const token = await getToken();
  if (!token) return signedOut();
  return toResult(
    () => apiFetch<ApiOrderDetail>(`/orders/${encodeURIComponent(orderId)}/cancel`, { method: "POST", token }),
    "Couldn't cancel this order."
  );
}
