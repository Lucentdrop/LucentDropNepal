# Prototype verification — 2 October 2026

Tested locally using Node 24.14, pnpm 10.32.1, Next.js 16.3.8 and Chromium through Playwright. No cloud account or paid service was used.

## Passing checks

- Strict TypeScript check and ESLint.
- Next.js production build and Cloudflare-ready static export (43 generated pages/artifacts).
- Eight validation/PostgreSQL tests across two test files.
- Four browser tests against the actual static export at `localhost:3001`.
- Deno type check of `external-api` and `submit-contact` with their declared dependencies.

## Browser coverage

Catalogue search, category filtering, zero results and reset; guest technical-information gate; explicit demo-member preview; specification tabs; saved product; RFQ creation and persistence after reload; four rendered ECharts canvases and metric selection; clearing demo data; contact validation and a clearly labeled non-sending demo result.

Public-route response checks cover Home, About, Services, a service detail, Products, Updates, an article, Contact, Login and Signup. Axe WCAG A/AA checks passed on Home, Products, Contact, Login and Signup. This is automated coverage, not a certification of full WCAG conformance.

Home, Products, About, Contact, Signup and the RO product page were checked for horizontal overflow at **375, 768, 1024 and 1440 px**. Mobile menu navigation passed. Desktop and mobile home screenshots were visually inspected against the supplied reference for composition, spacing, typography, card proportions and imagery.

## Database coverage

The actual migration was executed in local PostgreSQL through PGlite with small auth/storage fixtures. Verified that signup role metadata cannot grant admin access, members cannot update role fields, other users' saved items and RFQs stay hidden, cross-user quotation messages are rejected, member document and storage reads exclude admin/unregistered files, contacts are admin-readable only, anonymous direct contact inserts are denied, and backend contact rate limits reject a sixth request in the same window.

The local fixtures substitute `auth.uid()` and Storage tables; cloud Supabase infrastructure itself was not exercised. Before a real launch, repeat member/admin/anonymous checks in the intended Supabase project and test Auth confirmation/recovery email delivery, signed document downloads and both deployed Edge Functions. No real external-team API contract or credentials were supplied.

## Availability

- Development server: `http://localhost:3000`
- Static production preview: `http://localhost:3001`
- To restart static preview: `pnpm build:static`, then `node scripts/serve-static.mjs`.
- Cloud export: `out/` (generated, ignored by Git).
- Demo member access: Login → **Preview Member Experience**.

Verified company contact information, real brochures, approved product specifications and public-launch terms remain to be supplied. The prototype clearly marks demo content and makes no verified installation or performance claims.
