import type { DeliveryDetails } from "./types";

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
