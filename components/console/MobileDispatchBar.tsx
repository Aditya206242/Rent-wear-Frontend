"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, X, Plus } from "lucide-react";
import { PLATFORMS } from "@/lib/console/platforms";
import { CommandTrigger } from "./CommandTrigger";
import { Search } from "lucide-react";

export function MobileDispatchBar() {
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);
  const current = PLATFORMS.find((p) => pathname?.startsWith(p.href));

  return (
    <>
      <nav
        aria-label="Console navigation"
        className="fixed inset-x-0 bottom-0 z-30 flex items-stretch border-t border-brand-navy/10 bg-white md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          aria-haspopup="dialog"
          className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-brand-navy"
        >
          <LayoutGrid size={18} strokeWidth={1.5} />
          <span className="font-mono text-[9px] uppercase tracking-wide text-brand-navy/50">Platforms</span>
        </button>

        <CommandTrigger className="flex flex-[2] flex-col items-center justify-center gap-0.5 border-x border-brand-navy/10 py-2.5 text-brand-navy">
          <span className="flex items-center gap-1.5">
            <Search size={14} strokeWidth={1.5} className="text-brand-navy/50" />
            <span className="font-ui text-sm font-medium">{current?.label ?? "Search"}</span>
          </span>
          <span className="font-mono text-[9px] uppercase tracking-wide text-brand-navy/40">Tap to search</span>
        </CommandTrigger>

        <Link href="/orders" className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-brand-gold-deep">
          <Plus size={18} strokeWidth={2} />
          <span className="font-mono text-[9px] uppercase tracking-wide">Dispatch</span>
        </Link>
      </nav>

      {sheetOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="All platforms"
          className="fixed inset-0 z-[90] flex flex-col bg-brand-navy md:hidden"
        >
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <span className="font-display text-lg text-white">All platforms</span>
            <button type="button" onClick={() => setSheetOpen(false)} aria-label="Close" className="text-white/70">
              <X size={22} strokeWidth={1.5} />
            </button>
          </div>
          <ul className="grid flex-1 grid-cols-2 gap-2.5 overflow-y-auto p-4 content-start">
            {PLATFORMS.map((p) => {
              const Icon = p.icon;
              const active = pathname?.startsWith(p.href);
              return (
                <li key={p.href}>
                  <Link
                    href={p.href}
                    onClick={() => setSheetOpen(false)}
                    className={`flex h-28 flex-col justify-between border p-3.5 transition-colors ${
                      active ? "border-brand-gold bg-white/10" : "border-white/10 bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-white/40">{p.number}</span>
                      <Icon size={16} strokeWidth={1.5} className={active ? "text-brand-gold" : "text-white/60"} />
                    </div>
                    <span className="font-ui text-sm font-medium leading-tight text-white">{p.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </>
  );
}
