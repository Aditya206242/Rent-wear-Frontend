export type Occasion = "Wedding" | "Party" | "Office" | "Date Night" | "Festival" | "Travel" | "Everyday";

export type Style = "Minimal" | "Classic" | "Street" | "Formal" | "Traditional" | "Contemporary";

export type Availability = "available" | "limited" | "unavailable";

export type SizeOption = {
  size: string;
  available: boolean;
};

export type GarmentView = "front" | "back" | "fabric" | "model" | "detail";

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
  views: GarmentView[];
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

/** What a caller provides to add something to the bag — the context enriches this into a full CartLine. */
export type AddCartLineInput = {
  garmentId: string;
  mode: RentOrBuy;
  size: string;
  startDate?: string;
};

export type CartLine = AddCartLineInput & {
  product?: { id: string; name: string; brand: string; colorHex: string };
  currency?: string;
  rentPrice?: number;
  deposit?: number;
  buyPrice?: number;
};
