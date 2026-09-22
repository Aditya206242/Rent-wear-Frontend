"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  fetchCartAction,
  addCartItemAction,
  removeCartItemAction,
  fetchWishlistAction,
  addWishlistItemAction,
  removeWishlistItemAction,
  type ApiCartItem,
} from "./cart-actions";
import { readSavedAddress, writeSavedAddress } from "./address-storage";
import type { CartLine, DeliveryDetails, RentOrBuy } from "./types";

type CartContextValue = {
  lines: CartLine[];
  addLine: (input: CartLine) => void;
  /** Adds the line and sends the shopper straight to checkout — for a card's "Buy" action rather than "add and keep browsing". */
  buyNow: (input: CartLine) => void;
  removeLine: (garmentId: string, mode: RentOrBuy) => void;
  rentalCount: number;
  purchaseCount: number;
  wishlist: Set<string>;
  toggleWishlist: (garmentId: string) => void;
  isWishlisted: (garmentId: string) => boolean;
  /** The real wishlist API requires a signed-in account (no guest wishlist
   * endpoint exists) — components use this to redirect to sign-in instead
   * of silently failing. The bag itself works for guests (see addLine). */
  isAuthenticated: boolean;
  requireAuth: (redirectTo?: string) => void;
  /** Last delivery address used at checkout — kept locally (see
   * lib/shop/address-storage.ts) and offered back on the next order. */
  address: DeliveryDetails | null;
  saveAddress: (address: DeliveryDetails) => void;
  /** Set when a signed-in add-to-bag call fails server-side — the line is
   * rolled back from `lines` when this happens, so the bag (and checkout,
   * which reads the cart fresh from the backend) never shows an item that
   * wasn't actually saved. */
  cartError: string | null;
  dismissCartError: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const GUEST_CART_KEY = "loopwear_guest_cart";

function readGuestCart(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(GUEST_CART_KEY);
    return raw ? (JSON.parse(raw) as CartLine[]) : [];
  } catch {
    return [];
  }
}

function writeGuestCart(lines: CartLine[]) {
  if (typeof window === "undefined") return;
  try {
    if (lines.length === 0) window.localStorage.removeItem(GUEST_CART_KEY);
    else window.localStorage.setItem(GUEST_CART_KEY, JSON.stringify(lines));
  } catch {
    // Storage unavailable (private mode, quota) — the bag still works for
    // this tab via React state, it just won't survive a reload.
  }
}

function adaptCartItem(item: ApiCartItem): CartLine {
  return {
    garmentId: item.productId,
    mode: item.mode,
    size: item.size,
    startDate: item.startDate,
    product: item.product
      ? {
          id: item.product.id,
          name: item.product.name,
          brand: item.product.brand,
          colorHex: item.product.colorHex ?? "#172b4d",
          imageUrls: item.product.imageUrls,
        }
      : undefined,
    currency: item.pricing?.displayCurrency,
    rentPrice: item.pricing?.display?.rentPrice,
    deposit: item.pricing?.display?.deposit,
    buyPrice: item.pricing?.display?.buyPrice,
  };
}

