import { PageBanner } from "@/components/common";
import { InsightsExplorer } from "@/components/insights/explorer";

export const metadata = {
  title: "Water Insights & Business Analytics",
  description:
    "Explore official Nepal drinking-water data across regions, provinces and districts, plus transparent demand scenarios and Lucent business demo analytics.",
};

export default function InsightsPage() {
  return (
    <>
      <PageBanner
        eyebrow="Data for better water decisions"
        title="Water Insights"
        description="Nepal’s water evidence. Transparent planning. A glimpse into a growing water business."
      />
      <InsightsExplorer />
    </>
  );
}
