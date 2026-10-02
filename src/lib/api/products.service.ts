import { products } from "@/data/products";
import { callExternal } from "./external-api.client";
import { productSchema, detailSchema } from "./mappers";
import type { Product, ProductDetail, Member } from "@/types";
export async function listProducts(): Promise<Product[]> {
  if (process.env.NEXT_PUBLIC_API_PROVIDER === "external")
    return productSchema.array().parse(await callExternal("products"));
  return products;
}
export async function loadProductDetail(
  id: string,
  member: Member,
): Promise<ProductDetail> {
  if (!member) throw new Error("Sign in to view technical information.");
  if (process.env.NEXT_PUBLIC_API_PROVIDER === "external")
    return detailSchema.parse(await callExternal("product-detail", id));
  const { getDemoDetail } = await import("@/data/product-details");
  return getDemoDetail(id);
}
