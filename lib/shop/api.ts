import { cache } from "react";
import { apiFetch } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import type { Paginated } from "@/lib/api/types";
import type { ApiOccasion, ApiOutfit, ApiProduct, ApiProductDetail, ApiSizeAvailability } from "./api-types";
import type { Availability, Garment, Outfit, SizeOption } from "./types";

export type ProductListParams = {
  page?: number;
  pageSize?: number;
  occasion?: string;
  q?: string;
  category?: string;
  style?: string;
  size?: string;
  color?: string;
  priceMin?: number;
  priceMax?: number;
  currency?: string;
};

function computeAvailability(sizes: ApiSizeAvailability[]): Availability {
  const free = sizes.filter((s) => s.available);
  if (free.length === 0) return "unavailable";
  const totalUnits = free.reduce((sum, s) => sum + s.unitsFree, 0);
  return totalUnits <= 2 ? "limited" : "available";
}

/**
 * The backend's documented shape (docs/BACKEND_API_SPEC.md) marks these
 * array fields as always-present, but real responses have occasionally
 * omitted one (e.g. an outfit with no `products`, a product missing
 * `care`/`measurements`). TypeScript can't catch that at runtime, and an
 * absent array here used to bubble up as "Cannot read properties of
 * undefined (reading 'map')" on the page. Default to empty rather than
 * trust the type.
 */
function arr<T>(v: T[] | undefined | null): T[] {
  return v ?? [];
}

/**
 * The product LIST endpoint doesn't return per-date availability (see
 * docs/BACKEND_API_SPEC.md §2 — that's date-range aware and would mean N+1
 * calls for a grid) but it does now return each color variant's declared
 * sizes (catalog metadata, not live stock — see the admin's VariantSize
 * model). We surface those as "available" here rather than an empty list,
 * so the discover grid's size filter and "first available size" actually
 * work; the product DETAIL page below uses the real `sizes[]`/`unitsFree`
 * data for the accurate, date-aware picture.
 */
function adaptProductSummary(api: ApiProduct): Garment {
  const declaredSizes = Array.from(new Set(arr(api.variants).flatMap((v) => v.sizes)));
  return {
    id: api.id,
    name: api.name,
    brand: api.brand,
    category: api.category,
    occasions: arr(api.occasions),
    styles: arr(api.styles),
    color: api.color,
    colorHex: api.colorHex,
    conditionCopy: api.conditionCopy,
    currency: api.pricing.displayCurrency,
    rentPrice: api.pricing.display.rentPrice,
    rentDays: api.rentDays,
    buyPrice: api.pricing.display.buyPrice,
    deposit: api.pricing.display.deposit,
    sizes: declaredSizes.map((size) => ({ size, available: true })),
    availability: declaredSizes.length > 0 ? "available" : "unavailable",
    availableFrom: "",
    deliveryDays: api.deliveryDays,
    rating: api.rating,
    reviewCount: api.reviewCount,
    fabric: api.fabric,
    care: arr(api.care),
    measurements: arr(api.measurements),
    description: api.description,
    views: arr(api.views),
    imageUrls: api.imageUrls ?? {},
    coverImageUrl: api.coverImageUrl ?? null,
  };
}

function adaptProductDetail(api: ApiProductDetail): Garment {
  const apiSizes = arr(api.sizes);
  const sizes: SizeOption[] = apiSizes.map((s) => ({ size: s.size, available: s.available }));
  return {
    ...adaptProductSummary(api),
    sizes,
    availability: computeAvailability(apiSizes),
  };
}

function pick(display: Record<string, number>, keys: string[]): number {
  for (const key of keys) {
    if (typeof display[key] === "number") return display[key];
  }
  return 0;
}

function adaptOutfit(api: ApiOutfit): { outfit: Outfit; garments: Garment[] } {
  const garments = arr(api.products).map(adaptProductSummary);
  return {
    outfit: {
      id: api.id,
      name: api.name,
      occasion: api.occasion,
      garmentIds: garments.map((g) => g.id),
      currency: api.pricing.displayCurrency,
      lookRentPrice: pick(api.pricing.display, ["lookRentPrice", "rentPrice"]),
      lookBuyPrice: pick(api.pricing.display, ["lookBuyPrice", "buyPrice"]),
      lookRentDays: api.lookRentDays,
    },
    garments,
  };
}

export async function listProducts(
  params: ProductListParams = {}
): Promise<{ items: Garment[]; page: number; pageSize: number; total: number; totalPages: number }> {
  const { currency, ...searchParams } = params;
  const data = await apiFetch<Paginated<ApiProduct>>("/products", { searchParams, currency });
  return { ...data, items: arr(data.items).map(adaptProductSummary) };
}

// cache() dedupes this within one request — generateMetadata and the page
// component both need the same product and would otherwise double-fetch.
export const getProduct = cache(async (
  id: string,
  currency?: string
): Promise<{ garment: Garment; similar: Garment[] } | null> => {
  try {
    const data = await apiFetch<ApiProductDetail>(`/products/${id}`, { currency });
    return { garment: adaptProductDetail(data), similar: arr(data.similar).map(adaptProductSummary) };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
});

export async function getAvailability(
  id: string,
  size: string,
  start: string,
  end: string
): Promise<ApiSizeAvailability> {
  return apiFetch(`/products/${id}/availability`, { searchParams: { size, start, end } });
}

export async function listOccasionsWithCounts(): Promise<ApiOccasion[]> {
  const data = await apiFetch<{ items: ApiOccasion[] }>("/occasions");
  return arr(data.items);
}

export async function listOutfits(
  occasion?: string,
  currency?: string
): Promise<{ outfit: Outfit; garments: Garment[] }[]> {
  const data = await apiFetch<{ items: ApiOutfit[] }>("/outfits", { searchParams: { occasion }, currency });
  // An outfit with no resolved garments (missing/empty `products` from the
  // backend) has nothing to show — skip it rather than render an empty spread.
  return arr(data.items).map(adaptOutfit).filter((o) => o.garments.length > 0);
}

export async function getOutfit(id: string, currency?: string): Promise<{ outfit: Outfit; garments: Garment[] } | null> {
  try {
    const data = await apiFetch<ApiOutfit>(`/outfits/${id}`, { currency });
    return adaptOutfit(data);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}
