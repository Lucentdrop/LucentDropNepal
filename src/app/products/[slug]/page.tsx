import { notFound } from "next/navigation";
import { products } from "@/data/products";
import { ProductDetail } from "@/components/products/product-detail";
export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = products.find((p) => p.slug === slug);
  return { title: p?.name ?? "Product", description: p?.summary };
}
export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();
  return (
    <section className="container section">
      <ProductDetail product={product} />
    </section>
  );
}
