import { Catalogue } from "@/components/products/catalogue";
import { DashboardHeading } from "@/components/dashboard/dashboard-shell";
export default function DashboardProducts() {
  return (
    <>
      <DashboardHeading
        title="Products"
        description="Find solutions and access member product information."
      />
      <Catalogue />
    </>
  );
}
