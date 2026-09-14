"use client";

import { usePathname } from "next/navigation";
import { PLATFORMS } from "@/lib/console/platforms";

export function SectionTitle() {
  const pathname = usePathname();
  const current = PLATFORMS.find((p) => pathname?.startsWith(p.href));

  return (
    <div className="flex items-baseline gap-3">
      <span className="font-mono text-xs text-brand-gold-deep">{current?.number ?? "00"}</span>
      <h1 className="font-display text-2xl font-medium tracking-tight text-brand-navy">
        {current?.label ?? "Console"}
      </h1>
    </div>
  );
}
