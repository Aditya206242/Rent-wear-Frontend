"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  fetchCartAction,
  addCartItemAction,
  updateCartItemAction,
  removeCartItemAction,
  mergeGuestCartAction,
  fetchWishlistAction,
  addWishlistItemAction,
  removeWishlistItemAction,
  type AddCartItemPayload,
} from "./cart-actions";
import { listAddressesAction } from "./address-actions";
import type { ApiAddress, ApiCart, ApiCartLine } from "./checkout-types";
import type { AddToBagInput, BagLine, BagSummary, GarmentView } from "./types";

/** Mirrors the backend's BUSINESS_RULES.cart.maxQuantityPerLine (the backend enforces it). */
export const MAX_QUANTITY_PER_LINE = 5;

type CartContextValue = {
  lines: BagLine[];
  summary: BagSummary | null;
  coupon: ApiCart["coupon"];
  itemCount: number;
  rentalCount: number;
  purchaseCount: number;
  /**
   * True once the bag reflects the real server cart (signed in — after any
   * guest-bag merge) or localStorage (guest). Checkout waits for this so it
   * never reads a half-merged cart.
   */
  cartSynced: boolean;
  /** Resolves true when the item made it into the bag; on failure `cartError` explains why. */
  addLine: (input: AddToBagInput) => Promise<boolean>;
  /** Adds the line and sends the shopper straight to checkout. */
  buyNow: (input: AddToBagInput) => Promise<void>;
  updateQuantity: (lineId: string, quantity: number) => Promise<void>;
  removeLine: (lineId: string) => Promise<void>;
  /** Replace the bag with a cart the server just returned (e.g. from checkout). */
  applyServerCart: (cart: ApiCart) => void;
  refreshCart: () => Promise<void>;
  busyLineIds: ReadonlySet<string>;
  wishlist: Set<string>;
  toggleWishlist: (garmentId: string) => void;
  isWishlisted: (garmentId: string) => boolean;
  isAuthenticated: boolean;
  requireAuth: (redirectTo?: string) => void;
  /** The account's default saved address (signed-in only). */
  defaultAddress: ApiAddress | null;
  refreshAddresses: () => Promise<void>;
  /** Why the last bag change failed (out of stock, unavailable…). */
  cartError: string | null;
  dismissCartError: () => void;
  /** What happened to guest items when they were moved into the account after sign-in. */
  mergeNotice: string | null;
  dismissMergeNotice: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

// ---------------------------------------------------------------------------
// Guest bag (localStorage). Display prices here are only for showing the bag;
// the backend re-prices everything when the guest signs in.
// ---------------------------------------------------------------------------

const GUEST_CART_KEY = "loopwear_guest_cart_v2";
const LEGACY_GUEST_CART_KEY = "loopwear_guest_cart";

type GuestLine = AddToBagInput & { key: string; quantity: number };

function guestKey(input: Pick<AddToBagInput, "productId" | "variantId" | "size" | "mode">) {
  return `${input.productId}:${input.variantId ?? "default"}:${input.size}:${input.mode}`;
}

type LegacyGuestLine = {
  garmentId: string;
  mode: "rent" | "buy";
  size: string;
  startDate?: string;
  product?: { name: string; brand: string; colorHex?: string; imageUrls?: Partial<Record<GarmentView, string>>; coverImageUrl?: string | null };
  currency?: string;
  rentPrice?: number;
  deposit?: number;
  buyPrice?: number;
};

/** Bags saved before colours/quantities existed are converted, not dropped. */
function fromLegacy(line: LegacyGuestLine): GuestLine {
  const input: AddToBagInput = {
    productId: line.garmentId,
    mode: line.mode,
    size: line.size,
    startDate: line.startDate,
    display: {
      name: line.product?.name ?? "Item",
      brand: line.product?.brand ?? "",
      colorHex: line.product?.colorHex ?? "#172b4d",
      imageUrl: line.product?.imageUrls?.model ?? line.product?.imageUrls?.front ?? line.product?.coverImageUrl ?? null,
      currency: line.currency ?? "INR",
      unitPrice: (line.mode === "rent" ? line.rentPrice : line.buyPrice) ?? 0,
      deposit: line.mode === "rent" ? line.deposit ?? 0 : 0,
    },
  };
  return { ...input, key: guestKey(input), quantity: 1 };
}

function readGuestCart(): GuestLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(GUEST_CART_KEY);
    if (raw) return JSON.parse(raw) as GuestLine[];
    const legacy = window.localStorage.getItem(LEGACY_GUEST_CART_KEY);
    return legacy ? (JSON.parse(legacy) as LegacyGuestLine[]).map(fromLegacy) : [];
  } catch {
    return [];
  }
}

