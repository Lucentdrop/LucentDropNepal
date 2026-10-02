import type { ProductDetail } from "@/types";
// DEMO ONLY. Real specifications are retrieved by an authenticated Edge Function.
export const demoDetails: Record<string, ProductDetail> = {
  "ro-001": {
    description:
      "An adaptable reverse osmosis system designed for industrial and commercial water processing. The modular configuration brings filtration, membrane treatment and automated monitoring together in one practical solution.",
    features: [
      "High purification efficiency",
      "Capacity tailored to your requirements",
      "Designed for efficient operation",
      "Automatic monitoring and control",
      "Industrial, commercial and institutional applications",
    ],
    specifications: [
      { label: "Illustrative capacity", value: "500–10,000 L/hour" },
      { label: "Treatment process", value: "Pre-filtration + reverse osmosis" },
      {
        label: "Membrane arrangement",
        value: "Modular, application dependent",
      },
      { label: "Control system", value: "Automatic PLC control" },
      { label: "Power supply", value: "Site dependent; confirm at quotation" },
      { label: "Construction", value: "Stainless steel skid" },
    ],
    applications: [
      "Manufacturing and processing",
      "Hotels and hospitality",
      "Schools and institutions",
      "Commercial drinking water",
    ],
  },
};
export function getDemoDetail(id: string): ProductDetail {
  return (
    demoDetails[id] ?? {
      description:
        "A configurable water solution designed to support dependable operation and practical maintenance. Final selection depends on source-water quality, demand and site conditions.",
      features: [
        "Configurable to your site",
        "Simple operation and maintenance",
        "Designed for reliable performance",
      ],
      specifications: [
        { label: "Configuration", value: "Application dependent" },
        { label: "Capacity", value: "Confirm during consultation" },
        { label: "Installation", value: "Site assessment required" },
      ],
      applications: [
        "Commercial facilities",
        "Community water systems",
        "Institutional applications",
      ],
    }
  );
}
