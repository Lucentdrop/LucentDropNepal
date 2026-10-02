import { getSupabase } from "@/lib/supabase/client";
// Only calls our authenticated proxy. The external API secret stays in Edge Functions.
export async function callExternal(
  resource: string,
  id?: string,
): Promise<unknown> {
  const client = getSupabase();
  if (!client)
    throw new Error("Connect Supabase before enabling the external provider.");
  const { data, error } = await client.functions.invoke("external-api", {
    body: { resource, id },
  });
  if (error)
    throw new Error("The data service is unavailable. Please try again.");
  return data;
}
