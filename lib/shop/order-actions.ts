"use server";

import { getToken } from "@/lib/auth/session";
import { apiFetch } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";

export type ApiOrderItem = {
  id: string;
  productId: string;
  product?: { id: string; name: string; imageUrls?: Record<string, string> };
  mode: "rent" | "buy";
  size: string;
  rentStartDate: string | null;
  rentReturnDate: string | null;
  pricing: { displayCurrency: string; display: { unitPrice: number; deposit: number } };
};

export type ApiOrder = {
  id: string;
  status: string;
  statusLabel: string;
  placedAt: string;
  eventDate: string | null;
  city: string | null;
  pricing: { displayCurrency: string; display: { total: number; depositTotal: number } };
  items?: ApiOrderItem[];
};

export async function fetchOrderAction(orderId: string): Promise<ApiOrder | null> {
  const token = await getToken();
  if (!token) return null;
  try {
    return await apiFetch<ApiOrder>(`/orders/${orderId}`, { token });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}
