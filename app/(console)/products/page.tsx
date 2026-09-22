import Link from "next/link";
import { Plus } from "lucide-react";
import { GlanceStrip } from "@/components/console/GlanceStrip";
import { ProductsTable } from "@/components/console/ProductsTable";
import { listConsoleProducts } from "@/lib/console/api";

export const metadata = { title: "Products — LoopWear Console" };

export default async function ProductsPage() {
  const { items: products, total } = await listConsoleProducts({ pageSize: 100 });
  const live = products.filter((p) => p.isActive).length;
  const outOfStock = products.filter((p) => p.unitCount === 0).length;

  return (
    <div>
      <GlanceStrip
        items={[
          { label: "Total products", value: String(total) },
          { label: "Live", value: String(live), tone: "success" },
          { label: "No stock", value: String(outOfStock), tone: outOfStock > 0 ? "warning" : "default" },
        ]}
      />

      <div className="flex justify-end px-4 py-4 md:px-10">
        <Link
          href="/products/new"
          className="inline-flex items-center gap-1.5 border border-brand-navy bg-brand-navy px-4 py-2 font-ui text-sm font-semibold text-white transition-colors hover:bg-brand-navy-dark"
        >
          <Plus size={15} strokeWidth={2} />
          New product
        </Link>
      </div>

      <ProductsTable products={products} />
    </div>
  );
}
