import { cache } from "react";
import { apiFetch } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import type { Paginated } from "@/lib/api/types";
import type { ApiOccasion, ApiOutfit, ApiProduct, ApiProductDetail, ApiSizeAvailability } from "./api-types";
import type { Availability, Garment, Occasion, Outfit, SizeOption } from "./types";

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
 * The product LIST endpoint doesn't return per-size availability (see
 * docs/BACKEND_API_SPEC.md §2 — real availability is date-range aware and
 * would mean N+1 calls for a grid). We default to "available" here rather
 * than guess wrong in either direction; the product DETAIL page below uses
 * the real `sizes[]`/`unitsFree` data and is accurate.
 */
function adaptProductSummary(api: ApiProduct): Garment {
  return {
    id: api.id,
    name: api.name,
    brand: api.brand,
    category: api.category,
    occasions: api.occasions,
    styles: api.styles,
    color: api.color,
    colorHex: api.colorHex,
    conditionCopy: api.conditionCopy,
    currency: api.pricing.displayCurrency,
    rentPrice: api.pricing.display.rentPrice,
    rentDays: api.rentDays,
    buyPrice: api.pricing.display.buyPrice,
    deposit: api.pricing.display.deposit,
    sizes: [],
    availability: "available",
    availableFrom: "",
    deliveryDays: api.deliveryDays,
    rating: api.rating,
    reviewCount: api.reviewCount,
    fabric: api.fabric,
    care: api.care,
    measurements: api.measurements,
    views: api.views,
  };
}

function adaptProductDetail(api: ApiProductDetail): Garment {
  const sizes: SizeOption[] = api.sizes.map((s) => ({ size: s.size, available: s.available }));
  return {
    ...adaptProductSummary(api),
    sizes,
    availability: computeAvailability(api.sizes),
  };
}

function pick(display: Record<string, number>, keys: string[]): number {
  for (const key of keys) {
    if (typeof display[key] === "number") return display[key];
  }
  return 0;
}

function adaptOutfit(api: ApiOutfit): { outfit: Outfit; garments: Garment[] } {
  const garments = api.products.map(adaptProductSummary);
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
  return { ...data, items: data.items.map(adaptProductSummary) };
}

// cache() dedupes this within one request — generateMetadata and the page
// component both need the same product and would otherwise double-fetch.
export const getProduct = cache(async (
  id: string,
  currency?: string
): Promise<{ garment: Garment; similar: Garment[] } | null> => {
  try {
    const data = await apiFetch<ApiProductDetail>(`/products/${id}`, { currency });
    return { garment: adaptProductDetail(data), similar: data.similar.map(adaptProductSummary) };
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

export async function listOccasionsWithCounts(): Promise<{ code: string; label: Occasion; count: number }[]> {
  const data = await apiFetch<{ items: ApiOccasion[] }>("/occasions");
  return data.items;
}

export async function listOutfits(
  occasion?: string,
  currency?: string
): Promise<{ outfit: Outfit; garments: Garment[] }[]> {
  const data = await apiFetch<{ items: ApiOutfit[] }>("/outfits", { searchParams: { occasion }, currency });
  return data.items.map(adaptOutfit);
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
