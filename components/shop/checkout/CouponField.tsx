"use client";

import { useState, useTransition } from "react";
import { Tag, X } from "lucide-react";
import { applyCouponAction, removeCouponAction } from "@/lib/shop/cart-actions";
import type { ApiCart } from "@/lib/shop/checkout-types";

/** Coupons are validated and priced by the backend; this only sends the code. */
export function CouponField({ coupon, onCartChange, disabled }: { coupon: ApiCart["coupon"]; onCartChange: (cart: ApiCart) => void; disabled?: boolean }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function apply() {
    if (!code.trim()) return;
    setError(null);
    startTransition(async () => {
      const res = await applyCouponAction(code.trim());
      if (res.ok) {
        setCode("");
        onCartChange(res.data);
      } else setError(res.error);
    });
  }

  function remove() {
    setError(null);
    startTransition(async () => {
      const res = await removeCouponAction();
      if (res.ok) onCartChange(res.data);
      else setError(res.error);
    });
  }

  if (coupon) {
    return (
      <div className="mt-4 rounded-lg border border-brand-navy/10 px-3.5 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 font-ui text-sm font-medium text-brand-navy">
            <Tag size={14} strokeWidth={1.75} className={coupon.applied ? "text-signal-success" : "text-signal-danger"} />
            {coupon.code}
          </p>
          <button type="button" onClick={remove} disabled={isPending || disabled} aria-label="Remove coupon" className="text-brand-navy/40 hover:text-signal-danger disabled:opacity-40">
            <X size={15} strokeWidth={1.75} />
          </button>
        </div>
        {!coupon.applied && coupon.message && <p className="mt-1 font-ui text-xs text-signal-danger">{coupon.message}</p>}
        {error && <p className="mt-1 font-ui text-xs text-signal-danger">{error}</p>}
      </div>
    );
  }

  return (
    <div className="mt-4">
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          apply();
        }}
      >
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Coupon code"
          aria-label="Coupon code"
          disabled={disabled}
          className="min-w-0 flex-1 rounded-lg border border-brand-navy/15 bg-white px-3 py-2 font-mono text-sm uppercase text-brand-navy placeholder:font-ui placeholder:normal-case placeholder:text-brand-navy/35 focus:border-brand-cyan-deep/60 focus:outline-none"
        />
        <button
          type="submit"
          disabled={isPending || !code.trim() || disabled}
          className="rounded-lg border border-brand-navy/20 px-4 font-ui text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-cream disabled:opacity-40"
        >
          {isPending ? "…" : "Apply"}
        </button>
      </form>
      {error && (
        <p role="alert" className="mt-1.5 font-ui text-xs text-signal-danger">
          {error}
        </p>
      )}
    </div>
  );
}
