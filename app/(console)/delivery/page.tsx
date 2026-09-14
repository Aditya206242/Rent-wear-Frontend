import { GlanceStrip } from "@/components/console/GlanceStrip";
import { DeparturesRail } from "@/components/console/DeparturesRail";
import { listDeliveryJobs } from "@/lib/console/api";

export const metadata = { title: "Delivery / Pickup — LoopWear Console" };

export default async function DeliveryPage() {
  const deliveryJobs = await listDeliveryJobs();
  const delayed = deliveryJobs.filter((j) => j.status === "delayed").length;
  const completed = deliveryJobs.filter((j) => j.status === "completed").length;

  const zoneCounts = deliveryJobs.reduce<Record<string, number>>((acc, j) => {
    acc[j.zone] = (acc[j.zone] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <GlanceStrip
        items={[
          { label: "Jobs today", value: String(deliveryJobs.length) },
          { label: "Completed", value: String(completed), tone: "success" },
          { label: "Delayed", value: String(delayed), tone: delayed > 0 ? "danger" : "success" },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12">
        <section className="border-b border-brand-navy/10 lg:col-span-8 lg:border-b-0 lg:border-r">
          <h2 className="px-4 pt-6 font-ui text-xs font-semibold uppercase tracking-wide text-brand-navy/45 md:px-10">
            Today&apos;s schedule
          </h2>
          <div className="mt-3">
            <DeparturesRail jobs={deliveryJobs} />
          </div>
        </section>

        <section className="lg:col-span-4">
          <h2 className="px-4 pt-6 font-ui text-xs font-semibold uppercase tracking-wide text-brand-navy/45 md:px-10">
            Zone load
          </h2>
          <ul className="mt-3 divide-y divide-brand-navy/8">
            {Object.entries(zoneCounts).map(([zone, count]) => (
              <li key={zone} className="flex items-center justify-between px-4 py-2.5 md:px-10">
                <span className="font-ui text-sm text-brand-navy">{zone}</span>
                <span className="font-mono text-sm tabular-nums text-brand-navy/60">{count}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
