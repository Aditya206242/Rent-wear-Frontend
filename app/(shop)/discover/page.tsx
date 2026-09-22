import { OccasionShowcase } from "@/components/shop/OccasionShowcase";
import { DiscoverPreviewGrid } from "@/components/shop/DiscoverPreviewGrid";
import { listOccasionsWithCounts, listProducts } from "@/lib/shop/api";

export const metadata = { title: "Discover — LoopWear" };

type Props = {
  searchParams: Promise<{ occasion?: string; q?: string }>;
};

export default async function DiscoverPage({ searchParams }: Props) {
  await searchParams;
  const [occasions, catalog] = await Promise.all([listOccasionsWithCounts(), listProducts({ pageSize: 100 })]);

  return (
    <div>
      <OccasionShowcase occasions={occasions} />

      {/*
      <div className="border-t border-brand-navy/10 px-4 pt-8 pb-2 md:px-10">
        <p className="font-mono text-xs uppercase tracking-wide text-brand-cyan-deep">What are you dressing for?</p>
        <h2 className="mt-1 font-display text-3xl font-medium text-brand-navy">
          {activeOccasion ?? (q ? `Results for "${q}"` : "Today's edit")}
        </h2>
      </div>
      <OccasionStrip active={activeOccasion} occasions={occasions} />
      */}

      <div id="collection">
        <DiscoverPreviewGrid garments={catalog.items} />
      </div>
    </div>
  );
}
