import { PageBanner } from "@/components/common";
import { InsightsExplorer } from "@/components/insights/explorer";
import { AnimatedLabel } from "@/components/animated-label";

export const metadata = {
  title: "Water Insights & Business Analytics",
  description:
    "Explore official Nepal drinking-water data across regions, provinces and districts, plus transparent demand scenarios and Lucent business demo analytics.",
};

export default function InsightsPage() {
  return (
    <>
      <PageBanner
        eyebrow={<AnimatedLabel kind="journal" />}
        title="Water Insights"
        description="Discover. Understand. Transform."
      />
      <InsightsExplorer />
    </>
  );
}
