import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ApiOccasion } from "@/lib/shop/api-types";

/**
 * Tiles are admin-managed (see the admin console's Shop by Occasion
 * screen) — an occasion with no uploaded imageUrl yet is left out of the
 * grid entirely rather than filled with placeholder/stock imagery. If
 * nothing has been configured yet, the whole section renders nothing.
 */
export function OccasionShowcase({ occasions }: { occasions: ApiOccasion[] }) {
  const tiles = occasions.filter(
    (occasion): occasion is ApiOccasion & { imageUrl: string; blurb: string } =>
      Boolean(occasion.imageUrl && occasion.blurb)
  );

  if (tiles.length === 0) return null;

  return (
    <section aria-labelledby="shop-by-occasion" className="px-4 py-7 md:px-10 md:py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-wide text-brand-cyan-deep">Curated edits</p>
          <h2 id="shop-by-occasion" className="mt-1 font-ui text-3xl font-semibold tracking-tight text-brand-navy sm:text-4xl">
            Shop by Occasion
          </h2>
        </div>
        <div className="hidden max-w-[30ch] text-right sm:block">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-cyan-deep">Laundry care, handled</p>
          <p className="mt-1 font-ui text-sm leading-relaxed text-brand-navy/55">Fresh, dry-cleaned pieces ready for every occasion.</p>
          <Link href="/Laundry" className="mt-2 inline-flex font-mono text-[10px] font-semibold uppercase tracking-wide text-brand-navy transition-colors hover:text-brand-cyan-deep">
            Explore laundry <ArrowUpRight size={12} strokeWidth={2} />
          </Link>
        </div>
      </div>

      <ul className="mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-1 sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {tiles.map((tile) => {
          return (
            <li key={tile.code} className="w-60 shrink-0 snap-start sm:min-h-75 sm:w-auto">
              <Link
                href={`/discover?occasion=${encodeURIComponent(tile.label)}`}
                className="group relative block aspect-[2.7/4] overflow-hidden rounded-xl border border-brand-navy/10 transition-shadow duration-300 hover:shadow-[0_20px_44px_-20px_rgba(11,31,58,0.4)]"
              >
                <div
                  className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-[1.06]"
                  style={{ backgroundImage: `url(${tile.imageUrl})`, backgroundPosition: "center", backgroundSize: "cover" }}
                />

                <div
                  aria-hidden="true"
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to top, rgba(15,29,56,0.92) 0%, rgba(15,29,56,0.28) 55%, transparent 78%)" }}
                />

                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="font-ui text-xl font-semibold tracking-tight text-white">{tile.label}</p>
                  <span className="mt-1.5 block h-px w-6 bg-brand-cyan/60 transition-all duration-300 group-hover:w-12 group-hover:bg-brand-cyan" />
                  <p className="mt-1.5 font-ui text-[11.5px] text-white/60">{tile.blurb}</p>
                  <span className="mt-1.5 flex items-center gap-1 font-mono text-[10px] font-semibold uppercase tracking-wide text-brand-cyan-light">
                    Shop now
                    <ArrowUpRight size={12} strokeWidth={2} />
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
        <li className="w-60 shrink-0 snap-start sm:min-h-75 sm:w-auto xl:col-span-3 xl:h-full">
          <Link
            href="/Laundry"
            className="group relative flex aspect-[2.7/1] flex-col justify-end overflow-hidden rounded-xl border border-brand-cyan/30 p-5 transition-shadow duration-300 hover:shadow-[0_20px_44px_-20px_rgba(11,31,58,0.4)] xl:aspect-auto xl:h-full"
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.04]"
              style={{ backgroundImage: "url(https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=1400&q=85)" }}
            />
            <div aria-hidden="true" className="absolute inset-0 bg-linear-to-r from-brand-navy-dark via-brand-navy-dark/75 to-brand-navy-dark/20" />
            <div className="absolute right-5 top-5 z-10 bg-brand-cyan px-4 py-3 text-center text-brand-navy-dark shadow-[0_12px_28px_-12px_rgba(34,211,238,0.8)]">
              <p className="font-ui text-3xl font-bold leading-none">20%</p>
              <p className="mt-1 font-mono text-[9px] font-bold uppercase tracking-[0.14em]">off first order</p>
            </div>
            <div className="relative">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-cyan">Professional garment care</p>
              <p className="mt-2 font-ui text-3xl font-semibold leading-tight text-white">Fresh clothes. Zero effort.</p>
              <p className="mt-2 font-ui text-base font-medium text-white/85">Give every favourite piece a longer life.</p>
              <p className="mt-2 max-w-[42ch] font-ui text-sm leading-relaxed text-white/70">Pickup, careful cleaning, and a ready-to-wear finish, handled by our laundry team.</p>
              <span className="mt-4 inline-flex items-center gap-1 font-mono text-[10px] font-semibold uppercase tracking-wide text-brand-cyan-light">
                Explore laundry service
                <ArrowUpRight size={12} strokeWidth={2} />
              </span>
            </div>
          </Link>
        </li>
      </ul>
    </section>
  );
}
