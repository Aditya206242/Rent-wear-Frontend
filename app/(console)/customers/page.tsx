import { GlanceStrip } from "@/components/console/GlanceStrip";
import { CustomersLedger } from "@/components/console/CustomersLedger";
import { listConsoleCustomers } from "@/lib/console/api";

export const metadata = { title: "Customers — LoopWear Console" };

export default async function CustomersPage() {
  const { items: customers, total } = await listConsoleCustomers({ pageSize: 100 });
  const signature = customers.filter((c) => c.tier === "signature").length;
  const avgOnTime = customers.length
    ? Math.round((customers.reduce((sum, c) => sum + c.onTimeRate, 0) / customers.length) * 100)
    : 0;

  return (
    <div>
      <GlanceStrip
        items={[
          { label: "Total customers", value: String(total) },
          { label: "Signature tier", value: String(signature) },
          { label: "Avg. on-time rate", value: `${avgOnTime}%`, tone: "success" },
        ]}
      />
      <CustomersLedger customers={customers} />
    </div>
  );
}
