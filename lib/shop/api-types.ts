import type { ProductPricing } from "@/lib/api/types";
import type { GarmentView, Occasion, Style } from "./types";

/** Shapes exactly as the real backend returns them (see docs/BACKEND_API_SPEC.md). */

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
};

export type ApiOutfit = {
  id: string;
  name: string;
  occasion: Occasion;
  lookRentDays: number;
  pricing: ProductPricing;
  products: ApiProduct[];
};
