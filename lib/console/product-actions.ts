"use server";

import { redirect } from "next/navigation";
import { getToken } from "@/lib/auth/session";
import { apiFetch } from "@/lib/api/client";
import { ApiError, fieldErrorsFrom } from "@/lib/api/errors";

export type ProductActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

const PRODUCT_VIEWS = ["front", "back", "fabric", "model", "detail"] as const;

function parseListField(value: FormDataEntryValue | null): string[] {
  return String(value ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseMeasurements(value: FormDataEntryValue | null): { label: string; value: string }[] {
  return String(value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, ...rest] = line.split(":");
      return { label: label.trim(), value: rest.join(":").trim() };
    })
    .filter((m) => m.label && m.value);
}

/**
 * Builds the exact body /console/products expects. imageUrls is keyed by
 * view (front/back/fabric/model/detail) — the form has one URL field per
 * view rather than a free-form list, and `views` is just derived from which
 * of those five actually got a URL, so the operator never has to keep the
 * two in sync by hand.
 */
function buildProductBody(formData: FormData) {
  const imageUrls: Partial<Record<(typeof PRODUCT_VIEWS)[number], string>> = {};
  for (const view of PRODUCT_VIEWS) {
    const url = String(formData.get(`imageUrl_${view}`) ?? "").trim();
    if (url) imageUrls[view] = url;
  }

  return {
    name: String(formData.get("name") ?? "").trim(),
    brand: String(formData.get("brand") ?? "").trim(),
    category: String(formData.get("category") ?? "").trim(),
    color: String(formData.get("color") ?? "").trim(),
    colorHex: String(formData.get("colorHex") ?? "").trim(),
    fabric: String(formData.get("fabric") ?? "").trim(),
    occasions: parseListField(formData.get("occasions")),
    styles: parseListField(formData.get("styles")),
    care: parseListField(formData.get("care")),
    measurements: parseMeasurements(formData.get("measurements")),
    imageUrls,
    views: Object.keys(imageUrls),
    rentPricePaise: Math.round(Number(formData.get("rentPrice") ?? 0) * 100),
    rentDays: Number(formData.get("rentDays") ?? 0),
    buyPricePaise: Math.round(Number(formData.get("buyPrice") ?? 0) * 100),
    depositPaise: Math.round(Number(formData.get("deposit") ?? 0) * 100),
    deliveryDays: Number(formData.get("deliveryDays") ?? 0),
    isActive: formData.get("isActive") === "on",
  };
}

function actionErrorFrom(error: unknown): ProductActionState {
  if (error instanceof ApiError) {
    if (error.code === "validation_error") {
      const fieldErrors = fieldErrorsFrom(error);
      if (Object.keys(fieldErrors).length > 0) return { fieldErrors };
    }
    return { error: error.message };
  }
  return { error: "Something went wrong. Please try again." };
}

export async function createProductAction(
  _prev: ProductActionState,
  formData: FormData
): Promise<ProductActionState> {
  const token = await getToken();
  if (!token) return { error: "Sign in as an operator to do this." };

  let id: string;
  try {
    const product = await apiFetch<{ id: string }>("/console/products", {
      method: "POST",
      token,
      body: buildProductBody(formData),
    });
    id = product.id;
  } catch (error) {
    return actionErrorFrom(error);
  }

  redirect(`/products/${id}`);
}

export async function updateProductAction(
  id: string,
  _prev: ProductActionState,
  formData: FormData
): Promise<ProductActionState> {
  const token = await getToken();
  if (!token) return { error: "Sign in as an operator to do this." };

  try {
    await apiFetch(`/console/products/${id}`, { method: "PATCH", token, body: buildProductBody(formData) });
  } catch (error) {
    return actionErrorFrom(error);
  }

  redirect(`/products/${id}`);
}

export async function deleteProductAction(id: string): Promise<{ error?: string }> {
  const token = await getToken();
  if (!token) return { error: "Sign in as an operator to do this." };

  try {
    await apiFetch(`/console/products/${id}`, { method: "DELETE", token });
  } catch (error) {
    return { error: error instanceof ApiError ? error.message : "Couldn't delete this product." };
  }

  redirect("/products");
}

export async function addStockAction(productId: string, formData: FormData): Promise<void> {
  const token = await getToken();
  if (!token) return;

  const sku = String(formData.get("sku") ?? "").trim();
  const size = String(formData.get("size") ?? "").trim();
  const facilityId = String(formData.get("facilityId") ?? "").trim() || undefined;

  await apiFetch(`/console/products/${productId}/units`, {
    method: "POST",
    token,
    body: { sku, size, facilityId },
  });

  redirect(`/products/${productId}`);
}
