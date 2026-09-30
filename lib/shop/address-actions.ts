"use server";

import { getToken } from "@/lib/auth/session";
import { apiFetch } from "@/lib/api/client";
import { toResult, signedOut, type ActionResult } from "./action-result";
import type { AddressInput, ApiAddress } from "./checkout-types";

/** Address book — stored on the backend per account (replaces the old localStorage-only address). */

export async function listAddressesAction(): Promise<ActionResult<ApiAddress[]>> {
  const token = await getToken();
  if (!token) return signedOut();
  return toResult(async () => (await apiFetch<{ items: ApiAddress[] }>("/addresses", { token, cache: "no-store" })).items, "Couldn't load your addresses.");
}

export async function createAddressAction(input: AddressInput): Promise<ActionResult<ApiAddress>> {
  const token = await getToken();
  if (!token) return signedOut();
  return toResult(() => apiFetch<ApiAddress>("/addresses", { method: "POST", token, body: input }), "Couldn't save that address.");
}

export async function updateAddressAction(id: string, input: Partial<AddressInput>): Promise<ActionResult<ApiAddress>> {
  const token = await getToken();
  if (!token) return signedOut();
  return toResult(
    () => apiFetch<ApiAddress>(`/addresses/${encodeURIComponent(id)}`, { method: "PATCH", token, body: input }),
    "Couldn't update that address."
  );
}

export async function setDefaultAddressAction(id: string): Promise<ActionResult<ApiAddress>> {
  const token = await getToken();
  if (!token) return signedOut();
  return toResult(() => apiFetch<ApiAddress>(`/addresses/${encodeURIComponent(id)}/default`, { method: "POST", token }), "Couldn't update your default address.");
}

export async function deleteAddressAction(id: string): Promise<ActionResult<null>> {
  const token = await getToken();
  if (!token) return signedOut();
  return toResult(async () => {
    await apiFetch<void>(`/addresses/${encodeURIComponent(id)}`, { method: "DELETE", token });
    return null;
  }, "Couldn't delete that address.");
}

export async function fetchIndianStatesAction(): Promise<string[]> {
  try {
    const res = await apiFetch<{ countries: { code: string; states: string[] }[] }>("/addresses/regions", { next: { revalidate: 86400 } });
    return res.countries.find((c) => c.code === "IN")?.states ?? [];
  } catch {
    return [];
  }
}
