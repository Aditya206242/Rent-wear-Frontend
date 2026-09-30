"use server";

import { getProduct } from "./api";
import type { Garment } from "./types";

/**
 * The catalog LIST endpoint doesn't return per-colour stock (see
 * lib/shop/api.ts's adaptProductSummary), so a Garment handed to a card from
 * the discover grid has `variantStock: []`. The quick-view modal opens
 * straight from that card data, so it loads the full product detail before
 * a shopper can pick a colour and size.
 */
export async function fetchGarmentDetailAction(id: string): Promise<Garment | null> {
  const result = await getProduct(id);
  return result?.garment ?? null;
}
