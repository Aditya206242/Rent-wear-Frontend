import type { LucideIcon } from "lucide-react";
import {
  Compass,
  Repeat2,
  Shirt,
  Tag,
  Droplets,
  ScrollText,
  Users,
  Truck,
  Receipt,
  Activity,
  BellRing,
  SlidersHorizontal,
} from "lucide-react";

export type Platform = {
  number: string;
  code: string;
  label: string;
  href: string;
  icon: LucideIcon;
};

export const PLATFORMS: Platform[] = [
  { number: "01", code: "OVW", label: "Overview", href: "/overview", icon: Compass },
  { number: "02", code: "OPS", label: "Rental Operations", href: "/operations", icon: Repeat2 },
  { number: "03", code: "PRD", label: "Product Catalog", href: "/products", icon: Tag },
  { number: "04", code: "INV", label: "Garment Inventory", href: "/inventory", icon: Shirt },
  { number: "05", code: "LDY", label: "Laundry Operations", href: "/laundry", icon: Droplets },
  { number: "06", code: "ORD", label: "Orders", href: "/orders", icon: ScrollText },
  { number: "07", code: "CUS", label: "Customers", href: "/customers", icon: Users },
  { number: "08", code: "DLV", label: "Delivery / Pickup", href: "/delivery", icon: Truck },
  { number: "09", code: "PAY", label: "Payments", href: "/payments", icon: Receipt },
  { number: "10", code: "ANL", label: "Analytics", href: "/analytics", icon: Activity },
  { number: "11", code: "NTF", label: "Notifications", href: "/notifications", icon: BellRing },
  { number: "12", code: "SET", label: "Settings", href: "/settings", icon: SlidersHorizontal },
];