function writeGuestCart(lines: GuestLine[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(LEGACY_GUEST_CART_KEY);
    if (lines.length === 0) window.localStorage.removeItem(GUEST_CART_KEY);
    else window.localStorage.setItem(GUEST_CART_KEY, JSON.stringify(lines));
  } catch {
    // Storage unavailable (private mode, quota) — the bag still works for
    // this tab via React state, it just won't survive a reload.
  }
}

function guestToBag(line: GuestLine): BagLine {
  return {
    id: line.key,
    productId: line.productId,
    variantId: line.variantId,
    mode: line.mode,
    size: line.size,
    quantity: line.quantity,
    startDate: line.startDate ?? null,
    name: line.display.name,
    brand: line.display.brand,
    color: line.display.color,
    colorHex: line.display.colorHex,
    imageUrl: line.display.imageUrl,
    currency: line.display.currency,
    unitPrice: line.display.unitPrice,
    deposit: line.display.deposit,
    lineTotal: line.display.unitPrice * line.quantity,
    status: "ok",
    issues: [],
    maxQuantity: MAX_QUANTITY_PER_LINE,
    guest: true,
  };
}

function guestSummary(lines: GuestLine[]): BagSummary | null {
  if (lines.length === 0) return null;
  const currency = lines[0].display.currency;
  const rentSubtotal = lines.filter((l) => l.mode === "rent").reduce((s, l) => s + l.display.unitPrice * l.quantity, 0);
  const buySubtotal = lines.filter((l) => l.mode === "buy").reduce((s, l) => s + l.display.unitPrice * l.quantity, 0);
  const depositTotal = lines.filter((l) => l.mode === "rent").reduce((s, l) => s + l.display.deposit * l.quantity, 0);
  const subtotal = rentSubtotal + buySubtotal;
  return { currency, rentSubtotal, buySubtotal, subtotal, discount: 0, depositTotal, total: subtotal, grandTotal: subtotal + depositTotal };
}

// ---------------------------------------------------------------------------
// Server cart → bag
// ---------------------------------------------------------------------------

function serverToBag(line: ApiCartLine): BagLine {
  return {
    id: line.id,
    productId: line.productId,
    variantId: line.variantId,
    mode: line.mode,
    size: line.size,
    quantity: line.quantity,
    startDate: line.startDate,
    name: line.product.name,
    brand: line.product.brand,
    color: line.variant.color,
    colorHex: line.variant.colorHex,
    imageUrl: line.product.imageUrl,
    currency: line.pricing.displayCurrency,
    unitPrice: line.pricing.display.unitPrice,
    deposit: line.pricing.display.deposit,
    lineTotal: line.pricing.display.lineTotal,
    status: line.status,
    issues: line.issues,
    maxQuantity: line.maxQuantity,
    guest: false,
  };
}

function serverSummary(cart: ApiCart): BagSummary | null {
  if (cart.items.length === 0) return null;
  const d = cart.summary.display;
  return {
    currency: cart.summary.displayCurrency,
    rentSubtotal: d.rentSubtotal,
    buySubtotal: d.buySubtotal,
    subtotal: d.subtotal,
    discount: d.discount,
    depositTotal: d.depositTotal,
    total: d.total,
    grandTotal: d.grandTotal,
  };
}

