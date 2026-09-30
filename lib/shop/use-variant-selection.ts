"use client";

import { useMemo, useState } from "react";
import { MAX_QUANTITY_PER_LINE } from "./cart-context";
import type { Garment, RentOrBuy, SizeOption } from "./types";

function unitsFor(garment: Garment, variantId: string | null, size: string, mode: RentOrBuy): number | null {
  if (garment.variantStock.length === 0) return null; // no live stock data — the backend decides on add
  const row = garment.variantStock.find((s) => s.variantId === variantId && s.size === size);
  return row ? (mode === "rent" ? row.rentUnitsFree : row.buyUnitsAvailable) : 0;
}

/**
 * Colour → size → quantity selection for a product, driven by its live
 * per-colour stock. Stock shown here is a hint for the shopper; the backend
 * re-checks it when the item is added and again when the order is placed.
 */
export function useVariantSelection(garment: Garment, mode: RentOrBuy) {
  const [variantId, setVariantId] = useState<string | null>(() => {
    const withStock = garment.variants.find((v) =>
      garment.variantStock.some((s) => s.variantId === v.id && s.rentUnitsFree + s.buyUnitsAvailable > 0)
    );
    return withStock?.id ?? garment.defaultVariantId;
  });
  const variant = garment.variants.find((v) => v.id === variantId) ?? null;

  const sizes: SizeOption[] = useMemo(() => {
    const declared = variant?.sizes ?? garment.sizes.map((s) => s.size);
    return declared.map((size) => {
      const units = unitsFor(garment, variantId, size, mode);
      return { size, available: units === null ? true : units > 0 };
    });
  }, [garment, variant, variantId, mode]);

  const [size, setSize] = useState<string | null>(null);
  const activeSize = size && sizes.some((s) => s.size === size && s.available) ? size : sizes.find((s) => s.available)?.size ?? null;
  const units = activeSize ? unitsFor(garment, variantId, activeSize, mode) : null;
  const maxQuantity = Math.max(1, Math.min(MAX_QUANTITY_PER_LINE, units ?? MAX_QUANTITY_PER_LINE));

  const [quantity, setQuantity] = useState(1);

  const soldOutVariantIds = useMemo(() => {
    if (garment.variantStock.length === 0) return new Set<string>();
    return new Set(
      garment.variants
        .filter((v) => !garment.variantStock.some((s) => s.variantId === v.id && (mode === "rent" ? s.rentUnitsFree : s.buyUnitsAvailable) > 0))
        .map((v) => v.id)
    );
  }, [garment, mode]);

  return {
    variantId,
    setVariantId,
    variant,
    sizes,
    activeSize,
    setSize,
    units,
    maxQuantity,
    quantity: Math.min(quantity, maxQuantity),
    setQuantity,
    soldOutVariantIds,
  };
}
