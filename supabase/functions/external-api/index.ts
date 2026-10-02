import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@4";
import { cors, json } from "../_shared/http.ts";
const requestSchema = z.object({
  resource: z.enum(["products", "product-detail", "analytics"]),
  id: z
    .string()
    .regex(/^[a-zA-Z0-9_-]+$/)
    .max(120)
    .optional(),
});
// Adapt these explicit schemas to the external team's contract; never return unfiltered payloads.
const product = z.object({
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
const detail = z.object({
  description: z.string(),
  features: z.array(z.string()),
  specifications: z.array(z.object({ label: z.string(), value: z.string() })),
  applications: z.array(z.string()),
});
const analytics = z.object({
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
Deno.serve(async (req) => {
  const headers = cors(req);
  if (!headers) return json({ error: "Origin not allowed" }, 403);
  if (req.method === "OPTIONS") return new Response(null, { headers });
  if (req.method !== "POST")
    return json({ error: "Method not allowed" }, 405, headers);
  try {
    if (Number(req.headers.get("content-length") ?? 0) > 2048)
      return json({ error: "Request too large" }, 413, headers);
    const input = requestSchema.safeParse(await req.json());
    if (!input.success) return json({ error: "Invalid request" }, 400, headers);
    const { resource, id } = input.data;
    if (resource === "product-detail" && !id)
      return json({ error: "Product ID required" }, 400, headers);
    if (resource !== "products") {
      const token = req.headers
        .get("Authorization")
        ?.replace(/^Bearer\s+/i, "");
      if (!token)
        return json({ error: "Authentication required" }, 401, headers);
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: `Bearer ${token}` } } },
      );
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);
      if (error || !user)
        return json({ error: "Invalid session" }, 401, headers);
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (
        profileError ||
        !profile ||
        !["member", "vendor", "admin"].includes(profile.role)
      )
        return json({ error: "Member access required" }, 403, headers);
    }
    const base = Deno.env.get("EXTERNAL_API_BASE_URL");
    const secret = Deno.env.get("EXTERNAL_API_KEY");
    if (!base || !secret)
      return json({ error: "External provider not configured" }, 503, headers);
    const endpoint =
      resource === "products"
        ? "products"
        : resource === "analytics"
          ? "analytics"
          : `products/${encodeURIComponent(id!)}/details`;
    const url = new URL(endpoint, base.endsWith("/") ? base : base + "/");
    if (url.protocol !== "https:")
      return json(
        { error: "Secure upstream configuration required" },
        503,
        headers,
      );
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${secret}`,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(10000),
      redirect: "error",
    });
    if (!response.ok)
      return json({ error: "Upstream data unavailable" }, 502, headers);
    const payload = await response.json();
    const output =
      resource === "products"
        ? product.array().parse(payload)
        : resource === "analytics"
          ? analytics.parse(payload)
          : detail.parse(payload);
    return json(output, 200, headers);
  } catch {
    return json({ error: "Unable to retrieve data" }, 502, headers);
  }
});
