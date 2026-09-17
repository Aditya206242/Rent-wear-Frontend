import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroVisual } from "./HeroVisual";

export function HeroSection() {
  return (
    <div className="relative overflow-hidden bg-brand-navy-dark px-4 py-14 md:px-10 md:py-20">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(560px 420px at 82% 20%, rgba(34,211,238,0.16), transparent 70%)" }}
        aria-hidden="true"
      />
      <div className="relative flex flex-col items-start gap-10 md:flex-row md:items-center md:justify-between">
        <div className="max-w-lg">
          <span className="font-ui text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-cyan">
            New season — now live
          </span>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.08] text-white sm:text-5xl">
            Rent the runway.
            <br />
            Own your style.
          </h1>
          <p className="mt-5 max-w-md font-ui text-[15.5px] leading-relaxed text-white/65">
            Designer occasionwear and everyday staples — rent for the moment or buy to keep, delivered and dry-cleaned for you.
          </p>
          <div className="mt-8 flex flex-wrap gap-3.5">
            <Link
              href="#collection"
              className="group inline-flex items-center gap-2 rounded-lg bg-brand-cyan px-6 py-3.5 font-ui text-sm font-semibold text-brand-navy-dark transition-colors hover:bg-brand-cyan-light active:scale-[0.98]"
            >
              Shop Rentals
              <ArrowRight size={16} strokeWidth={2} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/looks"
              className="group inline-flex items-center gap-2 rounded-lg border border-white/30 px-6 py-3.5 font-ui text-sm font-semibold text-white transition-colors hover:border-white/60 active:scale-[0.98]"
            >
              New Arrivals
              <ArrowRight size={16} strokeWidth={2} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        <HeroVisual />
      </div>
    </div>
  );
}
