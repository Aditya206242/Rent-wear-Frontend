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
import type { CartLine, RentOrBuy } from "./types";

type CartContextValue = {
  lines: CartLine[];
  addLine: (input: CartLine) => void;
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
      ? { id: item.product.id, name: item.product.name, brand: item.product.brand, colorHex: "#172b4d" }
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
  const mergedGuestCart = useRef(false);

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

  const addLine = useCallback(
    (input: CartLine) => {
      // The bag itself doesn't require an account — only checkout does — so
      // guests get a locally-persisted cart instead of being bounced to
      // sign-in. Optimistic either way: show it immediately, reconcile with
      // the server's response (real pricing/product data) once it lands.
      setLines((prev) => {
        const next = [...prev.filter((l) => !(l.garmentId === input.garmentId && l.mode === input.mode)), input];
        if (!isAuthenticated) writeGuestCart(next);
        return next;
      });

      if (isAuthenticated) {
        addCartItemAction(input).then((res) => {
          if ("items" in res) setLines(res.items.map(adaptCartItem));
        });
      }
    },
    [isAuthenticated]
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
      removeLine,
      rentalCount: lines.filter((l) => l.mode === "rent").length,
      purchaseCount: lines.filter((l) => l.mode === "buy").length,
      wishlist,
      toggleWishlist,
      isWishlisted,
      isAuthenticated,
      requireAuth,
    }),
    [lines, addLine, removeLine, wishlist, toggleWishlist, isWishlisted, isAuthenticated, requireAuth]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useShopCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useShopCart must be used within ShopProvider");
  return ctx;
}
