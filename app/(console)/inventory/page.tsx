import { GlanceStrip } from "@/components/console/GlanceStrip";
import { InventoryBoard } from "@/components/console/InventoryBoard";
import { listGarmentUnits } from "@/lib/console/api";
import { LIFECYCLE_STAGES, type LifecycleStage } from "@/lib/console/types";

export const metadata = { title: "Garment Inventory — LoopWear Console" };

type Props = { searchParams: Promise<{ stage?: string }> };

export default async function InventoryPage({ searchParams }: Props) {
  const { stage } = await searchParams;
  const initialStage = LIFECYCLE_STAGES.includes(stage as LifecycleStage) ? (stage as LifecycleStage) : undefined;

  // InventoryBoard filters client-side over this list — fine at prototype
  // scale, but at real inventory volume the stage/search filters should
  // move server-side (query params) instead of fetching everything here.
  const { items: garments, total } = await listGarmentUnits({ pageSize: 200 });

  const excellent = garments.filter((g) => g.condition === "excellent").length;
  const needsReview = garments.filter((g) => g.condition === "needs review").length;

  return (
    <div>
      <GlanceStrip
        items={[
          { label: "Total garments", value: String(total) },
          { label: "In excellent condition", value: String(excellent), tone: "success" },
          { label: "Needs review", value: String(needsReview), tone: needsReview > 0 ? "warning" : "default" },
        ]}
      />
      <InventoryBoard garments={garments} initialStage={initialStage} />
    </div>
  );
}
