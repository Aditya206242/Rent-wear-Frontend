import { ProductForm } from "@/components/console/ProductForm";

export const metadata = { title: "New product — LoopWear Console" };

export default function NewProductPage() {
  return (
    <div>
      <div className="border-b border-brand-navy/10 px-4 py-5 md:px-10">
        <h1 className="font-display text-xl font-medium text-brand-navy">New product</h1>
      </div>
      <ProductForm />
    </div>
  );
}
