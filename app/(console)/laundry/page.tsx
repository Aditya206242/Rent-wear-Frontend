import { GlanceStrip } from "@/components/console/GlanceStrip";
import { BatchRow } from "@/components/console/BatchRow";
import { listLaundryBatches } from "@/lib/console/api";

export const metadata = { title: "Laundry Operations — LoopWear Console" };

export default async function LaundryPage() {
  const batches = await listLaundryBatches();
  const totalGarments = batches.reduce((sum, b) => sum + b.garmentCount, 0);
  const rush = batches.filter((b) => b.priority === "rush").length;
  const nearingReady = batches.filter((b) => b.etaMinutes <= 15).length;

  return (
    <div>
      <GlanceStrip
        items={[
          { label: "Active batches", value: String(batches.length) },
          { label: "Garments in process", value: String(totalGarments) },
          { label: "Rush batches", value: String(rush), tone: rush > 0 ? "warning" : "default" },
          { label: "Nearing ready", value: String(nearingReady), tone: "success" },
        ]}
      />

      <div>
        {batches.map((batch) => (
          <BatchRow key={batch.id} batch={batch} />
        ))}
      </div>
    </div>
  );
}
