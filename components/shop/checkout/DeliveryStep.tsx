"use client";

import { Truck, Zap } from "lucide-react";
import { formatMoney } from "@/lib/shop/format";
import type { ApiDeliveryOption } from "@/lib/shop/checkout-types";

function day(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

/** Delivery methods and fees exactly as the backend offers them for the chosen address. */
export function DeliveryStep({
  options,
  selected,
  loading,
  onSelect,
  onContinue,
}: {
  options: ApiDeliveryOption[];
  selected: string | null;
  loading: boolean;
  onSelect: (code: string) => void;
  onContinue: () => void;
}) {
  if (loading) return <p className="font-ui text-sm text-brand-navy/50">Checking delivery options for this address…</p>;
  if (options.length === 0) return <p className="font-ui text-sm text-signal-danger">We couldn&apos;t load delivery options. Please try again.</p>;
  const anyAvailable = options.some((o) => o.available);

  return (
    <div className="space-y-3">
      {options.map((option) => {
        const Icon = option.code === "express" ? Zap : Truck;
        const fee = option.pricing.display.fee;
        return (
          <label
            key={option.code}
            className={`flex gap-3 rounded-lg border px-4 py-4 transition-colors ${
              !option.available
                ? "cursor-not-allowed border-brand-navy/8 opacity-55"
                : selected === option.code
                  ? "cursor-pointer border-brand-cyan-deep/60 bg-brand-cyan/5"
                  : "cursor-pointer border-brand-navy/12 hover:border-brand-navy/30"
            }`}
          >
            <input
              type="radio"
              name="delivery"
              disabled={!option.available}
              checked={selected === option.code}
              onChange={() => onSelect(option.code)}
              className="mt-1 h-4 w-4 accent-[var(--color-brand-cyan-deep)]"
            />
            <Icon size={18} strokeWidth={1.5} className="mt-0.5 shrink-0 text-brand-navy/50" />
            <div className="min-w-0 flex-1 font-ui">
              <p className="text-sm font-semibold text-brand-navy">{option.label}</p>
              <p className="text-xs text-brand-navy/55">
                {option.available ? `Arrives ${day(option.estimatedFrom)} – ${day(option.estimatedTo)}` : option.unavailableReason}
              </p>
            </div>
            <p className="font-mono text-sm text-brand-navy">
              {fee === 0 ? "Free" : formatMoney(fee, option.pricing.displayCurrency)}
            </p>
          </label>
        );
      })}

      {!anyAvailable && <p className="font-ui text-xs text-signal-danger">We can&apos;t deliver to this address yet — please choose another.</p>}

      <button
        type="button"
        onClick={onContinue}
        disabled={!selected || !options.find((o) => o.code === selected)?.available}
        className="w-full rounded-lg bg-brand-navy py-3 font-ui text-sm font-semibold text-white transition-colors hover:bg-brand-navy-dark disabled:cursor-not-allowed disabled:opacity-40"
      >
        Continue to review
      </button>
    </div>
  );
}
