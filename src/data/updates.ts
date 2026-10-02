import type { NewsArticle } from "@/types";
// Demo stories, not factual announcements or claims of completed installations.
export const updates: NewsArticle[] = [
  {
    id: "news-001",
    slug: "kathmandu-treatment-project",
    title: "A closer look at water treatment in Kathmandu",
    category: "Project Updates",
    excerpt:
      "Explore the stages of a modern treatment project, from source-water analysis to commissioning.",
    content: [
      "Every dependable water project starts with understanding the source. In this illustrative project, a site assessment brings together water analysis, expected demand and the practical requirements of the facility.",
      "A typical treatment train combines pre-filtration, membrane treatment and safe storage. The final design always depends on verified water quality and the intended application.",
      "Commissioning includes testing, operator orientation and a clear maintenance plan. This article is a prototype example, rather than an announcement of an actual Lucent Drop installation.",
    ],
    date: "2026-09-20",
    image: "/images/hero.webp",
  },
  {
    id: "news-002",
    slug: "future-of-water-treatment",
    title: "The future of water treatment in Nepal",
    category: "Technology",
    excerpt:
      "How monitoring and adaptable treatment systems can make every drop count.",
    content: [
      "Water systems can become more useful when operators have timely, understandable information. Flow rate, TDS and turbidity trends help teams identify changes and plan maintenance.",
      "Our prototype analytics demonstrate how these measurements could be presented. They use illustrative data and are not suitable for operational or water safety decisions.",
    ],
    date: "2026-09-12",
    image: "/images/river.webp",
  },
  {
    id: "news-003",
    slug: "community-water-access",
    title: "Bringing clean water closer to communities",
    category: "Sustainability",
    excerpt:
      "A practical look at community water dispensing and responsible resource use.",
    content: [
      "Community water dispensing can make access more convenient when it is supported by suitable treatment, consistent maintenance and local oversight.",
      "Water ATM systems should be selected around the needs of the community. This example explores the idea using demo content; no specific deployment is claimed.",
    ],
    date: "2026-08-28",
    image: "/products/atm.webp",
  },
  {
    id: "news-004",
    slug: "one-stop-water-solutions",
    title: "Building a one-stop approach to water",
    category: "Company News",
    excerpt:
      "Connecting consultation, treatment, installation and ongoing care.",
    content: [
      "A one-stop water solution connects the stages that are often considered separately: assessment, product selection, installation and ongoing care.",
      "This prototype shows how customers and partners could browse solutions, request quotations and find supporting documents in one place.",
    ],
    date: "2026-08-16",
    image: "/products/ro.webp",
  },
];
export const newsCategories = [
  "All",
  "Project Updates",
  "Technology",
  "Sustainability",
  "Company News",
];
