import Link from "next/link";
import type { Occasion } from "@/lib/shop/types";

export function OccasionStrip({
  active,
  occasions,
  totalCount,
}: {
  active?: Occasion;
  occasions: { code: string; label: Occasion; count: number }[];
  totalCount: number;
}) {
  return (
    <nav aria-label="Shop by occasion" className="overflow-x-auto">
      <ul className="flex gap-2 px-4 py-4 md:px-10">
        <li>
          <Link
            href="/discover"
            className={`flex h-20 w-32 shrink-0 flex-col justify-between border p-3 transition-colors ${
              !active ? "border-brand-navy bg-brand-navy text-white" : "border-brand-navy/15 text-brand-navy hover:border-brand-navy/35"
            }`}
          >
            <span className="font-display text-base font-medium">Everything</span>
            <span className={`font-mono text-[10px] uppercase tracking-wide ${!active ? "text-white/60" : "text-brand-navy/45"}`}>
              {totalCount} pieces
            </span>
          </Link>
        </li>
        {occasions.map((occasion) => {
          const isActive = active === occasion.label;
          return (
            <li key={occasion.code}>
              <Link
                href={`/discover?occasion=${encodeURIComponent(occasion.label)}`}
                aria-current={isActive ? "page" : undefined}
                className={`flex h-20 w-32 shrink-0 flex-col justify-between border p-3 transition-colors ${
                  isActive ? "border-brand-navy bg-brand-navy text-white" : "border-brand-navy/15 text-brand-navy hover:border-brand-navy/35"
                }`}
              >
                <span className="font-display text-base font-medium">{occasion.label}</span>
                <span className={`font-mono text-[10px] uppercase tracking-wide ${isActive ? "text-white/60" : "text-brand-navy/45"}`}>
                  {occasion.count} pieces
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
