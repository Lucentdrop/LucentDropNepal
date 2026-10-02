import type { Product, ProductDetail, AnalyticsData } from "@/types";
export interface DataProvider {
  listProducts: () => Promise<Product[]>;
  productDetail: (id: string) => Promise<ProductDetail>;
  analytics: () => Promise<AnalyticsData>;
}
