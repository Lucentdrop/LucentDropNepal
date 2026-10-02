import { z } from "zod";
export const productSchema = z.object({
  id: z.string(),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string(),
  category: z.enum([
    "Treatment Plants",
    "Water ATM",
    "Filtration Systems",
    "Storage & Accessories",
    "Chemicals",
  ]),
  tag: z.string(),
  summary: z.string(),
  image: z.string().startsWith("/"),
  featured: z.boolean().optional(),
});
export const detailSchema = z.object({
  description: z.string(),
  features: z.array(z.string()),
  specifications: z.array(z.object({ label: z.string(), value: z.string() })),
  applications: z.array(z.string()),
});
export const analyticsSchema = z.object({
  months: z.array(z.string()),
  production: z.array(z.number()),
  regions: z.array(z.string()),
  installations: z.array(z.number()),
  categories: z.array(z.object({ name: z.string(), value: z.number() })),
  performance: z.object({
    tds: z.array(z.number()),
    turbidity: z.array(z.number()),
    ph: z.array(z.number()),
    flow: z.array(z.number()),
  }),
});
