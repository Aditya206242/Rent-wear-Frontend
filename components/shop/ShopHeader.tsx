"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Heart, ShoppingBag, CircleUserRound, LogOut } from "lucide-react";
import { LoopWearLogo } from "@/components/LoopWearLogo";
import { useShopCart } from "@/lib/shop/cart-context";
import { logout } from "@/lib/auth/actions";
import type { SessionUser } from "@/lib/auth/session";
import { CartDrawer } from "./CartDrawer";

export function ShopHeader({ user }: { user: SessionUser | null }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [cartOpen, setCartOpen] = useState(false);
  const [isLoggingOut, startLogout] = useTransition();
  const { rentalCount, purchaseCount, wishlist } = useShopCart();
  const totalBag = rentalCount + purchaseCount;

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-brand-navy/10 bg-brand-cream/95 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-4 px-4 pt-3 md:px-10">
          <Link href="/discover" className="shrink-0">
            <LoopWearLogo size="sm" showTagline={false} />
          </Link>

          <div className="flex items-center gap-4 sm:gap-5">
            <Link href="/looks" className="hidden font-ui text-sm text-brand-navy/70 hover:text-brand-navy sm:block">
              Looks
            </Link>

            <Link href="/wishlist" className="relative flex h-8 w-8 items-center justify-center text-brand-navy/70 hover:text-brand-navy" aria-label={`Wishlist, ${wishlist.size} saved`}>
              <Heart size={18} strokeWidth={1.5} />
              {wishlist.size > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center bg-brand-gold px-0.5 font-mono text-[9px] font-bold text-brand-navy-dark">
                  {wishlist.size}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative flex h-8 w-8 items-center justify-center text-brand-navy/70 hover:text-brand-navy"
              aria-label={`Bag, ${totalBag} items`}
            >
              <ShoppingBag size={18} strokeWidth={1.5} />
              {totalBag > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center bg-brand-gold px-0.5 font-mono text-[9px] font-bold text-brand-navy-dark">
                  {totalBag}
                </span>
              )}
            </button>

            {user ? (
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={() => startLogout(() => logout())}
                className="flex h-8 w-8 items-center justify-center text-brand-navy/70 transition-colors hover:text-signal-danger disabled:opacity-50"
                aria-label={`Sign out (${user.name})`}
                title={`Sign out — ${user.name}`}
              >
                <LogOut size={18} strokeWidth={1.5} />
              </button>
            ) : (
              <Link href="/sign-in" className="flex h-8 w-8 items-center justify-center text-brand-navy/70 hover:text-brand-navy" aria-label="Sign in">
                <CircleUserRound size={19} strokeWidth={1.5} />
              </Link>
            )}
          </div>
        </div>

        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            const params = new URLSearchParams(searchParams.toString());
            if (query.trim()) params.set("q", query.trim());
            else params.delete("q");
            router.push(`/discover?${params.toString()}`);
          }}
          className="mx-4 flex items-center gap-2 border-b border-brand-navy/20 py-2.5 focus-within:border-brand-gold md:mx-auto md:max-w-md"
        >
          <Search size={15} strokeWidth={1.5} className="shrink-0 text-brand-navy/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Something for a wedding, blue dress for Saturday…"
            aria-label="Search LoopWear"
            className="w-full bg-transparent font-ui text-sm text-brand-navy placeholder:text-brand-navy/40 focus:outline-none"
          />
        </form>
      </header>

      {/* Rendered outside <header> deliberately: position:sticky on the
          header establishes a containing block for position:fixed
          descendants, which would clip this drawer to the header's own
          height instead of the viewport. */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
