"use client";

import { AlertTriangle, Trash2 } from "lucide-react";
import { GarmentSwatch } from "./GarmentSwatch";
import { QuantityStepper } from "./QuantityStepper";
import { formatMoney } from "@/lib/shop/format";
import type { BagLine } from "@/lib/shop/types";

function formatDay(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

/** One bag line with its live status from the server (out of stock, price changed…). */
export function BagLineItem({
  line,
  busy = false,
  onQuantityChange,
  onRemove,
  compact = false,
}: {
  line: BagLine;
  busy?: boolean;
  onQuantityChange?: (quantity: number) => void;
  onRemove?: () => void;
  compact?: boolean;
}) {
  const blocked = line.status === "blocked";
  return (
    <li className={`flex gap-3 ${busy ? "opacity-60" : ""}`}>
      <div className={`${compact ? "h-16 w-12" : "h-20 w-14"} shrink-0 overflow-hidden rounded-lg ${blocked ? "grayscale" : ""}`}>
        <GarmentSwatch colorHex={line.colorHex} name={line.name} imageUrl={line.imageUrl ?? undefined} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className={`truncate font-ui text-sm font-medium ${blocked ? "text-brand-navy/50" : "text-brand-navy"}`}>{line.name}</p>
          <p className="shrink-0 font-mono text-sm text-brand-navy/80">{formatMoney(line.lineTotal, line.currency)}</p>
        </div>
        <p className="font-ui text-xs text-brand-navy/55">
          {line.mode === "rent" ? "Rental" : "Purchase"}
          {line.color ? ` · ${line.color}` : ""} · Size {line.size}
          {line.quantity > 1 ? ` · ${formatMoney(line.unitPrice, line.currency)} each` : ""}
        </p>
        {line.mode === "rent" && (
          <p className="font-ui text-xs text-brand-navy/45">
            {line.startDate ? `From ${formatDay(line.startDate)}` : "Starts on delivery"}
            {line.deposit > 0 ? ` · deposit ${formatMoney(line.deposit * line.quantity, line.currency)}` : ""}
          </p>
        )}

        {line.issues.length > 0 && (
          <ul className="mt-1.5 space-y-1">
            {line.issues.map((issue) => (
              <li
                key={issue.code}
                className={`flex items-start gap-1.5 font-ui text-xs ${issue.blocking ? "text-signal-danger" : "text-signal-warning"}`}
              >
                <AlertTriangle size={12} strokeWidth={2} className="mt-0.5 shrink-0" />
                {issue.message}
              </li>
            ))}
          </ul>
        )}

        {(onQuantityChange || onRemove) && (
          <div className="mt-2 flex items-center justify-between">
            {onQuantityChange && !blocked ? (
              <QuantityStepper
                size="sm"
                value={line.quantity}
                max={Math.max(line.quantity, line.maxQuantity)}
                onChange={onQuantityChange}
                disabled={busy}
              />
            ) : (
              <span />
            )}
            {onRemove && (
              <button
                type="button"
                onClick={onRemove}
                disabled={busy}
                aria-label={`Remove ${line.name}`}
                className="flex items-center gap-1 font-ui text-xs text-brand-navy/40 transition-colors hover:text-signal-danger disabled:opacity-40"
              >
                <Trash2 size={13} strokeWidth={1.5} />
                Remove
              </button>
            )}
          </div>
        )}
      </div>
    </li>
  );
}
