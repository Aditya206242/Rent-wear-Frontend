import { GlanceStrip } from "@/components/console/GlanceStrip";
import { OrdersLedger } from "@/components/console/OrdersLedger";
import { listConsoleOrders } from "@/lib/console/api";

export const metadata = { title: "Orders — LoopWear Console" };

export default async function OrdersPage() {
  const { items: orders, total } = await listConsoleOrders({ pageSize: 100 });
  const openOrders = orders.filter((o) => o.status !== "closed").length;
  const revenue = orders.reduce((sum, o) => sum + o.total, 0);
  const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

  return (
    <div>
      <GlanceStrip
        items={[
          { label: "Total orders", value: String(total) },
          { label: "Open orders", value: String(openOrders) },
          { label: "Order value", value: currency.format(revenue) },
        ]}
      />
      <OrdersLedger orders={orders} />
    </div>
  );
}
