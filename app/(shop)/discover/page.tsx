import { OccasionStrip } from "@/components/shop/OccasionStrip";
import { DiscoverFeed } from "@/components/shop/DiscoverFeed";
import { listProducts, listOccasionsWithCounts, listOutfits } from "@/lib/shop/api";
import { ApiError } from "@/lib/api/errors";
import type { Occasion } from "@/lib/shop/types";

export const metadata = { title: "Discover — LoopWear" };

type Props = { searchParams: Promise<{ occasion?: string; q?: string }> };

export default async function DiscoverPage({ searchParams }: Props) {
  const { occasion: occasionParam, q } = await searchParams;
  const activeOccasion = occasionParam as Occasion | undefined;

  const [productsResult, occasionsResult, outfitsResult] = await Promise.allSettled([
    listProducts({ occasion: activeOccasion, q, pageSize: 24 }),
    listOccasionsWithCounts(),
    listOutfits(activeOccasion),
  ]);

  const catalogFailed = productsResult.status === "rejected";
  const garments = productsResult.status === "fulfilled" ? productsResult.value.items : [];
  const occasions = occasionsResult.status === "fulfilled" ? occasionsResult.value : [];
  const outfits = outfitsResult.status === "fulfilled" ? outfitsResult.value : [];
  const totalCount = productsResult.status === "fulfilled" ? productsResult.value.total : 0;

  return (
    <div>
      <div className="border-b border-brand-navy/10 px-4 pt-8 pb-2 md:px-10">
        <p className="font-mono text-xs uppercase tracking-wide text-brand-gold-deep">What are you dressing for?</p>
        <h1 className="mt-1 font-display text-3xl font-medium text-brand-navy">
          {activeOccasion ?? (q ? `Results for "${q}"` : "Today's edit")}
        </h1>
      </div>

      <OccasionStrip active={activeOccasion} occasions={occasions} totalCount={totalCount} />

      {catalogFailed ? (
        <div className="mx-4 my-8 border border-signal-danger/30 bg-signal-danger/5 px-6 py-8 text-center md:mx-10">
          <p className="font-display text-lg text-brand-navy">Couldn&apos;t load the catalog</p>
          <p className="mt-2 font-ui text-sm text-brand-navy/60">
            {productsResult.reason instanceof ApiError
              ? productsResult.reason.message
              : "Something went wrong talking to the backend."}
          </p>
        </div>
      ) : (
        <DiscoverFeed garments={garments} outfits={outfits} />
      )}
    </div>
  );
}
