import type { AddToBagInput, Garment, GarmentView, RentOrBuy } from "./types";

export function pickImage(urls: Partial<Record<GarmentView, string>> | undefined, fallback?: string | null): string | null {
  return urls?.model ?? urls?.front ?? urls?.detail ?? urls?.back ?? fallback ?? null;
}

/** Everything the bag needs to add this product; display fields are only used by a guest bag. */
export function bagInputFor(
  garment: Garment,
  opts: { mode: RentOrBuy; size: string; variantId?: string; quantity?: number; startDate?: string }
): AddToBagInput {
  const variant = garment.variants.find((v) => v.id === opts.variantId);
  return {
    productId: garment.id,
    variantId: opts.variantId,
    mode: opts.mode,
    size: opts.size,
    quantity: opts.quantity ?? 1,
    startDate: opts.mode === "rent" ? opts.startDate || undefined : undefined,
    display: {
      name: garment.name,
      brand: garment.brand,
      color: variant?.color ?? garment.color,
      colorHex: variant?.colorHex ?? garment.colorHex,
      imageUrl: pickImage(variant?.imageUrls ?? garment.imageUrls, garment.coverImageUrl),
      currency: garment.currency,
      unitPrice: opts.mode === "rent" ? garment.rentPrice : garment.buyPrice,
      deposit: opts.mode === "rent" ? garment.deposit : 0,
    },
  };
}
