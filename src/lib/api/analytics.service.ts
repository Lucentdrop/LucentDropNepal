import { analytics } from "@/data/analytics";
import { callExternal } from "./external-api.client";
import { analyticsSchema } from "./mappers";
export async function getAnalytics() {
  if (process.env.NEXT_PUBLIC_API_PROVIDER === "external")
    return analyticsSchema.parse(await callExternal("analytics"));
  return analytics;
}
