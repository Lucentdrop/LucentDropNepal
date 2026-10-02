# Lucent Drop Nepal

A responsive, local-first prototype for a Nepal water-solutions company, based on the supplied website reference. The public site and demo member workspace run without cloud credentials. Nothing is purchased or deployed automatically.

## Start locally

Requires Node.js 20.9 or later (tested with Node 24) and pnpm 10.

```powershell
npm install --global pnpm@10.32.1
pnpm install
pnpm dev
```

Visit http://localhost:3000. For a production preview use `pnpm build` then `pnpm start`. You can also use `npx --yes pnpm@10.32.1` in place of `pnpm` if you prefer not to install it globally.

No environment file is necessary for mock mode. To configure services, copy `.env.example` to `.env.local`, fill in the public Supabase URL and anon key, then restart the dev server. Never commit `.env.local` or secrets.

## What is implemented

- Home, About, Services and individual service pages, Products, product details, Latest Updates and individual articles, Contact, Privacy & Terms.
- Catalogue search/category filters; image view controls; member gate; overview, specification, application and document tabs.
- Login, business signup, confirmation callback, password recovery and reset UI using Supabase Auth.
- Separate **Preview Member Experience** when Supabase is absent. This creates no account and does not impersonate real authentication.
- Dashboard, member catalogue, saved products, quotation requests, quotation conversations, documents, notifications, account and updates.
- Four Apache ECharts views: production trend, regional installations, category mix and treatment performance (TDS, turbidity, pH and flow), with resize handling, tooltips and loading/error/empty states. An accessible table accompanies the charts.
- React Hook Form/Zod contact and account validation. Demo contact submissions are validated only; the result clearly states they were not sent or stored.
- Supabase migration, signup trigger, RLS, column-level grants, private document storage and Edge Functions for contact submission and external data access.
- SEO metadata, sitemap, robots configuration, local Inter font, original optimized imagery, responsive navigation and keyboard support.

## Architecture

```text
Next.js App Router (TypeScript / React)
  Public server-rendered pages + client interactive components
  TanStack Query → service interfaces → mock data
                                  └→ Supabase external-api Edge Function
                                       → external team API (secret injected on server)
  Supabase Auth → PostgreSQL RLS / private Storage / contact Edge Function
```

The default deployment is a **Next.js static export on Cloudflare Pages**, with dynamic member operations performed by Supabase. This avoids requiring a server runtime or a paid Workers adapter for the prototype. SEO-friendly public pages are generated at build time. Local development still uses the standard Next.js server.

Stack: Next.js 16.3.8 (the stable npm release at implementation), React, strict TypeScript, Tailwind 4, reusable shadcn-style Button/CVA/Slot, Radix Tabs, Lucide, TanStack Query, React Hook Form, Zod, Apache ECharts, Supabase JS/SSR. All libraries are free/open source. No paid UI kits or separate backend service is introduced.

```text
src/app/                Public and member routes, metadata
src/components/         Layout, UI, forms, products, dashboard, charts
src/data/               Stable mock products/services/news/analytics
src/lib/api/            Product/analytics/member services and external adapter
src/lib/supabase/       Browser client and prototype schema types
src/lib/validation/     Shared form contracts
src/hooks/              Query/mutation hooks
supabase/migrations/    Schema, RLS, Storage policies, contact rate limits
supabase/functions/     Authenticated proxy and contact handler
tests/                  Browser, validation and PostgreSQL RLS tests
docs/                   Asset prompts and QA notes
```

## Demo behavior and content

All product data, specifications, chart values, statistics and editorial examples are marked as illustrative in source/UI. No installation history, business address, phone, certifications or testimonials are invented. The Nepal coverage map and office map are illustrative placeholders.

Use Login → **Preview Member Experience** to inspect the workspace without Supabase. The demo session is held in `sessionStorage`. Demo saved products and RFQs persist in `localStorage` on this device; clear them on the Account page. Demo requests are never sent to a business. Demo brochure download is an explicitly labeled text overview, not a fabricated PDF.

