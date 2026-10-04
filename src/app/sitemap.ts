import type { MetadataRoute } from "next";
import { products } from "@/data/products";
import { updates } from "@/data/updates";
import { services } from "@/data/services";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return [
    "/",
    "/about",
    "/services",
    "/products",
    "/updates",
    "/insights",
    "/contact",
    ...products.map((p) => `/products/${p.slug}`),
    ...updates.map((a) => `/updates/${a.slug}`),
    ...services.map((s) => `/services/${s.slug}`),
  ].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
