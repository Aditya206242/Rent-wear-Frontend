import { PulsePanel } from "@/components/console/PulsePanel";
import { getAnalyticsMetric } from "@/lib/console/api";

export const metadata = { title: "Analytics — LoopWear Console" };

export default async function AnalyticsPage() {
  const [utilization, revenue, turnaround, overdue] = await Promise.all([
    getAnalyticsMetric("utilization"),
    getAnalyticsMetric("revenue"),
    getAnalyticsMetric("turnaround"),
    getAnalyticsMetric("overdue"),
  ]);

  return (
    <div>
      <p className="border-b border-brand-navy/10 px-4 py-5 font-ui text-sm text-brand-navy/60 md:px-10">
        Twelve-week field notes across utilization, revenue, and turnaround — read alongside the narrative, not
        instead of it.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="border-b border-r-0 border-brand-navy/10 md:border-r">
          <PulsePanel series={utilization} />
        </div>
        <div className="border-b border-brand-navy/10">
          <PulsePanel series={revenue} />
        </div>
        <div className="border-b border-r-0 border-brand-navy/10 md:border-b-0 md:border-r">
          <PulsePanel series={turnaround} improvesWhenDown />
        </div>
        <div>
          <PulsePanel series={overdue} improvesWhenDown />
        </div>
      </div>
    </div>
  );
}
