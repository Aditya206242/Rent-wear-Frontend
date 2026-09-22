import type { ProductPricing } from "@/lib/api/types";
import type { GarmentView, Occasion, Style } from "./types";

/** Shapes exactly as the real backend returns them (see docs/BACKEND_API_SPEC.md). */

// A product can now come in multiple colors (see the admin's Product ->
// ProductVariant model) — the top-level color/colorHex/imageUrls above are
// still the first variant, flattened for backward compatibility, but this
// carries the full set including each color's declared sizes.
export type ApiProductVariant = {
  id: string;
  color: string;
  colorHex: string;
  views: GarmentView[];
  imageUrls: Partial<Record<GarmentView, string>>;
  sizes: string[];
};

export type ApiProduct = {
  id: string;
  name: string;
  brand: string;
  category: string;
  occasions: Occasion[];
  styles: Style[];
  color: string;
  colorHex: string;
  fabric: string;
  care: string[];
  measurements: { label: string; value: string }[];
  views: GarmentView[];
  imageUrls?: Partial<Record<GarmentView, string>>;
  variants?: ApiProductVariant[];
  // Admin-uploaded fallback thumbnail, used when the selected/default color
  // has no photo of its own yet — see Garment.coverImageUrl.
  coverImageUrl?: string | null;
  description: string;
  rentDays: number;
  deliveryDays: number;
  conditionCopy: string;
  rating: number;
  reviewCount: number;
  pricing: ProductPricing;
};

export type ApiSizeAvailability = {
  size: string;
  available: boolean;
  unitsFree: number;
};

export type ApiProductDetail = ApiProduct & {
  sizes: ApiSizeAvailability[];
  similar: ApiProduct[];
};

export type ApiOccasion = {
  code: string;
  label: Occasion;
  count: number;
  // Admin-uploaded cover image + blurb for this occasion's home-page tile
  // (see the admin console's Shop by Occasion screen). Null until an admin
  // sets one — OccasionShowcase skips the tile entirely in that case.
  imageUrl: string | null;
  blurb: string | null;
};

export type ApiOutfit = {
  id: string;
  name: string;
  occasion: Occasion;
  lookRentDays: number;
  pricing: ProductPricing;
  products: ApiProduct[];
};