Demo technical specifications are bundled and are not confidential. The UI gate is only a preview aid. Real confidential specifications must come from the authenticated Edge Function and must never be added to `src/data/`, public files or static export payloads.

## Environment variables

| Variable                        | Where                  | Purpose                                                                               |
| ------------------------------- | ---------------------- | ------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | frontend build / local | Supabase project URL                                                                  |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | frontend build / local | Public API key; RLS enforces access                                                   |
| `API_PROVIDER`                  | frontend build / local | `mock` (default) or `external`; only this non-secret choice is exposed by Next config |
| `NEXT_PUBLIC_SITE_URL`          | frontend build / local | Canonical URL for sitemap and metadata                                                |
| `SUPABASE_SERVICE_ROLE_KEY`     | Edge Function only     | Supabase supplies this server credential; never expose to browser                     |
| `EXTERNAL_API_BASE_URL`         | Edge Function secret   | HTTPS upstream root; trailing slash accepted                                          |
| `EXTERNAL_API_KEY`              | Edge Function secret   | Injected into upstream Authorization header                                           |
| `ALLOWED_ORIGINS`               | Edge Function secret   | Comma-separated exact origins; default `http://localhost:3000`                        |
| `CONTACT_RATE_LIMIT_SECRET`     | Edge Function secret   | Random secret used to hash contact rate-limit keys                                    |

External secrets in the Next `.env.example` document future server use; the supplied proxy reads its secrets from **Supabase**, not from frontend deployment variables.

## Connect Supabase Free

1. Use an existing or new **Free** project. Do not enable paid add-ons.
2. Run `supabase/migrations/202610020001_initial.sql` in the SQL editor on a fresh project, followed by `supabase/seed.sql`. Alternatively use Supabase CLI `supabase db push` after linking the intended project. Do not apply this fresh-schema migration blindly to an existing business database.
3. Add the URL and anon key to `.env.local`. Enable email/password authentication and email confirmation.
4. Set the Auth Site URL to your frontend origin and allow `/auth/callback` as a redirect URL for localhost and the final Pages domain. Password reset uses `/auth/callback?next=/reset-password`; allow that redirect too. Preserve the callback code/hash when following confirmation links.
5. Deploy the `external-api` and `submit-contact` functions with the CLI. The included config disables gateway JWT verification because the proxy verifies member tokens itself via `getUser`; public catalogue/contact requests do not require a member JWT. Do not remove the proxy's verification logic.
6. Set the Edge Function secrets above. `submit-contact` fails closed if its hashing secret is absent. Contacts are inserted only by the backend function and limited to five per hashed source in 15 minutes. Use the platform's trusted forwarding setup; add Turnstile or stronger perimeter controls if abuse requires them later.
7. Sign up a test business account, confirm the email and log in. The signup trigger creates a member profile and a company record. Role is always initialized as `member`, regardless of supplied user metadata.
8. Upload small brochures to private `product-documents`, and create matching `documents.storage_path` records using trusted SQL/service-role tooling. Member downloads use 60-second signed URLs. Admin-only documents cannot be retrieved by members even if a storage path is guessed.
9. Regenerate schema types after changing the database: `supabase gen types typescript --project-id YOUR_PROJECT_ID` → `src/lib/supabase/database.types.ts`.

Tables: `profiles`, `companies`, `roles`, `saved_products`, `quotation_requests`, `quotation_messages`, `contact_requests`, `documents`, `news_articles`, `news_categories`, `notifications`, plus backend-only `contact_rate_limits`. Product data remains external/mock rather than duplicated in PostgreSQL.

Members can read/update their allowed profile fields, own saved items, own RFQs/messages and notifications. Company membership, role, quotation status and document permissions are not writable by members. Admins can inspect enquiries, RFQs and protected documents. Content/status administration uses trusted SQL/service tooling for now; a full admin CMS is outside this prototype. Admin assignment must be performed by an authorized operator using trusted backend access, never signup metadata.

Buckets: private `product-documents` (5 MB file limit), public `news-images` and `company-assets` (2 MB file limits). Never place confidential material in a public bucket. Storage policies consult matching document metadata. The local news UI uses mock editorial data; the news schema prepares later content management without adding a paid CMS.

