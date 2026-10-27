export type ProductCategory =
  | "Treatment Plants"
  | "Water ATM"
  | "Filtration Systems"
  | "Storage & Accessories"
  | "Chemicals";
export interface Product {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  tag: string;
  summary: string;
  image: string;
  featured?: boolean;
}
export interface ProductDetail {
  description: string;
  features: string[];
  specifications: { label: string; value: string }[];
  applications: string[];
}
export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  content: string[];
  date: string;
  image: string;
}
export interface Member {
  id: string;
  email: string;
  fullName: string;
  company?: string;
  isDemo: boolean;
}
export interface Quotation {
  id: string;
  external_product_id: string;
  message: string;
  status: string;
  created_at: string;
}
export interface AnalyticsData {
  months: string[];
  production: number[];
  regions: string[];
  installations: number[];
  installationTypes?: { name: string; values: number[] }[];
  categories: { name: string; value: number }[];
  performance: {
    tds: number[];
    turbidity: number[];
    ph: number[];
    flow: number[];
  };
}
