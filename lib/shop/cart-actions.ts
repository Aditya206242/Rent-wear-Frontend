"use server";

import { getToken } from "@/lib/auth/session";
import { apiFetch } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import type { AddCartLineInput, RentOrBuy } from "./types";

/**
 * Thin server-side proxies to the real backend's cart/wishlist endpoints.
 * These exist because the session token lives in an httpOnly cookie (can't
 * be read by client JS, by design — see lib/auth/session.ts) but the cart
 * UI is a client component. Server Actions run server-side, so they can
 * read the cookie and attach the Bearer token; the client just calls these
 * like any other async function.
 */

export type ApiCartItem = {
  productId: string;
  mode: RentOrBuy;
  size: string;
  startDate?: string;
  product?: { id: string; name: string; brand: string };
  pricing?: { displayCurrency: string; display: Record<string, number> };
};

export async function fetchCartAction(): Promise<{ items: ApiCartItem[] }> {
  const token = await getToken();
  if (!token) return { items: [] };
  try {
    return await apiFetch<{ items: ApiCartItem[] }>("/cart", { token });
  } catch {
    return { items: [] };
  }
}

export async function addCartItemAction(input: AddCartLineInput): Promise<{ items: ApiCartItem[] } | { error: string }> {
  const token = await getToken();
  if (!token) return { error: "Sign in to add items to your bag." };
  // The backend's cart body is keyed by `productId` (see
  // BACKEND_API_SPEC.md) — `garmentId` is this app's own name for the same
  // value, so translate it at this boundary rather than downstream.
  const { garmentId, ...rest } = input;
  try {
    return await apiFetch<{ items: ApiCartItem[] }>("/cart/items", {
      method: "POST",
      token,
      body: { productId: garmentId, ...rest },
    });
  } catch (error) {
    return { error: error instanceof ApiError ? error.message : "Couldn't add that to your bag." };
  }
}

export async function removeCartItemAction(garmentId: string, mode: RentOrBuy): Promise<void> {
  const token = await getToken();
  if (!token) return;
  await apiFetch<void>(`/cart/items/${garmentId}`, { method: "DELETE", token, searchParams: { mode } }).catch(() => {});
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
