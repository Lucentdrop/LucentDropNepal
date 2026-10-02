import type { Metadata } from "next";
import { PageBanner } from "@/components/common";
import { Catalogue } from "@/components/products/catalogue";
export const metadata: Metadata = {
  title: "Our Products",
  description:
    "Explore water treatment plants, water ATM machines, filtration and storage solutions.",
};
export default function ProductsPage() {
  return (
    <>
      <PageBanner
        title="Our Products"
        eyebrow="A solution for every drop"
        description="Explore water treatment and processing solutions for homes, businesses, industries and communities."
      />
      <section className="container section">
        <Catalogue />
      </section>
    </>
  );
}
