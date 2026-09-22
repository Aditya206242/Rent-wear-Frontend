import { notFound } from "next/navigation";
import { ProductForm } from "@/components/console/ProductForm";
import { StockPanel } from "@/components/console/StockPanel";
import { DeleteProductButton } from "@/components/console/DeleteProductButton";
import { getConsoleProduct, listFacilities } from "@/lib/console/api";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getConsoleProduct(id);
  return { title: product ? `${product.name} — LoopWear Console` : "Product — LoopWear Console" };
}

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, facilities] = await Promise.all([getConsoleProduct(id), listFacilities()]);
  if (!product) notFound();

  return (
    <div>
      <div className="flex items-center justify-between gap-3 border-b border-brand-navy/10 px-4 py-5 md:px-10">
        <div>
          <h1 className="font-display text-xl font-medium text-brand-navy">{product.name}</h1>
          <p className="font-ui text-xs text-brand-navy/50">
            {product.unitCount} unit{product.unitCount === 1 ? "" : "s"} in stock
          </p>
        </div>
        <DeleteProductButton productId={product.id} productName={product.name} />
      </div>

      <div className="border-b border-brand-navy/10 px-4 py-5 md:px-10">
        <h2 className="font-ui text-xs font-semibold uppercase tracking-wide text-brand-navy/45">Add stock</h2>
        <div className="mt-3">
          <StockPanel productId={product.id} facilities={facilities} />
        </div>
      </div>

      <ProductForm product={product} />
    </div>
  );
}
