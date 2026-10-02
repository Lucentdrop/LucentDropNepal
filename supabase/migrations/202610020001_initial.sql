-- Lucent Drop Nepal prototype. Apply once to a fresh Supabase project.
create extension if not exists pgcrypto with schema extensions;
create table public.roles (name text primary key check (name in ('guest','member','vendor','admin')));
insert into public.roles values ('guest'),('member'),('vendor'),('admin');
create table public.companies (id uuid primary key default gen_random_uuid(),name text not null check(length(name) between 2 and 120),business_type text,city text,province text,created_at timestamptz not null default now());
create table public.profiles (id uuid primary key references auth.users(id) on delete cascade,email text not null,full_name text not null,company_id uuid references public.companies(id),role text not null default 'member' references public.roles(name),phone text,created_at timestamptz not null default now());
create table public.saved_products (id uuid primary key default gen_random_uuid(),user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,external_product_id text not null check(length(external_product_id) between 1 and 120),created_at timestamptz not null default now(),unique(user_id,external_product_id));
create table public.quotation_requests (id uuid primary key default gen_random_uuid(),user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,external_product_id text not null check(length(external_product_id) between 1 and 120),company_id uuid references public.companies(id),status text not null default 'pending' check(status in ('pending','in_review','quoted','closed')),message text not null check(length(message) between 10 and 3000),created_at timestamptz not null default now());
create table public.quotation_messages (id uuid primary key default gen_random_uuid(),quotation_request_id uuid not null references public.quotation_requests(id) on delete cascade,sender_id uuid not null default auth.uid() references public.profiles(id),body text not null check(length(body) between 2 and 3000),created_at timestamptz not null default now());
create table public.contact_requests (id uuid primary key default gen_random_uuid(),name text not null,company text,email text not null,phone text,type text not null,location text,message text not null check(length(message) between 10 and 3000),status text not null default 'new' check(status in ('new','in_review','closed')),created_at timestamptz not null default now());
create table public.documents (id uuid primary key default gen_random_uuid(),external_product_id text not null,name text not null,storage_path text not null unique,access_level text not null default 'member' check(access_level in ('public','member','admin')),created_at timestamptz not null default now());
create table public.news_categories (id uuid primary key default gen_random_uuid(),name text not null unique,slug text not null unique);
create table public.news_articles (id uuid primary key default gen_random_uuid(),title text not null,slug text not null unique,excerpt text not null,content text not null,category_id uuid references public.news_categories(id),published_at timestamptz,featured_image text,published boolean not null default false);
create table public.notifications (id uuid primary key default gen_random_uuid(),user_id uuid not null references public.profiles(id) on delete cascade,title text not null,body text not null,read_at timestamptz,created_at timestamptz not null default now());
create table public.contact_rate_limits (key text primary key,window_start timestamptz not null default now(),requests integer not null default 1);
create index saved_products_user_idx on public.saved_products(user_id);
create index quotations_user_idx on public.quotation_requests(user_id,created_at desc);
create index quotation_messages_request_idx on public.quotation_messages(quotation_request_id,created_at);
create index notifications_user_idx on public.notifications(user_id);
create index news_published_idx on public.news_articles(published,published_at);
create index profiles_company_idx on public.profiles(company_id);

create function public.is_admin() returns boolean language sql stable security definer set search_path='' as $$ select exists(select 1 from public.profiles where id=(select auth.uid()) and role='admin'); $$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;
create function public.my_company_id() returns uuid language sql stable security definer set search_path='' as $$ select company_id from public.profiles where id=(select auth.uid()); $$;
revoke all on function public.my_company_id() from public;
grant execute on function public.my_company_id() to authenticated;
create function public.handle_new_user() returns trigger language plpgsql security definer set search_path='' as $$
declare new_company uuid;
begin
 if length(coalesce(new.raw_user_meta_data->>'company',''))>=2 then
  insert into public.companies(name,business_type,city) values(left(new.raw_user_meta_data->>'company',120),left(new.raw_user_meta_data->>'business_type',120),left(new.raw_user_meta_data->>'location',120)) returning id into new_company;
 end if;
 insert into public.profiles(id,email,full_name,company_id,phone,role) values(new.id,coalesce(new.email,''),left(coalesce(new.raw_user_meta_data->>'full_name','Member'),120),new_company,left(new.raw_user_meta_data->>'phone',30),'member');
 return new;
end; $$;
revoke all on function public.handle_new_user() from public;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

-- RLS is enabled on every table, including backend-only rate limits.
alter table public.roles enable row level security;
alter table public.companies enable row level security;
alter table public.profiles enable row level security;
alter table public.saved_products enable row level security;
alter table public.quotation_requests enable row level security;
alter table public.quotation_messages enable row level security;
alter table public.contact_requests enable row level security;
alter table public.documents enable row level security;
alter table public.news_categories enable row level security;
alter table public.news_articles enable row level security;
alter table public.notifications enable row level security;
alter table public.contact_rate_limits enable row level security;

