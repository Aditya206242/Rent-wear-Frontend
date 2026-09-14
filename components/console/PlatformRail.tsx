"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PLATFORMS } from "@/lib/console/platforms";

export function PlatformRail() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Platforms"
      className="hidden md:flex fixed inset-y-0 left-0 z-30 w-16 flex-col items-center border-r border-white/10 bg-brand-navy py-4"
    >
      <ul className="flex flex-1 flex-col items-stretch gap-0.5">
        {PLATFORMS.map((platform) => {
          const active = pathname?.startsWith(platform.href);
          const Icon = platform.icon;
          return (
            <li key={platform.href}>
              <Link
                href={platform.href}
                aria-current={active ? "page" : undefined}
                aria-label={platform.label}
                title={platform.label}
                className="flex flex-col items-center gap-1 px-2 py-2.5 text-white/50 transition-colors hover:text-white focus-visible:text-white"
              >
                <span
                  aria-hidden="true"
                  className={`h-4 w-0.5 rounded-full transition-colors ${active ? "bg-brand-gold" : "bg-transparent"}`}
                />
                <Icon size={18} strokeWidth={1.5} className={active ? "text-brand-gold" : ""} />
                <span className={`font-mono text-[9px] tracking-wider ${active ? "text-brand-gold" : ""}`}>
                  {platform.code}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