export function ShopProvider({ children, isAuthenticated }: { children: ReactNode; isAuthenticated: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const [lines, setLines] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [address, setAddress] = useState<DeliveryDetails | null>(null);
  const [cartError, setCartError] = useState<string | null>(null);
  const mergedGuestCart = useRef(false);
  const dismissCartError = useCallback(() => setCartError(null), []);

  useEffect(() => {
    setAddress(readSavedAddress());
  }, []);

  const saveAddress = useCallback((next: DeliveryDetails) => {
    setAddress(next);
    writeSavedAddress(next);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setLines(readGuestCart());
      return;
    }

    let cancelled = false;

    async function syncSignedInCart() {
      // A guest may have added items before signing in — fold them into the
      // real account cart once, then clear the local copy.
      const guestLines = readGuestCart();
      if (!mergedGuestCart.current && guestLines.length > 0) {
        mergedGuestCart.current = true;
        await Promise.all(guestLines.map((line) => addCartItemAction(line)));
        writeGuestCart([]);
      }

      const res = await fetchCartAction();
      if (!cancelled) setLines(res.items.map(adaptCartItem));
    }

    syncSignedInCart();
    fetchWishlistAction().then((res) => {
      if (!cancelled) setWishlist(new Set(res.items.map((i) => i.productId)));
    });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const requireAuth = useCallback(
    (redirectTo?: string) => {
      router.push(`/sign-in?redirectTo=${encodeURIComponent(redirectTo ?? pathname)}`);
    },
    [router, pathname]
  );

  // Bug fix (checkout showed "Cart is empty" even right after adding an
  // item): this used to only update local React state + localStorage and
  // never actually called the backend, for EITHER guests or signed-in
  // users. That's fine for a guest (no backend cart exists for them yet —
  // it gets merged in on sign-in, see the effect above), but for a
  // signed-in user it meant the backend's real Cart row was never written
  // to at all. The checkout page displays this same local `lines` state, so
  // it looked fine right up until "Continue to payment" — which calls
  // POST /checkout on the backend, and the backend reads its OWN persisted
  // cart (not anything the client sends), found it empty, and rejected the
  // order. Now this actually calls addCartItemAction for a signed-in user,
  // same as removeLine already did for removals, and reconciles `lines`
  // with whatever the backend confirms it saved rather than trusting the
  // optimistic local guess.
  const addLine = useCallback(
    (input: CartLine) => {
      setLines((prev) => {
        const next = [...prev.filter((l) => !(l.garmentId === input.garmentId && l.mode === input.mode)), input];
        if (!isAuthenticated) writeGuestCart(next);
        return next;
      });

      if (!isAuthenticated) return;

      addCartItemAction(input).then((result) => {
        if ("error" in result) {
          setCartError(result.error);
          setLines((prev) => prev.filter((l) => !(l.garmentId === input.garmentId && l.mode === input.mode)));
          return;
        }
        setLines(result.items.map(adaptCartItem));
      });
    },
    [isAuthenticated]
  );

  const buyNow = useCallback(
    async (input: CartLine) => {
      setLines((prev) => {
        const next = [...prev.filter((l) => !(l.garmentId === input.garmentId && l.mode === input.mode)), input];
        if (!isAuthenticated) writeGuestCart(next);
        return next;
      });

      if (isAuthenticated) {
        // Awaited, not fire-and-forget: checkout reads the backend's cart,
        // so the write has to land before we navigate there, or the same
        // "empty cart" failure happens on a fast connection every time.
        const result = await addCartItemAction(input);
        if ("error" in result) {
          setCartError(result.error);
          setLines((prev) => prev.filter((l) => !(l.garmentId === input.garmentId && l.mode === input.mode)));
          return;
        }
        setLines(result.items.map(adaptCartItem));
      }

      router.push("/checkout");
    },
    [isAuthenticated, router]
  );

  const removeLine = useCallback(
    (garmentId: string, mode: RentOrBuy) => {
      setLines((prev) => {
        const next = prev.filter((l) => !(l.garmentId === garmentId && l.mode === mode));
        if (!isAuthenticated) writeGuestCart(next);
        return next;
      });
      if (isAuthenticated) removeCartItemAction(garmentId, mode);
    },
    [isAuthenticated]
  );

  const toggleWishlist = useCallback(
    (garmentId: string) => {
      if (!isAuthenticated) {
        requireAuth();
        return;
      }
      setWishlist((prev) => {
        const next = new Set(prev);
        if (next.has(garmentId)) {
          next.delete(garmentId);
          removeWishlistItemAction(garmentId);
        } else {
          next.add(garmentId);
          addWishlistItemAction(garmentId);
        }
        return next;
      });
    },
    [isAuthenticated, requireAuth]
  );

  const isWishlisted = useCallback((garmentId: string) => wishlist.has(garmentId), [wishlist]);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      addLine,
      buyNow,
      removeLine,
      rentalCount: lines.filter((l) => l.mode === "rent").length,
      purchaseCount: lines.filter((l) => l.mode === "buy").length,
      wishlist,
      toggleWishlist,
      isWishlisted,
      isAuthenticated,
      requireAuth,
      address,
      saveAddress,
      cartError,
      dismissCartError,
    }),
    [
      lines,
      addLine,
      buyNow,
      removeLine,
      wishlist,
      toggleWishlist,
      isWishlisted,
      isAuthenticated,
      requireAuth,
      address,
      saveAddress,
      cartError,
      dismissCartError,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useShopCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useShopCart must be used within ShopProvider");
  return ctx;
}
