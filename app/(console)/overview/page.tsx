import { GlanceStrip } from "@/components/console/GlanceStrip";
import { LifecycleLine } from "@/components/console/LifecycleLine";
import { ManifestList, type ManifestItem } from "@/components/console/ManifestList";
import { DeparturesRail } from "@/components/console/DeparturesRail";
import { PulsePanel } from "@/components/console/PulsePanel";
import {
  getLifecycleCounts,
  listGarmentUnits,
  listDeliveryJobs,
  listConsoleNotifications,
  getAnalyticsMetric,
} from "@/lib/console/api";

export const metadata = { title: "Overview — LoopWear Console" };

export default async function OverviewPage() {
  const [counts, inspectionQueue, deliveryJobs, notifications, utilization, revenue] = await Promise.all([
    getLifecycleCounts(),
    listGarmentUnits({ stage: "inspection", pageSize: 1 }),
    listDeliveryJobs(),
    listConsoleNotifications(),
    getAnalyticsMetric("utilization"),
    getAnalyticsMetric("revenue"),
  ]);

  const garmentsInMotion = Object.entries(counts)
    .filter(([stage]) => stage !== "available" && stage !== "ready")
    .reduce((sum, [, count]) => sum + count, 0);
  const needsInspection = inspectionQueue.total;
  const overdue = notifications.items.filter((n) => n.severity === "danger").length;
  const pickupsToday = deliveryJobs.length;

  const attention: ManifestItem[] = notifications.items
    .filter((n) => n.severity === "danger" || n.severity === "warning")
    .map((n) => ({
      id: n.id,
      severity: n.severity,
      title: n.title,
      detail: n.detail,
      meta: new Date(n.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      href: "/notifications",
    }));

  return (
    <div>
      <GlanceStrip
        items={[
          { label: "Garments in motion", value: String(garmentsInMotion) },
          { label: "Pickups & drop-offs today", value: String(pickupsToday) },
          { label: "Need inspection", value: String(needsInspection), tone: needsInspection > 0 ? "warning" : "default" },
          { label: "Overdue returns", value: String(overdue), tone: overdue > 0 ? "danger" : "success" },
        ]}
      />

      <div className="border-b border-brand-navy/10">
        <p className="px-4 pt-6 font-ui text-xs font-semibold uppercase tracking-wide text-brand-navy/45 md:px-10">
          The Line — live garment lifecycle
        </p>
        <LifecycleLine counts={counts} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12">
        <section className="border-b border-brand-navy/10 lg:col-span-5 lg:border-b-0 lg:border-r">
          <h2 className="px-4 pt-6 font-ui text-xs font-semibold uppercase tracking-wide text-brand-navy/45 md:px-10">
            Needs attention
          </h2>
          <div className="mt-3">
            <ManifestList items={attention} emptyLabel="Nothing needs attention right now." />
          </div>
        </section>

        <section className="border-b border-brand-navy/10 lg:col-span-4 lg:border-b-0 lg:border-r">
          <h2 className="px-4 pt-6 font-ui text-xs font-semibold uppercase tracking-wide text-brand-navy/45 md:px-10">
            Next departures
          </h2>
          <div className="mt-3">
            <DeparturesRail jobs={deliveryJobs.slice(0, 4)} />
          </div>
        </section>

        <section className="lg:col-span-3">
          <h2 className="px-4 pt-6 font-ui text-xs font-semibold uppercase tracking-wide text-brand-navy/45 md:px-10">
            Pulse
          </h2>
          <div className="divide-y divide-brand-navy/8">
            <PulsePanel series={utilization} />
            <PulsePanel series={revenue} />
          </div>
        </section>
      </div>
    </div>
  );
}
