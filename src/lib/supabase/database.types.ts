// Prototype schema types. Regenerate with `supabase gen types typescript` after applying migrations.
type Table<Row, Insert, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};
type Timestamps = { id: string; created_at: string };
type Profile = Timestamps & {
  email: string;
  full_name: string;
  company_id: string | null;
  role: "guest" | "member" | "vendor" | "admin";
  phone: string | null;
};
type Company = Timestamps & {
  name: string;
  business_type: string | null;
  city: string | null;
  province: string | null;
};
type Saved = Timestamps & { user_id: string; external_product_id: string };
type Quote = Timestamps & {
  user_id: string;
  external_product_id: string;
  company_id: string | null;
  status: "pending" | "in_review" | "quoted" | "closed";
  message: string;
};
type Message = Timestamps & {
  quotation_request_id: string;
  sender_id: string;
  body: string;
};
type Document = Timestamps & {
  external_product_id: string;
  name: string;
  storage_path: string;
  access_level: "public" | "member" | "admin";
};
type Notification = Timestamps & {
  user_id: string;
  title: string;
  body: string;
  read_at: string | null;
};
type Contact = Timestamps & {
  name: string;
  company: string | null;
  email: string;
  phone: string;
  type: string;
  location: string | null;
  message: string;
  status: string;
};
type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category_id: string | null;
  published_at: string | null;
  featured_image: string | null;
  published: boolean;
};
export type Database = {
  public: {
    Tables: {
      profiles: Table<
        Profile,
        Pick<Profile, "id" | "email" | "full_name"> & Partial<Profile>
      >;
      companies: Table<Company, Pick<Company, "name"> & Partial<Company>>;
      roles: Table<{ name: string }, { name: string }>;
      saved_products: Table<
        Saved,
        { user_id?: string; external_product_id: string }
      >;
      quotation_requests: Table<
        Quote,
        {
          user_id?: string;
          external_product_id: string;
          message: string;
          company_id?: string | null;
        }
      >;
      quotation_messages: Table<
        Message,
        { quotation_request_id: string; sender_id?: string; body: string }
      >;
      documents: Table<Document, Omit<Document, "id" | "created_at">>;
      notifications: Table<
        Notification,
        Pick<Notification, "user_id" | "title" | "body"> & Partial<Notification>
      >;
      contact_requests: Table<
        Contact,
        Omit<Contact, "id" | "created_at" | "status">
      >;
      news_articles: Table<Article, Omit<Article, "id">>;
      news_categories: Table<
        { id: string; name: string; slug: string },
        { name: string; slug: string }
      >;
      contact_rate_limits: Table<
        { key: string; window_start: string; requests: number },
        { key: string }
      >;
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
      my_company_id: { Args: Record<string, never>; Returns: string };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
