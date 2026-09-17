import Link from "next/link";
import type { Occasion } from "@/lib/shop/types";

export function OccasionStrip({
  active,
  occasions,
}: {
  active?: Occasion;
  occasions: { code: string; label: Occasion; count: number }[];
}) {
  return (
    <nav aria-label="Shop by occasion" className="overflow-x-auto">
      <ul className="flex gap-2 px-4 py-3 md:px-10">
        <li>
          <Link
            href="/discover"
            scroll={false}
            className={`relative flex h-14 w-32 shrink-0 items-center rounded-lg border px-3 transition-colors ${
              !active ? "border-brand-navy bg-brand-navy text-white" : "border-brand-navy/15 text-brand-navy hover:border-brand-navy/35"
            }`}
          >
            {!active && <span aria-hidden="true" className="absolute inset-x-0 top-0 h-0.5 rounded-t-lg bg-brand-cyan" />}
            <span className="font-display text-base font-medium">Everything</span>
          </Link>
        </li>
        {occasions.map((occasion) => {
          const isActive = active === occasion.label;
          return (
            <li key={occasion.code}>
              <Link
                href={`/discover?occasion=${encodeURIComponent(occasion.label)}`}
                scroll={false}
                aria-current={isActive ? "page" : undefined}
                className={`relative flex h-14 w-32 shrink-0 items-center rounded-lg border px-3 transition-colors ${
                  isActive ? "border-brand-navy bg-brand-navy text-white" : "border-brand-navy/15 text-brand-navy hover:border-brand-navy/35"
                }`}
              >
                {isActive && <span aria-hidden="true" className="absolute inset-x-0 top-0 h-0.5 rounded-t-lg bg-brand-cyan" />}
                <span className="font-display text-base font-medium">{occasion.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
