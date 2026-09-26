import { OccasionShowcase } from "@/components/shop/OccasionShowcase";
import { DiscoverPreviewGrid } from "@/components/shop/DiscoverPreviewGrid";
import { listOccasionsWithCounts, listProducts } from "@/lib/shop/api";

export const metadata = { title: "Discover — LoopWear" };

type Props = {
  searchParams: Promise<{ occasion?: string; q?: string }>;
};

export default async function DiscoverPage({ searchParams }: Props) {
  await searchParams;
  const [occasions, catalog] = await Promise.all([
    listOccasionsWithCounts().catch(() => []),
    listProducts({ pageSize: 100 }).catch(() => ({ items: [], page: 1, pageSize: 100, total: 0, totalPages: 0 })),
  ]);

  return (
    <div>
      <OccasionShowcase occasions={occasions} />

      <div id="collection">
        <DiscoverPreviewGrid garments={catalog.items} />
      </div>
    </div>
  );
}