-- Remove default broad grants; restore only needed operations and columns.
revoke all on public.roles,public.companies,public.profiles,public.saved_products,public.quotation_requests,public.quotation_messages,public.contact_requests,public.documents,public.news_categories,public.news_articles,public.notifications,public.contact_rate_limits from anon,authenticated;
grant select on public.news_articles,public.news_categories to anon,authenticated;
grant select on public.roles,public.companies,public.profiles,public.saved_products,public.quotation_requests,public.quotation_messages,public.contact_requests,public.documents,public.notifications to authenticated;
grant insert(user_id,external_product_id) on public.saved_products to authenticated;
grant delete on public.saved_products to authenticated;
grant insert(user_id,external_product_id,company_id,message) on public.quotation_requests to authenticated;
grant insert(quotation_request_id,sender_id,body) on public.quotation_messages to authenticated;
grant update(full_name,phone) on public.profiles to authenticated;
grant update(read_at) on public.notifications to authenticated;
-- No member can change role/company membership, quotation status or document access.
create policy roles_read on public.roles for select to authenticated using(true);
create policy profiles_read on public.profiles for select to authenticated using(id=(select auth.uid()) or (select public.is_admin()));
create policy profiles_update_self on public.profiles for update to authenticated using(id=(select auth.uid())) with check(id=(select auth.uid()));
create policy companies_read on public.companies for select to authenticated using(id=(select public.my_company_id()) or (select public.is_admin()));
create policy saved_read on public.saved_products for select to authenticated using(user_id=(select auth.uid()) or (select public.is_admin()));
create policy saved_insert on public.saved_products for insert to authenticated with check(user_id=(select auth.uid()));
create policy saved_delete on public.saved_products for delete to authenticated using(user_id=(select auth.uid()));
create policy quotations_read on public.quotation_requests for select to authenticated using(user_id=(select auth.uid()) or (select public.is_admin()));
create policy quotations_insert on public.quotation_requests for insert to authenticated with check(user_id=(select auth.uid()) and status='pending' and (company_id is null or company_id=(select public.my_company_id())));
create policy messages_read on public.quotation_messages for select to authenticated using(exists(select 1 from public.quotation_requests q where q.id=quotation_request_id and (q.user_id=(select auth.uid()) or (select public.is_admin()))));
create policy messages_insert on public.quotation_messages for insert to authenticated with check(sender_id=(select auth.uid()) and exists(select 1 from public.quotation_requests q where q.id=quotation_request_id and (q.user_id=(select auth.uid()) or (select public.is_admin()))));
create policy contacts_admin_read on public.contact_requests for select to authenticated using((select public.is_admin()));
create policy documents_read on public.documents for select to authenticated using(access_level in ('public','member') or (select public.is_admin()));
create policy categories_read on public.news_categories for select to anon,authenticated using(true);
create policy published_news_read on public.news_articles for select to anon,authenticated using(published and published_at<=now());
create policy notifications_read on public.notifications for select to authenticated using(user_id=(select auth.uid()) or (select public.is_admin()));
create policy notifications_update on public.notifications for update to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));

-- Atomic rate limiting for the public Edge Function. Only the service role can call it.
create function public.submit_contact(p_key text,p_payload jsonb) returns void language plpgsql security definer set search_path='' as $$
declare hits integer;
begin
 insert into public.contact_rate_limits(key) values(p_key) on conflict(key) do update set
 requests=case when contact_rate_limits.window_start < now()-interval '15 minutes' then 1 else contact_rate_limits.requests+1 end,
 window_start=case when contact_rate_limits.window_start < now()-interval '15 minutes' then now() else contact_rate_limits.window_start end returning requests into hits;
 if hits>5 then raise exception 'Rate limit exceeded' using errcode='P0001'; end if;
 insert into public.contact_requests(name,company,email,phone,type,location,message) values(p_payload->>'name',p_payload->>'company',p_payload->>'email',p_payload->>'phone',p_payload->>'type',p_payload->>'location',p_payload->>'message');
 delete from public.contact_rate_limits where window_start < now()-interval '1 day';
end; $$;
revoke all on function public.submit_contact(text,jsonb) from public,anon,authenticated;
grant execute on function public.submit_contact(text,jsonb) to service_role;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
 ('product-documents','product-documents',false,5242880,array['application/pdf','text/plain']),
 ('news-images','news-images',true,2097152,array['image/jpeg','image/png','image/webp']),
 ('company-assets','company-assets',true,2097152,array['image/jpeg','image/png','image/webp']) on conflict(id) do nothing;
-- Storage access must match document metadata; admin-only files stay admin-only.
create policy technical_documents_read on storage.objects for select to authenticated using(bucket_id='product-documents' and exists(select 1 from public.documents d where d.storage_path=storage.objects.name and (d.access_level in ('public','member') or (select public.is_admin()))));
create policy public_site_images_read on storage.objects for select to anon,authenticated using(bucket_id in ('news-images','company-assets'));
create policy admin_assets_insert on storage.objects for insert to authenticated with check(bucket_id in ('product-documents','news-images','company-assets') and (select public.is_admin()));
create policy admin_assets_update on storage.objects for update to authenticated using(bucket_id in ('product-documents','news-images','company-assets') and (select public.is_admin())) with check(bucket_id in ('product-documents','news-images','company-assets') and (select public.is_admin()));
create policy admin_assets_delete on storage.objects for delete to authenticated using(bucket_id in ('product-documents','news-images','company-assets') and (select public.is_admin()));
-- Content/status administration is backend-only for now; use trusted SQL or service role.
