"use client";

import { Minus, Plus } from "lucide-react";

export function QuantityStepper({
  value,
  max,
  onChange,
  disabled = false,
  size = "md",
  label = "Quantity",
}: {
  value: number;
  max: number;
  onChange: (next: number) => void;
  disabled?: boolean;
  size?: "sm" | "md";
  label?: string;
}) {
  const box = size === "sm" ? "h-7 w-7" : "h-9 w-9";
  const text = size === "sm" ? "w-7 text-xs" : "w-9 text-sm";
  return (
    <div className="inline-flex items-center rounded-lg border border-brand-navy/15 bg-white" role="group" aria-label={label}>
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={disabled || value <= 1}
        aria-label={`Decrease ${label.toLowerCase()}`}
        className={`flex ${box} items-center justify-center text-brand-navy/60 transition-colors hover:text-brand-navy disabled:cursor-not-allowed disabled:opacity-30`}
      >
        <Minus size={14} strokeWidth={1.75} />
      </button>
      <span className={`${text} text-center font-mono font-medium text-brand-navy`} aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={disabled || value >= max}
        aria-label={`Increase ${label.toLowerCase()}`}
        className={`flex ${box} items-center justify-center text-brand-navy/60 transition-colors hover:text-brand-navy disabled:cursor-not-allowed disabled:opacity-30`}
      >
        <Plus size={14} strokeWidth={1.75} />
      </button>
    </div>
  );
}
