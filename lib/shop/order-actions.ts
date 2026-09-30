"use server";

import { getToken } from "@/lib/auth/session";
import { apiFetch } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import type { Paginated } from "@/lib/api/types";
import type { ApiOrderDetail, ApiOrderSummary } from "./checkout-types";

export async function fetchOrderAction(orderId: string): Promise<ApiOrderDetail | null> {
  const token = await getToken();
  if (!token) return null;
  try {
    return await apiFetch<ApiOrderDetail>(`/orders/${encodeURIComponent(orderId)}`, { token, cache: "no-store" });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

/** This account's order history, newest first. */
export async function listOrdersAction(): Promise<ApiOrderSummary[]> {
  const token = await getToken();
  if (!token) return [];
  try {
    const data = await apiFetch<Paginated<ApiOrderSummary>>("/orders", { token, searchParams: { pageSize: 100 }, cache: "no-store" });
    return data.items ?? [];
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return [];
    throw error;
  }
}
