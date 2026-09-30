"use server";

import { getToken } from "@/lib/auth/session";
import { apiFetch } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { toResult, signedOut, type ActionResult } from "./action-result";
import type { ApiCart, ApiMergeReport, ApiPriceChange } from "./checkout-types";
import type { RentOrBuy } from "./types";

/**
 * Thin server-side proxies to the backend's cart/wishlist endpoints. These
 * exist because the session token lives in an httpOnly cookie (can't be
 * read by client JS, by design — see lib/auth/session.ts) but the cart UI
 * is a client component. Server Actions run server-side, so they can read
 * the cookie and attach the Bearer token.
 *
 * Nothing here sends a price: the backend reads prices and stock from its
 * own database on every call.
 */

export type AddCartItemPayload = {
  productId: string;
  variantId?: string;
  mode: RentOrBuy;
  size: string;
  quantity: number;
  startDate?: string;
};

export async function fetchCartAction(): Promise<ActionResult<ApiCart>> {
  const token = await getToken();
  if (!token) return signedOut();
  return toResult(() => apiFetch<ApiCart>("/cart", { token, cache: "no-store" }), "Couldn't load your bag.");
}

export async function addCartItemAction(input: AddCartItemPayload): Promise<ActionResult<ApiCart>> {
  const token = await getToken();
  if (!token) return signedOut();
  return toResult(
    () =>
      apiFetch<ApiCart>("/cart/items", {
        method: "POST",
        token,
        body: {
          productId: input.productId,
          variantId: input.variantId,
          mode: input.mode,
          size: input.size,
          quantity: input.quantity,
          startDate: input.startDate || undefined,
        },
      }),
    "Couldn't add that to your bag."
  );
}

export async function updateCartItemAction(itemId: string, patch: { quantity?: number; startDate?: string | null }): Promise<ActionResult<ApiCart>> {
  const token = await getToken();
  if (!token) return signedOut();
  return toResult(
    () => apiFetch<ApiCart>(`/cart/items/${encodeURIComponent(itemId)}`, { method: "PATCH", token, body: patch }),
    "Couldn't update that item."
  );
}

export async function removeCartItemAction(itemId: string): Promise<ActionResult<ApiCart>> {
  const token = await getToken();
  if (!token) return signedOut();
  return toResult(async () => {
    await apiFetch<void>(`/cart/items/${encodeURIComponent(itemId)}`, { method: "DELETE", token });
    return apiFetch<ApiCart>("/cart", { token, cache: "no-store" });
  }, "Couldn't remove that item.");
}

export async function applyCouponAction(code: string): Promise<ActionResult<ApiCart>> {
  const token = await getToken();
  if (!token) return signedOut();
  return toResult(() => apiFetch<ApiCart>("/cart/coupon", { method: "POST", token, body: { code } }), "Couldn't apply that coupon.");
}

export async function removeCouponAction(): Promise<ActionResult<ApiCart>> {
  const token = await getToken();
  if (!token) return signedOut();
  return toResult(() => apiFetch<ApiCart>("/cart/coupon", { method: "DELETE", token }), "Couldn't remove the coupon.");
}

/** Run on entering checkout: re-checks stock/prices and reports prices that changed. */
export async function revalidateCartAction(): Promise<ActionResult<ApiCart & { priceChanges: ApiPriceChange[] }>> {
  const token = await getToken();
  if (!token) return signedOut();
  return toResult(
    () => apiFetch<ApiCart & { priceChanges: ApiPriceChange[] }>("/cart/revalidate", { method: "POST", token }),
    "Couldn't check your bag."
  );
}

/** Folds the guest (localStorage) bag into the account cart right after sign-in. */
export async function mergeGuestCartAction(
  lines: AddCartItemPayload[]
): Promise<ActionResult<ApiCart & { merge: ApiMergeReport }>> {
  const token = await getToken();
  if (!token) return signedOut();
  return toResult(
    () => apiFetch<ApiCart & { merge: ApiMergeReport }>("/cart/merge", { method: "POST", token, body: { lines } }),
    "Couldn't restore the items from your bag."
  );
}

export type ApiWishlistItem = {
  productId: string;
  addedAt: string;
  product?: { id: string; name: string; brand: string };
};

export async function fetchWishlistAction(): Promise<{ items: ApiWishlistItem[] }> {
  const token = await getToken();
  if (!token) return { items: [] };
  try {
    return await apiFetch<{ items: ApiWishlistItem[] }>("/wishlist", { token });
  } catch {
    return { items: [] };
  }
}

export async function addWishlistItemAction(garmentId: string): Promise<{ error?: string }> {
  const token = await getToken();
  if (!token) return { error: "Sign in to save items to your wishlist." };
  try {
    await apiFetch<void>(`/wishlist/${garmentId}`, { method: "PUT", token });
    return {};
  } catch (error) {
    return { error: error instanceof ApiError ? error.message : "Couldn't save that." };
  }
}

export async function removeWishlistItemAction(garmentId: string): Promise<void> {
  const token = await getToken();
  if (!token) return;
  await apiFetch<void>(`/wishlist/${garmentId}`, { method: "DELETE", token }).catch(() => {});
}
