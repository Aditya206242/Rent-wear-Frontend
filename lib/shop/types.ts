export type Occasion = "Wedding" | "Party" | "Office" | "Date Night" | "Festival" | "Travel" | "Everyday";

export type Style = "Minimal" | "Classic" | "Street" | "Formal" | "Traditional" | "Contemporary";

export type Availability = "available" | "limited" | "unavailable";

export type SizeOption = {
  size: string;
  available: boolean;
};

export type GarmentView = "front" | "back" | "fabric" | "model" | "detail";

/** One colour of a product (the admin's ProductVariant) and the sizes it's offered in. */
export type VariantOption = {
  id: string;
  color: string;
  colorHex: string;
  views: GarmentView[];
  imageUrls: Partial<Record<GarmentView, string>>;
  sizes: string[];
};

/** Live stock for one (colour, size) — only on the product detail response. */
export type VariantSizeStock = {
  variantId: string;
  size: string;
  /** Units free for the default rental window (from today). */
  rentUnitsFree: number;
  /** Units that can be bought right now. */
  buyUnitsAvailable: number;
};

export type Garment = {
  id: string;
  name: string;
  brand: string;
  category: string;
  occasions: Occasion[];
  styles: Style[];
  color: string;
  colorHex: string;
  /** Human-readable copy from the backend, e.g. "Excellent condition, inspected before dispatch" — the API doesn't expose a per-product condition enum (condition is tracked per physical unit, not per catalog style). */
  conditionCopy: string;
  /** ISO 4217 code the prices below are already expressed in (backend picks this per-request; see docs/BACKEND_API_SPEC.md). */
  currency: string;
  rentPrice: number;
  rentDays: number;
  buyPrice: number;
  deposit: number;
  sizes: SizeOption[];
  availability: Availability;
  availableFrom: string;
  deliveryDays: number;
  rating: number;
  reviewCount: number;
  fabric: string;
  care: string[];
  measurements: { label: string; value: string }[];
  description: string;
  views: GarmentView[];
  imageUrls: Partial<Record<GarmentView, string>>;
  /** Admin-uploaded fallback thumbnail — shown when the current color has no
   * photo of its own yet (see imageUrls above, which takes priority). */
  coverImageUrl: string | null;
  /** Every active colour; the top-level color/imageUrls above are the first one. */
  variants: VariantOption[];
  defaultVariantId: string | null;
  /** Per colour/size stock — empty on list items, filled on the product detail page. */
  variantStock: VariantSizeStock[];
};

export type Outfit = {
  id: string;
  name: string;
  occasion: Occasion;
  garmentIds: string[];
  currency: string;
  lookRentPrice: number;
  lookBuyPrice: number;
  lookRentDays: number;
};

export type RentOrBuy = "rent" | "buy";

/**
 * What a caller provides to add something to the bag. Prices here are for
 * display in a guest bag only — the backend never receives them and always
 * charges its own current price.
 */
export type AddToBagInput = {
  productId: string;
  /** Omit for quick-add from a card: the backend picks the product's first colour with stock in this size. */
  variantId?: string;
  mode: RentOrBuy;
  size: string;
  quantity?: number;
  startDate?: string;
  display: {
    name: string;
    brand: string;
    color?: string;
    colorHex: string;
    imageUrl?: string | null;
    currency: string;
    unitPrice: number;
    deposit: number;
  };
};

export type LineStatus = "ok" | "warning" | "blocked";

/** One line of the bag, the same shape whether it came from the server cart or the guest bag. */
export type BagLine = {
  /** Server cart-item id, or a local key for a guest line. */
  id: string;
  productId: string;
  variantId?: string;
  mode: RentOrBuy;
  size: string;
  quantity: number;
  startDate?: string | null;
  name: string;
  brand: string;
  color?: string;
  colorHex: string;
  imageUrl?: string | null;
  currency: string;
  unitPrice: number;
  deposit: number;
  lineTotal: number;
  status: LineStatus;
  issues: { code: string; message: string; blocking: boolean }[];
  /** How many can be chosen right now (stock and the per-line limit). */
  maxQuantity: number;
  guest: boolean;
};

export type BagSummary = {
  currency: string;
  rentSubtotal: number;
  buySubtotal: number;
  subtotal: number;
  discount: number;
  depositTotal: number;
  /** Before delivery, which is chosen at checkout. */
  total: number;
  grandTotal: number;
};
