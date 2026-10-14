import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@4";
import { cors, json } from "../_shared/http.ts";
import { notifyEnquiry } from "../_shared/contact-email.ts";
const inputSchema = z.object({
  name: z.string().trim().min(2).max(120),
  company: z.string().max(120),
  email: z.email().max(254),
  phone: z.string().min(7).max(30),
  type: z.enum([
    "General enquiry",
    "Product enquiry",
    "Service & maintenance",
    "Partnership",
  ]),
  location: z.string().trim().min(2).max(120),
  message: z.string().trim().min(10).max(3000),
});
Deno.serve(async (req) => {
  const headers = cors(req);
  if (!headers) return json({ error: "Origin not allowed" }, 403);
  if (req.method === "OPTIONS") return new Response(null, { headers });
  if (req.method !== "POST")
    return json({ error: "Method not allowed" }, 405, headers);
  try {
    const body = await req.text();
    if (body.length > 8000)
      return json({ error: "Request too large" }, 413, headers);
    const parsed = inputSchema.safeParse(JSON.parse(body));
    if (!parsed.success)
      return json({ error: "Invalid enquiry" }, 400, headers);
    const secret = Deno.env.get("CONTACT_RATE_LIMIT_SECRET");
    if (!secret)
      return json({ error: "Contact service not configured" }, 503, headers);
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const digest = await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(ip),
    );
    const hashed = Array.from(new Uint8Array(digest))
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("");
    const client = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const requestId = crypto.randomUUID();
    const { error } = await client.rpc("submit_contact", {
      p_key: hashed,
      p_payload: { ...parsed.data, request_id: requestId },
    });
    if (error)
      return json(
        {
          error:
            error.code === "P0001"
              ? "Too many enquiries. Please try again later."
              : "Unable to save enquiry",
        },
        error.code === "P0001" ? 429 : 500,
        headers,
      );
    const notification = await notifyEnquiry(requestId, parsed.data, {
      apiKey: Deno.env.get("RESEND_API_KEY"),
      from: Deno.env.get("CONTACT_NOTIFY_FROM"),
      to: Deno.env.get("CONTACT_NOTIFY_TO"),
    });
    if (notification !== "pending") {
      const { error: notificationError } = await client
        .from("contact_requests")
        .update({
          notification_status: notification,
          notification_attempted_at: new Date().toISOString(),
        })
        .eq("id", requestId);
      if (notificationError)
        console.error(
          "Unable to update enquiry notification status",
          requestId,
        );
    }
    // The enquiry is received even if the provider is down. Do not ask the
    // visitor to submit duplicates or claim confirmed inbox delivery.
    return json({ ok: true, reference: requestId }, 201, headers);
  } catch {
    return json({ error: "Unable to process enquiry" }, 400, headers);
  }
});
