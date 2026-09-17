"use server";

import { getProduct } from "./api";
import type { SizeOption } from "./types";

/**
 * The catalog LIST endpoint doesn't return per-size availability (see
 * lib/shop/api.ts's adaptProductSummary), so a Garment handed to a card from
 * the discover grid always has `sizes: []`. The quick-view modal opens
 * straight from that card data, so it needs this to fetch the real sizes
 * from the product DETAIL endpoint before a shopper can pick one and add to
 * the bag.
 */
export async function fetchGarmentSizesAction(id: string): Promise<SizeOption[]> {
  const result = await getProduct(id);
  return result?.garment.sizes ?? [];
}
