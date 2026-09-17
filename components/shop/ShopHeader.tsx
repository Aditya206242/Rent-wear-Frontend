"use client";

import { useEffect, useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X, Heart, ShoppingBag, CircleUserRound, LogOut, MapPin, Package } from "lucide-react";
import { LoopWearLogo } from "@/components/LoopWearLogo";
import { useShopCart } from "@/lib/shop/cart-context";
import { logout } from "@/lib/auth/actions";
import { regionFlag } from "@/lib/shop/format";
import type { SessionUser } from "@/lib/auth/session";
import { CartDrawer } from "./CartDrawer";

const DEFAULT_COUNTRY_CODE = "IN";

const NAV_LINKS = [
  { href: "/discover", label: "Discover" },
  { href: "/looks", label: "Looks" },
    { href: "/Laundry", label: "Laundry" },
  { href: "/Rental", label: "Rental" },
  
];

/** Bordered pill link flanking the search bar (Address, Orders) — one shared
 * look instead of each caller repeating the same box of classes. */
function HeaderChip({ href, title, children }: { href: string; title?: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      title={title}
      className="hidden shrink-0 items-center gap-1.5 rounded-lg border border-brand-navy/15 px-3 py-2 font-ui text-xs font-medium text-brand-navy/70 transition-colors hover:border-brand-cyan-deep/50 hover:bg-brand-cyan-deep/5 hover:text-brand-navy sm:flex"
    >
      {children}
    </Link>
  );
}

export function ShopHeader({ user }: { user: SessionUser | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [cartOpen, setCartOpen] = useState(false);
  const [isLoggingOut, startLogout] = useTransition();
  const { rentalCount, purchaseCount, wishlist, address, cartError } = useShopCart();
  const totalBag = rentalCount + purchaseCount;
  const countryFlag = regionFlag(user?.country || DEFAULT_COUNTRY_CODE);

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  // Without this, a rejected add just rolls back silently — the item
  // flashes into the bag and vanishes with no visible explanation. Pop the
  // drawer open so the `cartError` banner it renders is actually seen.
  useEffect(() => {
    if (cartError) setCartOpen(true);
  }, [cartError]);

  function runSearch(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (next.trim()) params.set("q", next.trim());
    else params.delete("q");
    router.push(`/discover?${params.toString()}`);
  }

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-brand-navy/10 bg-brand-cream/95 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-4 px-4 pt-3 md:px-10">
          <Link href="/discover" className="flex shrink-0 flex-col items-start gap-0">
            <LoopWearLogo size="md" showTagline={false} />
            <span className="ml-11.5 font-ui text-xs font-medium leading-none text-brand-navy/70">Everyday Apparel</span>
            
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-5 sm:flex">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`font-ui text-md transition-colors ${
                    active ? "text-brand-navy" : "text-brand-navy/70 hover:text-brand-navy"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-4 sm:gap-5">
            <Link href="/wishlist" className="relative flex h-8 w-8 items-center justify-center text-brand-navy/70 hover:text-brand-navy" aria-label={`Wishlist, ${wishlist.size} saved`}>
              <Heart size={23} strokeWidth={1.5} />
              {wishlist.size > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center bg-brand-cyan px-0.5 font-mono text-[9px] font-bold text-brand-navy-dark">
                  {wishlist.size}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative flex h-8 w-8 items-center justify-center text-brand-navy/70 hover:text-brand-cyan cursor-pointer"
              aria-label={`Bag, ${totalBag} items`}
            >
              <ShoppingBag size={23} strokeWidth={1.5} />
              {totalBag > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center bg-brand-cyan px-0.5 font-mono text-[9px] font-bold text-brand-navy-dark">
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
                <LogOut size={23} strokeWidth={1.5} />
              </button>
            ) : (
              <Link href="/sign-in" className="flex h-8 w-8 items-center justify-center text-brand-navy/70 hover:text-brand-navy" aria-label="Sign in">
                <CircleUserRound size={24} strokeWidth={1.5} />
              </Link>
            )}
          </div>
        </div>

        <div className="mx-4 my-3 flex items-center justify-between gap-3 md:mx-20">
          <HeaderChip href="/account/address" title={address ? `${address.addressLine1}, ${address.city}` : "Add a delivery address"}>
            <span aria-hidden="true" className="text-sm leading-none">{countryFlag}</span>
            <MapPin size={14} strokeWidth={1.5} />
            <span>Address</span>
          </HeaderChip>

          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              runSearch(query);
            }}
            className="flex flex-1 items-center gap-2 border border-brand-navy/15 bg-white px-3.5 py-2 transition-colors focus-within:border-brand-cyan md:max-w-lg"
          >
            <Search size={19} strokeWidth={1.5} className="shrink-0 text-brand-navy/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by style, brand, occasion…"
              aria-label="Search LoopWear"
              className="shop-search-input w-full bg-transparent font-ui text-sm text-brand-navy placeholder:text-brand-navy/40 focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  runSearch("");
                }}
                aria-label="Clear search"
                className="shrink-0 text-brand-navy/35"
              >
                <X size={15} strokeWidth={1.5} />
              </button>
            )}
          </form>

          <HeaderChip href="/account/orders" title="Your orders">
            <Package size={14} strokeWidth={1.5} />
            <span>Orders</span>
          </HeaderChip>
        </div>
      </header>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
