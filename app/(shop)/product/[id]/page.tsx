import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/shop/ProductDetail";
import { getProduct } from "@/lib/shop/api";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const result = await getProduct(id);
  return { title: result ? `${result.garment.name} — LoopWear` : "LoopWear" };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const result = await getProduct(id);
  if (!result) notFound();

  return <ProductDetail garment={result.garment} similar={result.similar} />;
}