## Replace the mock API

Set `API_PROVIDER=external` and restart/rebuild. `products.service.ts` and `analytics.service.ts` call the Supabase proxy, which validates the request, checks authentication for technical details/analytics, injects the upstream secret, applies a timeout and validates/normalizes the response. Public product summaries remain public. Client components never receive the external key. Errors are visible with retry controls; external mode does not silently substitute mock readings.

Agree the contract with the API team before enabling it. Adjust explicit schemas/mappers and the three allowlisted endpoints in `supabase/functions/external-api/index.ts`: `products`, `products/:id/details`, `analytics`. Adapt field names inside the service/mapping layer rather than the UI. Illustrative local image paths are used until approved product assets are supplied.

Static product routes currently enumerate the six stable prototype slugs. Adding product slugs or new editorial content requires regenerating build-time routes and redeploying; do not expect arbitrary new upstream slugs to appear automatically in a static export. To support runtime routes at larger scale, move to a supported Next.js Workers deployment after checking compatibility/free limits. Keep mock mode available for development. The adapter architecture is ready; no real external API was supplied or tested.

## Free deployment preparation

```powershell
pnpm build:static
```

The `out/` directory is deployable to **Cloudflare Pages**. In Pages choose the static Next.js preset, use build command `pnpm build:static`, output `out`, Node 24 and pnpm 10. Set public frontend variables and `NEXT_PUBLIC_SITE_URL` before building. Use the free `pages.dev` subdomain; a custom domain is optional and is not purchased by this project. After receiving the actual domain, rebuild canonical metadata and add the exact origin to Supabase redirect/CORS settings.

Pages serves extensionless generated HTML routes. Keep `404.html` and `_headers` in the export. Do not add a catch-all SPA redirect that hides real 404s. All dynamic data operations go directly to Supabase and use database access checks. Static member HTML contains an authentication/loading gate, not protected records.

Follow [Cloudflare's official static Next.js guide](https://developers.cloudflare.com/pages/framework-guides/nextjs/deploy-a-static-nextjs-site/). Full-stack Next.js has a different Workers deployment path; this prototype deliberately stays with a static export plus Supabase. Free-tier quotas and email delivery constraints can change: review [Supabase billing guidance](https://supabase.com/docs/guides/platform/billing-on-supabase) and Cloudflare's limits before public rollout. No unlimited-service claim is made.

Git is initialized locally on `feature/lucent-prototype`. To connect GitHub, create/select a free repository, add its remote and push this branch; choose a production branch when ready. No GitHub account, remote, Cloudflare project, Supabase project or cloud credentials were supplied, so none is created or billed. GitHub Actions is unnecessary for the initial version; Pages can build on Git pushes.

## Checks

```powershell
pnpm typecheck
pnpm lint
pnpm test
pnpm exec playwright install chromium
pnpm exec playwright test
pnpm build
pnpm build:static
```

Run browser tests against `pnpm dev`, or set `TEST_BASE_URL` to a production preview. Tests cover catalogue search/empty results, guest gating, demo session, saving, RFQ persistence, contact validation, responsive overflow at 375/768/1024/1440px, mobile menu, public routes and WCAG checks. PostgreSQL tests execute the actual migration with minimal auth/storage fixtures, exercising cross-user isolation, escalation prevention, document access and contact limits. They do not replace testing in your eventual Supabase project. Edge Functions require deployment or the Supabase/Deno runtime for a real integration test.

## Upgrade only when necessary

- Supabase Free → Pro if verified usage exceeds limits.
- Static Pages → a supported Workers runtime if runtime routes/server rendering are needed; validate current free limits before considering paid Workers.
- Mock provider → the external API when the agreed contract is ready.
- Edge Functions → a dedicated backend only if business logic warrants it.
- Add caching/Redis or monitoring only when measured needs justify the additional service.

Before launch, supply approved branding/product assets, verified company/contact details, actual technical documents, reviewed business/privacy terms and the external API contract. Confirm Auth mail delivery and run RLS/storage tests in the target Supabase project. These are connection/content tasks; the local prototype does not depend on them.
