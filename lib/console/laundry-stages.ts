import { Inbox, WashingMachine, Wind, Shirt as PressIcon, BadgeCheck, PackageCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { LaundryBatch } from "./types";

export const LAUNDRY_STAGE_ORDER: LaundryBatch["stage"][] = ["received", "washing", "drying", "pressing", "quality", "ready"];

export const LAUNDRY_STAGE_META: Record<LaundryBatch["stage"], { label: string; icon: LucideIcon }> = {
  received: { label: "Received", icon: Inbox },
  washing: { label: "Washing", icon: WashingMachine },
  drying: { label: "Drying", icon: Wind },
  pressing: { label: "Pressing", icon: PressIcon },
  quality: { label: "Quality check", icon: BadgeCheck },
  ready: { label: "Ready", icon: PackageCheck },
};
