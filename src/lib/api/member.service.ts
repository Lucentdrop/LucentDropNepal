import { getSupabase } from "@/lib/supabase/client";
import type { Member, Quotation } from "@/types";
const key = (member: Member, suffix: string) => `lucent-${member.id}-${suffix}`;
function read<T>(member: Member, suffix: string, fallback: T): T {
  try {
    return (
      JSON.parse(localStorage.getItem(key(member, suffix)) ?? "null") ??
      fallback
    );
  } catch {
    return fallback;
  }
}
export async function getSavedProducts(member: Member): Promise<string[]> {
  if (member.isDemo) return read(member, "saved", []);
  const { data, error } = await getSupabase()!
    .from("saved_products")
    .select("external_product_id")
    .eq("user_id", member.id);
  if (error) throw new Error("Unable to load saved products.");
  return data.map(
    (d: { external_product_id: string }) => d.external_product_id,
  );
}
export async function toggleSaved(member: Member, id: string, saved: boolean) {
  if (member.isDemo) {
    const current = read<string[]>(member, "saved", []);
    localStorage.setItem(
      key(member, "saved"),
      JSON.stringify(
        saved
          ? current.filter((v) => v !== id)
          : [...new Set([...current, id])],
      ),
    );
    return;
  }
  const table = getSupabase()!.from("saved_products");
  const result = saved
    ? await table
        .delete()
        .eq("user_id", member.id)
        .eq("external_product_id", id)
    : await table.insert({ user_id: member.id, external_product_id: id });
  if (result.error) throw new Error("Unable to update saved products.");
}
export async function getQuotations(member: Member): Promise<Quotation[]> {
  if (member.isDemo) return read(member, "rfqs", []);
  const { data, error } = await getSupabase()!
    .from("quotation_requests")
    .select("id,external_product_id,message,status,created_at")
    .eq("user_id", member.id)
    .order("created_at", { ascending: false });
  if (error) throw new Error("Unable to load quotations.");
  return data;
}
export async function requestQuotation(
  member: Member,
  id: string,
  message: string,
) {
  if (message.trim().length < 10 || message.length > 3000)
    throw new Error("Describe your requirements in 10–3,000 characters.");
  if (member.isDemo) {
    const current = read<Quotation[]>(member, "rfqs", []);
    localStorage.setItem(
      key(member, "rfqs"),
      JSON.stringify([
        {
          id: crypto.randomUUID(),
          external_product_id: id,
          message: message.trim(),
          status: "pending",
          created_at: new Date().toISOString(),
        },
        ...current,
      ]),
    );
    return;
  }
  const { error } = await getSupabase()!.from("quotation_requests").insert({
    user_id: member.id,
    external_product_id: id,
    message: message.trim(),
  });
  if (error)
    throw new Error(
      "Unable to submit your quotation request. Please try again.",
    );
}
export async function getDocuments(member: Member): Promise<
  {
    id: string;
    external_product_id: string;
    name: string;
    storage_path: string;
    access_level: string;
  }[]
> {
  if (member.isDemo) return [];
  const { data, error } = await getSupabase()!
    .from("documents")
    .select("id,external_product_id,name,storage_path,access_level");
  if (error) throw new Error("Unable to load documents.");
  return data;
}
export async function downloadDocument(path: string) {
  const { data, error } = await getSupabase()!
    .storage.from("product-documents")
    .createSignedUrl(path, 60);
  if (error) throw new Error("Unable to access this document.");
  window.open(data.signedUrl, "_blank", "noopener,noreferrer");
}
export async function getNotifications(member: Member): Promise<
  {
    id: string;
    title: string;
    body: string;
    read_at: string | null;
    created_at: string;
  }[]
> {
  if (member.isDemo) return [];
  const { data, error } = await getSupabase()!
    .from("notifications")
    .select("id,title,body,read_at,created_at")
    .eq("user_id", member.id)
    .order("created_at", { ascending: false });
  if (error) throw new Error("Unable to load messages.");
  return data;
}
export function clearDemoData(member: Member) {
  for (const suffix of ["saved", "rfqs"])
    localStorage.removeItem(key(member, suffix));
}
