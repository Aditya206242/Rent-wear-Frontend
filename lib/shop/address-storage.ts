import type { DeliveryDetails } from "./types";

/**
 * There's no backend endpoint for a saved address book (see
 * lib/shop/checkout-actions.ts — checkout only accepts delivery details
 * inline per order). This persists the last-used one locally, the same way
 * lib/shop/cart-context.tsx persists a guest cart, so checkout and the
 * account address page can both start from it.
 */
const ADDRESS_KEY = "loopwear_delivery_address";

export function readSavedAddress(): DeliveryDetails | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ADDRESS_KEY);
    return raw ? (JSON.parse(raw) as DeliveryDetails) : null;
  } catch {
    return null;
  }
}

export function writeSavedAddress(address: DeliveryDetails) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ADDRESS_KEY, JSON.stringify(address));
  } catch {
    // Storage unavailable (private mode, quota) — address just won't
    // survive a reload, checkout still works with what's typed in.
  }
}
