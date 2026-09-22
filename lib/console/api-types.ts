import type { LifecycleStage, OrderStatus, Garment } from "./types";

/**
 * Console (operator) endpoint shapes — verified directly against the real
 * backend (src/modules/console/*). Every field below is now what the
 * backend actually returns; the adapters in api.ts stay defensive
 * (optional chaining, fallbacks) as a courtesy, not because the shape is
 * still a guess.
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

export type ApiConsoleProduct = {
  id: string;
  name: string;
  brand: string;
  category: string;
  occasions: string[];
  styles: string[];
  color: string;
  colorHex: string;
  rentPricePaise: number;
  rentDays: number;
  buyPricePaise: number;
  depositPaise: number;
  deliveryDays: number;
  fabric: string;
  care: string[];
  views: string[];
  measurements: { label: string; value: string }[];
  imageUrls: Partial<Record<"front" | "back" | "fabric" | "model" | "detail", string>>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  unitCount: number;
};

export type ApiCourier = { id: string; name: string; zones: string[] };
export type ApiFacility = { id: string; name: string; city: string };
