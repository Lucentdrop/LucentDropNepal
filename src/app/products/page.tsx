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
        eyebrow="Our technology"
        description="The Right Technology for Every Drop."
      />
      <section className="container section">
        <Catalogue />
      </section>
    </>
  );
}
