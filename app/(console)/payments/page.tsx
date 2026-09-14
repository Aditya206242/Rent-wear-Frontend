import { GlanceStrip } from "@/components/console/GlanceStrip";
import { PulsePanel } from "@/components/console/PulsePanel";
import { PaymentsLedger } from "@/components/console/PaymentsLedger";
import { listConsolePayments, getAnalyticsMetric } from "@/lib/console/api";

export const metadata = { title: "Payments — LoopWear Console" };

export default async function PaymentsPage() {
  const [{ items: payments }, revenue] = await Promise.all([
    listConsolePayments({}),
    getAnalyticsMetric("revenue"),
  ]);

  const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
  const collected = payments.filter((p) => p.status === "paid").reduce((sum, p) => sum + p.amount, 0);
  const pending = payments.filter((p) => p.status === "pending").length;
  const failed = payments.filter((p) => p.status === "failed").length;

  return (
    <div>
      <GlanceStrip
        items={[
          { label: "Collected", value: currency.format(collected), tone: "success" },
          { label: "Pending", value: String(pending), tone: pending > 0 ? "warning" : "default" },
          { label: "Failed", value: String(failed), tone: failed > 0 ? "danger" : "success" },
        ]}
      />
      <div className="border-b border-brand-navy/10 lg:w-1/3">
        <PulsePanel series={revenue} />
      </div>
      <PaymentsLedger payments={payments} />
    </div>
  );
}
