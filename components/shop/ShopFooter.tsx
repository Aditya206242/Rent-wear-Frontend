import Link from "next/link";
import { LoopWearLogo } from "@/components/LoopWearLogo";

const SOCIAL_LINKS = [
  {
    label: "Instagram",
    href: "#",
    path: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4.2" />
        <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
      </>
    ),
  },
  {
    label: "Facebook",
    href: "#",
    path: <path d="M15.5 3h-2.8a4 4 0 0 0-4 4v2.7H6v3.6h2.7V21h3.7v-7.7h2.9l.6-3.6h-3.5V7.4a1 1 0 0 1 1-1.1h2.1Z" />,
  },
  {
    label: "X (Twitter)",
    href: "#",
    path: <path d="M18 6 6 18M6 6l12 12" />,
  },
];

const SHOP_LINKS = [
  { href: "/discover", label: "Browse Collection" },
  { href: "/discover?sort=new", label: "New Arrivals" },
  { href: "/discover", label: "Categories" },
  { href: "/discover?mode=rent", label: "Rental" },
  { href: "/discover?care=laundry", label: "Laundry" },
];

const ACCOUNT_LINKS = [
  { href: "/account/orders", label: "My Account" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/address", label: "Addresses" },
  { href: "/wishlist", label: "Wishlist" },
];

const HELP_LINKS = [
  { href: "/discover", label: "Help Centre" },
  { href: "/discover", label: "Contact Us" },
  { href: "/discover", label: "FAQs" },
  { href: "/discover", label: "Returns" },
  { href: "/discover", label: "Rental Policy" },
];

const OCCASION_LINKS: string[] = [];


function FooterColumn({ heading, links }: { heading: string; links: { href: string; label: string }[] }) {
  return (
    <nav aria-label={heading}>
      <p className="font-ui text-[11px] font-semibold uppercase tracking-[0.08em] text-white/60">{heading}</p>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={link.label}>
            <Link href={link.href} className="font-ui text-[13.5px] text-white/80 transition-colors hover:text-brand-cyan">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function ShopFooter() {
  return (
    <footer className="bg-brand-navy-dark text-white/80">
      {/* newsletter strip */}
      <div className="border-b border-white/15 px-4 py-7 md:px-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-display text-lg font-semibold text-white">Stay in the loop</p>
            <p className="mt-1 font-ui text-[13px] text-white/65">New drops, rental edits and members-only previews.</p>
          </div>
          <div className="hidden">
            <input
              type="email"
              placeholder="you@email.com"
              aria-label="Email address"
              className="w-56 rounded-lg border border-white/25 bg-white/10 px-3.5 py-2.5 font-ui text-sm text-white placeholder:text-white/45 focus:border-brand-cyan focus:outline-none sm:w-64"
            />
            <button
              type="button"
              className="shrink-0 rounded-lg bg-brand-cyan px-5 py-2.5 font-ui text-sm font-semibold text-brand-navy-dark transition-colors hover:bg-brand-cyan-light"
            >
              Subscribe
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-10 px-4 py-12 sm:grid-cols-3 md:grid-cols-[1.5fr_repeat(4,minmax(0,1fr))_1.7fr] md:px-10">
        <div className="col-span-2 sm:col-span-3 md:col-span-1">
          <Link
            href="/discover"
            aria-label="LoopWear home"
            className="inline-flex rounded-xl bg-white px-3 py-2.5 shadow-sm transition-transform hover:-translate-y-0.5"
          >
            <LoopWearLogo size="sm" showTagline={false} />
          </Link>
          <p className="mt-3 max-w-[26ch] font-ui text-[13.5px] leading-relaxed text-white/65">
            Premium fashion, rented or owned — delivered, dry-cleaned and ready to wear.
          </p>
          <div className="mt-4 flex items-center gap-2.5">
            {SOCIAL_LINKS.map((social) => (
              <Link
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 text-white/75 transition-colors hover:border-brand-cyan hover:text-brand-cyan"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                  {social.path}
                </svg>
              </Link>
            ))}
          </div>
        </div>

        <FooterColumn heading="Shop" links={SHOP_LINKS} />
        <FooterColumn heading="Account" links={ACCOUNT_LINKS} />
        <FooterColumn heading="Help" links={HELP_LINKS} />

        <nav aria-label="Company">
          <p className="font-ui text-[11px] font-semibold uppercase tracking-[0.08em] text-white/60">Company</p>
          <ul className="mt-4 space-y-2.5">
            <li><Link href="/discover" className="font-ui text-[13.5px] text-white/70 transition-colors hover:text-brand-cyan">About us</Link></li>
            <li><Link href="/discover" className="font-ui text-[13.5px] text-white/70 transition-colors hover:text-brand-cyan">Terms</Link></li>
            <li><Link href="/discover" className="font-ui text-[13.5px] text-white/70 transition-colors hover:text-brand-cyan">Privacy</Link></li>
            {OCCASION_LINKS.map((occasion) => (
              <li key={occasion}>
                <Link
                  href={`/discover?occasion=${encodeURIComponent(occasion)}`}
                  className="font-ui text-[13.5px] text-white/80 transition-colors hover:text-brand-cyan"
                >
                  {occasion}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="font-ui text-[11px] font-semibold uppercase tracking-[0.08em] text-white/60">Newsletter</p>
          <p className="mt-4 font-ui text-[13px] leading-relaxed text-white/50">One email a month. New arrivals, rental drops, nothing else.</p>
          <div className="mt-3 space-y-2">
            <input
              type="email"
              placeholder="you@email.com"
              aria-label="Newsletter email address"
              className="w-full rounded-lg border border-white/15 bg-white/[0.06] px-3.5 py-2.5 font-ui text-sm text-white placeholder:text-white/35 focus:border-white/15"
            />
            <button type="button" className="w-full rounded-lg border border-brand-cyan bg-transparent px-4 py-2.5 font-ui text-sm font-semibold text-brand-cyan transition-colors hover:bg-brand-cyan hover:text-brand-navy-dark">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-white/15 px-4 py-5 md:px-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <p className="font-ui text-xs text-white/60">© {new Date().getFullYear()} LoopWear. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link href="/sign-in" className="font-ui text-xs text-white/60 hover:text-brand-cyan">
              Sign in
            </Link>
            <Link href="/sign-up" className="font-ui text-xs text-white/60 hover:text-brand-cyan">
              Create account
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
