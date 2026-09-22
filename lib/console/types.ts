import type { LucideIcon } from "lucide-react";
import { Shirt, CalendarClock, UserRound, Undo2, SearchCheck, Droplets, BadgeCheck, Sparkles } from "lucide-react";

export const LIFECYCLE_STAGES = [
  "available",
  "reserved",
  "rented",
  "returned",
  "inspection",
  "laundry",
  "quality",
  "ready",
] as const;

export type LifecycleStage = (typeof LIFECYCLE_STAGES)[number];

export const STAGE_META: Record<
  LifecycleStage,
  { label: string; short: string; icon: LucideIcon; color: string; description: string }
> = {
  available: {
    label: "Available",
    short: "AVL",
    icon: Shirt,
    color: "var(--color-stage-available)",
    description: "On the rack, ready to reserve",
  },
  reserved: {
    label: "Reserved",
    short: "RSV",
    icon: CalendarClock,
    color: "var(--color-stage-reserved)",
    description: "Held against an upcoming order",
  },
  rented: {
    label: "Rented",
    short: "RNT",
    icon: UserRound,
    color: "var(--color-stage-rented)",
    description: "Out with a customer",
  },
  returned: {
    label: "Returned",
    short: "RTN",
    icon: Undo2,
    color: "var(--color-stage-returned)",
    description: "Back at the facility, unprocessed",
  },
  inspection: {
    label: "Inspection",
    short: "INS",
    icon: SearchCheck,
    color: "var(--color-stage-inspection)",
    description: "Checked for damage or wear",
  },
  laundry: {
    label: "Laundry",
    short: "LDY",
    icon: Droplets,
    color: "var(--color-stage-laundry)",
    description: "In the wash cycle",
  },
  quality: {
    label: "Quality check",
    short: "QC",
    icon: BadgeCheck,
    color: "var(--color-stage-quality)",
    description: "Final press and check",
  },
  ready: {
    label: "Ready again",
    short: "RDY",
    icon: Sparkles,
    color: "var(--color-stage-ready)",
    description: "Back on the rack",
  },
};

export type Garment = {
  id: string;
  sku: string;
  name: string;
  category: string;
  size: string;
  color: string;
  stage: LifecycleStage;
  lastMovedAt: string;
  timesRented: number;
  condition: "excellent" | "good" | "fair" | "needs review";
  currentCustomer?: string;
};

export type OrderStatus = "confirmed" | "packed" | "shipped" | "with customer" | "return in transit" | "closed";

export type Order = {
  id: string;
  customer: string;
  garments: string[];
  placedAt: string;
  eventDate: string;
  status: OrderStatus;
  total: number;
  city: string;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  memberSince: string;
  totalRentals: number;
  onTimeRate: number;
  tier: "signature" | "member" | "new";
};

export type LaundryBatch = {
  id: string;
  garmentCount: number;
  stage: "received" | "washing" | "drying" | "pressing" | "quality" | "ready";
  facility: string;
  startedAt: string;
  etaMinutes: number;
  priority: "standard" | "rush";
};

export type DeliveryJob = {
  id: string;
  type: "pickup" | "dropoff";
  customer: string;
  window: string;
  zone: string;
  courier: string;
  status: "scheduled" | "en route" | "completed" | "delayed";
};

export type Payment = {
  id: string;
  order: string;
  customer: string;
  amount: number;
  method: "card" | "wallet" | "bank transfer";
  status: "paid" | "pending" | "refunded" | "failed";
  date: string;
};

export type Notification = {
  id: string;
  severity: "info" | "warning" | "danger" | "success";
  title: string;
  detail: string;
  timestamp: string;
  read: boolean;
};

export type AnalyticsSeries = {
  label: string;
  unit: string;
  points: number[];
  changePct: number;
  narrative: string;
};

export type ProductView = "front" | "back" | "fabric" | "model" | "detail";

export type AdminProduct = {
  id: string;
  name: string;
  brand: string;
  category: string;
  occasions: string[];
  styles: string[];
  color: string;
  colorHex: string;
  rentPrice: number;
  rentDays: number;
  buyPrice: number;
  deposit: number;
  deliveryDays: number;
  fabric: string;
  care: string[];
  views: ProductView[];
  measurements: { label: string; value: string }[];
  imageUrls: Partial<Record<ProductView, string>>;
  isActive: boolean;
  createdAt: string;
  unitCount: number;
};

export type Courier = { id: string; name: string; zones: string[] };
export type Facility = { id: string; name: string; city: string };
