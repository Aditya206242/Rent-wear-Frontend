import { apiFetch } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import type { Paginated } from "@/lib/api/types";
import { getToken } from "@/lib/auth/session";
import type {
  ApiAnalyticsSeries,
  ApiConsoleCustomer,
  ApiConsoleOrder,
  ApiDeliveryJob,
  ApiGarmentUnit,
  ApiLaundryBatch,
  ApiLifecycleCounts,
  ApiNotification,
  ApiPayment,
} from "./api-types";
import type {
  Customer,
  DeliveryJob,
  Garment,
  LaundryBatch,
  LifecycleStage,
  Notification,
  Order,
  Payment,
} from "./types";
import { LIFECYCLE_STAGES } from "./types";

async function operatorToken(): Promise<string> {
  const token = await getToken();
  if (!token) throw new ApiError(401, "unauthorized", "You're not signed in as an operator.");
  return token;
}

const rupees = (paise: number) => Math.round(paise / 100);

// ---------- Garment Inventory ----------

function adaptGarmentUnit(api: ApiGarmentUnit): Garment {
  return {
    id: api.id,
    sku: api.sku,
    name: api.name,
    category: api.category,
    size: api.size,
    color: api.color,
    stage: api.stage,
    lastMovedAt: api.lastMovedAt,
    timesRented: api.timesRented,
    condition: api.condition,
    currentCustomer: api.currentCustomerName ?? undefined,
  };
}

export async function listGarmentUnits(params: { stage?: string; q?: string; page?: number; pageSize?: number } = {}) {
  const token = await operatorToken();
  const data = await apiFetch<Paginated<ApiGarmentUnit>>("/console/garment-units", { token, searchParams: params });
  return { ...data, items: data.items.map(adaptGarmentUnit) };
}

export async function getLifecycleCounts(): Promise<Record<LifecycleStage, number>> {
  const token = await operatorToken();
  const data = await apiFetch<ApiLifecycleCounts>("/console/lifecycle/counts", { token });
  const counts = {} as Record<LifecycleStage, number>;
  for (const stage of LIFECYCLE_STAGES) counts[stage] = data[stage] ?? 0;
  return counts;
}

// ---------- Orders ----------

function adaptOrder(api: ApiConsoleOrder): Order {
  return {
    id: api.id,
    customer: api.customerName,
    garments: api.garmentNames,
    placedAt: api.placedAt,
    eventDate: api.eventDate,
    status: api.status,
    total: rupees(api.totalPaise),
    city: api.city,
  };
}

export async function listConsoleOrders(params: { status?: string; q?: string; page?: number; pageSize?: number } = {}) {
  const token = await operatorToken();
  const data = await apiFetch<Paginated<ApiConsoleOrder>>("/console/orders", { token, searchParams: params });
  return { ...data, items: data.items.map(adaptOrder) };
}

// ---------- Customers ----------

function adaptCustomer(api: ApiConsoleCustomer): Customer {
  return {
    id: api.id,
    name: api.name,
    email: api.email,
    memberSince: api.memberSince,
    totalRentals: api.totalRentals,
    onTimeRate: api.onTimeRate,
    tier: api.tier,
  };
}

export async function listConsoleCustomers(params: { q?: string; page?: number; pageSize?: number } = {}) {
  const token = await operatorToken();
  const data = await apiFetch<Paginated<ApiConsoleCustomer>>("/console/customers", { token, searchParams: params });
  return { ...data, items: data.items.map(adaptCustomer) };
}

// ---------- Laundry ----------

function adaptLaundryBatch(api: ApiLaundryBatch): LaundryBatch {
  const etaMinutes =
    api.etaMinutes ?? Math.max(0, Math.round((new Date(api.estimatedCompleteAt).getTime() - Date.now()) / 60_000));
  return {
    id: api.id,
    garmentCount: api.garmentCount,
    stage: api.stage,
    facility: api.facility,
    startedAt: api.startedAt,
    etaMinutes,
    priority: api.priority,
  };
}

export async function listLaundryBatches(): Promise<LaundryBatch[]> {
  const token = await operatorToken();
  const data = await apiFetch<{ items: ApiLaundryBatch[] }>("/console/laundry/batches", { token });
  return data.items.map(adaptLaundryBatch);
}

// ---------- Delivery ----------

function formatWindow(start: string, end: string) {
  const fmt = (iso: string) => new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${fmt(start)} – ${fmt(end)}`;
}

function adaptDeliveryJob(api: ApiDeliveryJob): DeliveryJob {
  return {
    id: api.id,
    type: api.type,
    customer: api.customer,
    window: formatWindow(api.windowStart, api.windowEnd),
    zone: api.zone,
    courier: api.courier?.name ?? "Unassigned",
    status: api.status === "en_route" ? "en route" : api.status,
  };
}

export async function listDeliveryJobs(params: { status?: string; type?: string } = {}): Promise<DeliveryJob[]> {
  const token = await operatorToken();
  const data = await apiFetch<{ items: ApiDeliveryJob[] }>("/console/delivery-jobs", { token, searchParams: params });
  return data.items.map(adaptDeliveryJob);
}

// ---------- Payments ----------

function adaptPayment(api: ApiPayment): Payment {
  return {
    id: api.id,
    order: api.order,
    customer: api.customer,
    amount: rupees(api.amountPaise),
    method: api.method === "bank_transfer" ? "bank transfer" : api.method,
    status: api.status,
    date: api.date,
  };
}

export async function listConsolePayments(params: { status?: string; page?: number } = {}) {
  const token = await operatorToken();
  const data = await apiFetch<Paginated<ApiPayment>>("/console/payments", { token, searchParams: params });
  return { ...data, items: data.items.map(adaptPayment) };
}

// ---------- Analytics ----------

export async function getAnalyticsMetric(
  metric: "utilization" | "revenue" | "turnaround" | "overdue"
): Promise<{ label: string; unit: string; points: number[]; changePct: number; narrative: string }> {
  const token = await operatorToken();
  const data = await apiFetch<ApiAnalyticsSeries>(`/console/analytics/${metric}`, { token });
  const points = data.series.map((p) => p.value);
  const first = points[0] ?? 0;
  const last = points[points.length - 1] ?? 0;
  const changePct = first === 0 ? 0 : Math.round(((last - first) / first) * 100);
  const unit = metric === "revenue" ? "₹k" : metric === "turnaround" ? "hrs" : metric === "overdue" ? "orders" : "%";
  return { label: data.label, unit, points, changePct, narrative: data.narrative };
}

// ---------- Notifications ----------

function adaptNotification(api: ApiNotification): Notification {
  return {
    id: api.id,
    severity: api.severity,
    title: api.title,
    detail: api.detail,
    timestamp: api.createdAt,
    read: api.read,
  };
}

export async function listConsoleNotifications(): Promise<{ items: Notification[]; unreadCount: number }> {
  const token = await operatorToken();
  const data = await apiFetch<{ items: ApiNotification[]; unreadCount: number }>("/console/notifications", { token });
  return { items: data.items.map(adaptNotification), unreadCount: data.unreadCount };
}