function toPayload(input: AddToBagInput, quantity: number): AddCartItemPayload {
  return { productId: input.productId, variantId: input.variantId, mode: input.mode, size: input.size, quantity, startDate: input.startDate };
}

export function ShopProvider({ children, isAuthenticated }: { children: ReactNode; isAuthenticated: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const [guestLines, setGuestLines] = useState<GuestLine[]>([]);
  const [serverCart, setServerCart] = useState<ApiCart | null>(null);
  const [cartSynced, setCartSynced] = useState(false);
  const [busyLineIds, setBusyLineIds] = useState<ReadonlySet<string>>(new Set());
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [defaultAddress, setDefaultAddress] = useState<ApiAddress | null>(null);
  const [cartError, setCartError] = useState<string | null>(null);
  const [mergeNotice, setMergeNotice] = useState<string | null>(null);
  const mergedGuestCart = useRef(false);
  // Guest edits are computed from the latest lines synchronously (a setState
  // updater may run later, so it can't be used to decide what to report).
  const guestLinesRef = useRef<GuestLine[]>([]);
  const setGuest = useCallback((next: GuestLine[]) => {
    guestLinesRef.current = next;
    writeGuestCart(next);
    setGuestLines(next);
  }, []);

  const dismissCartError = useCallback(() => setCartError(null), []);
  const dismissMergeNotice = useCallback(() => setMergeNotice(null), []);
  const applyServerCart = useCallback((cart: ApiCart) => setServerCart(cart), []);

  const markBusy = useCallback((id: string, busy: boolean) => {
    setBusyLineIds((prev) => {
      const next = new Set(prev);
      if (busy) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) return;
    const res = await fetchCartAction();
    if (res.ok) setServerCart(res.data);
  }, [isAuthenticated]);

  const refreshAddresses = useCallback(async () => {
    if (!isAuthenticated) return;
    const res = await listAddressesAction();
    if (res.ok) setDefaultAddress(res.data.find((a) => a.isDefault) ?? res.data[0] ?? null);
  }, [isAuthenticated]);

  useEffect(() => {
    let cancelled = false;
    setCartSynced(false);

    if (!isAuthenticated) {
      setServerCart(null);
      const stored = readGuestCart();
      guestLinesRef.current = stored;
      setGuestLines(stored);
      setCartSynced(true);
      return;
    }

    async function syncSignedInCart() {
      // A guest may have filled a bag before signing in — move it into the
      // account cart exactly once, then drop the local copy.
      const guest = readGuestCart();
      if (!mergedGuestCart.current && guest.length > 0) {
        mergedGuestCart.current = true;
        const merged = await mergeGuestCartAction(guest.map((l) => toPayload(l, l.quantity)));
        if (merged.ok) {
          setGuest([]);
          const problems = [...merged.data.merge.dropped, ...merged.data.merge.reduced].map((p) => p.message);
          if (problems.length > 0 && !cancelled) setMergeNotice(problems.join(" · "));
          if (!cancelled) {
            setServerCart(merged.data);
            setCartSynced(true);
          }
          return;
        }
        // Keep the local bag so nothing is lost; the next visit retries.
        if (!cancelled) setCartError(merged.error);
      }
      const res = await fetchCartAction();
      if (cancelled) return;
      if (res.ok) setServerCart(res.data);
      setCartSynced(true);
    }

    syncSignedInCart();
    refreshAddresses();
    fetchWishlistAction().then((res) => {
      if (!cancelled) setWishlist(new Set(res.items.map((i) => i.productId)));
    });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, refreshAddresses, setGuest]);

  const requireAuth = useCallback(
    (redirectTo?: string) => {
      router.push(`/sign-in?redirectTo=${encodeURIComponent(redirectTo ?? pathname)}`);
    },
    [router, pathname]
  );

  const addLine = useCallback(
    async (input: AddToBagInput) => {
      const quantity = input.quantity ?? 1;
      setCartError(null);

      if (!isAuthenticated) {
        const key = guestKey(input);
        const prev = guestLinesRef.current;
        const existing = prev.find((l) => l.key === key);
        const nextQty = (existing?.quantity ?? 0) + quantity;
        if (nextQty > MAX_QUANTITY_PER_LINE) {
          setCartError(`You can add at most ${MAX_QUANTITY_PER_LINE} of an item.`);
          return false;
        }
        setGuest(
          existing
            ? prev.map((l) => (l.key === key ? { ...l, ...input, key, quantity: nextQty } : l))
            : [...prev, { ...input, key, quantity }]
        );
        return true;
      }

      const res = await addCartItemAction(toPayload(input, quantity));
      if (!res.ok) {
        setCartError(res.status === 401 ? "Your session expired — please sign in again." : res.error);
        return false;
      }
      setServerCart(res.data);
      return true;
    },
    [isAuthenticated, setGuest]
  );

  const buyNow = useCallback(
    async (input: AddToBagInput) => {
      // Guests are sent to sign-in by the /checkout middleware and come back
      // with their bag merged into their account.
      if (await addLine(input)) router.push("/checkout");
    },
    [addLine, router]
  );

  const updateQuantity = useCallback(
    async (lineId: string, quantity: number) => {
      if (quantity < 1) return;
      setCartError(null);
      if (!isAuthenticated) {
        setGuest(guestLinesRef.current.map((l) => (l.key === lineId ? { ...l, quantity: Math.min(quantity, MAX_QUANTITY_PER_LINE) } : l)));
        return;
      }
      markBusy(lineId, true);
      const res = await updateCartItemAction(lineId, { quantity });
      markBusy(lineId, false);
      if (res.ok) setServerCart(res.data);
      else {
        setCartError(res.error);
        refreshCart();
      }
    },
    [isAuthenticated, markBusy, refreshCart, setGuest]
  );

  const removeLine = useCallback(
    async (lineId: string) => {
      setCartError(null);
      if (!isAuthenticated) {
        setGuest(guestLinesRef.current.filter((l) => l.key !== lineId));
        return;
      }
      markBusy(lineId, true);
      const res = await removeCartItemAction(lineId);
      markBusy(lineId, false);
      if (res.ok) setServerCart(res.data);
      else setCartError(res.error);
    },
    [isAuthenticated, markBusy, setGuest]
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

  const lines = useMemo<BagLine[]>(
    () => (isAuthenticated ? (serverCart?.items ?? []).map(serverToBag) : guestLines.map(guestToBag)),
    [isAuthenticated, serverCart, guestLines]
  );
  const summary = useMemo(
    () => (isAuthenticated ? (serverCart ? serverSummary(serverCart) : null) : guestSummary(guestLines)),
    [isAuthenticated, serverCart, guestLines]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      summary,
      coupon: isAuthenticated ? serverCart?.coupon ?? null : null,
      itemCount: lines.reduce((n, l) => n + l.quantity, 0),
      rentalCount: lines.filter((l) => l.mode === "rent").reduce((n, l) => n + l.quantity, 0),
      purchaseCount: lines.filter((l) => l.mode === "buy").reduce((n, l) => n + l.quantity, 0),
      cartSynced,
      addLine,
      buyNow,
      updateQuantity,
      removeLine,
      applyServerCart,
      refreshCart,
      busyLineIds,
      wishlist,
      toggleWishlist,
      isWishlisted,
      isAuthenticated,
      requireAuth,
      defaultAddress,
      refreshAddresses,
      cartError,
      dismissCartError,
      mergeNotice,
      dismissMergeNotice,
    }),
    [
      lines,
      summary,
      isAuthenticated,
      serverCart,
      cartSynced,
      addLine,
      buyNow,
      updateQuantity,
      removeLine,
      applyServerCart,
      refreshCart,
      busyLineIds,
      wishlist,
      toggleWishlist,
      isWishlisted,
      requireAuth,
      defaultAddress,
      refreshAddresses,
      cartError,
      dismissCartError,
      mergeNotice,
      dismissMergeNotice,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useShopCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useShopCart must be used within ShopProvider");
  return ctx;
}
