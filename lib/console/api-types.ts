import type { LifecycleStage, OrderStatus, Garment } from "./types";

/**
 * Best-effort shapes for the Console (operator) endpoints. Unlike the Shop
 * endpoints, the integration guide only gave paths for most of these — no
 * example payloads — so these are inferred from docs/BACKEND_API_SPEC.md's
 * own data model (garment_units, orders, etc.) rather than transcribed from
 * a documented response. Verify field names against the real backend once
 * its DB issue (see chat) is resolved; the adapters in api.ts are written
 * defensively (optional chaining, fallbacks) so a near-miss doesn't crash
 * the page, but they may need small renames.
 */

export type ApiGarmentUnit = {
  id: string;
  sku: string;
  productId?: string;
  name: string;
  category: string;
  size: string;
  color: string;
  stage: LifecycleStage;
  condition: Garment["condition"];
  lastMovedAt: string;
  timesRented: number;
  currentOrderId?: string | null;
  currentCustomerName?: string | null;
};

export type ApiLifecycleCounts = Partial<Record<LifecycleStage, number>> & Record<string, number>;

export type ApiConsoleOrder = {
  id: string;
  customerName: string;
  garmentNames: string[];
  placedAt: string;
  eventDate: string;
  status: OrderStatus;
  totalPaise: number;
  city: string;
};

export type ApiConsoleCustomer = {
  id: string;
  name: string;
  email: string;
  memberSince: string;
  totalRentals: number;
  onTimeRate: number;
  tier: "signature" | "member" | "new";
};

export type ApiLaundryBatch = {
  id: string;
  garmentCount: number;
  stage: "received" | "washing" | "drying" | "pressing" | "quality" | "ready";
  facility: string;
  startedAt: string;
  estimatedCompleteAt: string;
  etaMinutes?: number;
  priority: "standard" | "rush";
};

export type ApiDeliveryJob = {
  id: string;
  type: "pickup" | "dropoff";
  customer: string;
  windowStart: string;
  windowEnd: string;
  zone: string;
  courier?: { id: string; name: string } | null;
  status: "scheduled" | "en_route" | "completed" | "delayed";
};

export type ApiPayment = {
  id: string;
  order: string;
  customer: string;
  amountPaise: number;
  method: "card" | "wallet" | "bank_transfer";
  status: "paid" | "pending" | "refunded" | "failed";
  date: string;
};

export type ApiAnalyticsSeries = {
  metric: string;
  label: string;
  series: { date: string; value: number }[];
  narrative: string;
};

export type ApiNotification = {
  id: string;
  severity: "info" | "warning" | "danger" | "success";
  title: string;
  detail: string;
  createdAt: string;
  read: boolean;
};
