# Activate Supabase authentication and member data

The deployed frontend supports Supabase email/password signup, confirmation, login, logout and password reset. Member profiles, saved products, quotations and messages use database RLS. Public historical charts and demo product data remain bundled until real business data is supplied.

## Account setup

1. Create a project in the Lucent Supabase account. Keep the database password private.
2. Apply `supabase/migrations/202610020001_initial.sql` in the project's SQL editor, or link the project with the Supabase CLI and run `supabase db push`. The migration creates tables, RLS and the profile creation trigger. Apply only once to a fresh project; existing databases need a migration review.
3. In Auth URL Configuration, use `https://lucentdrop.github.io/LucentDropNepal/` as Site URL and add `https://lucentdrop.github.io/LucentDropNepal/auth/callback/` and `https://lucentdrop.github.io/LucentDropNepal/auth/callback/?next=/reset-password` to redirect URLs. Add localhost callback URLs only if local testing is needed.
4. Enable email/password authentication and email confirmation. Configure custom SMTP for public signup and recovery. The default Supabase sender is restricted to authorized project-team recipients and is not a production mail service.
5. Add repository Actions secrets `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. A legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` is also supported. These frontend values are public by design. Never put a service-role/secret key in frontend settings.
6. Run the GitHub Pages deployment again. Build-time settings activate real authentication and hide the demo-login option.

## Enquiry storage

Deploy `submit-contact` as a Supabase Edge Function using `supabase functions deploy submit-contact`. The project config disables JWT verification for this public enquiry endpoint; it validates input and uses an origin allowlist and database-backed rate limiting. Set Edge Function secrets:

- `ALLOWED_ORIGINS=https://lucentdrop.github.io` — origin has no repository path.
- `CONTACT_RATE_LIMIT_SECRET` — a long randomly generated secret.

Supabase supplies the function's `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` internally. Do not put the service-role key in GitHub Pages.

Apply `supabase/migrations/202610130001_contact_notifications.sql` after the initial migration, before deploying the updated function. The prepared server-side Resend integration saves the enquiry first, then sends a notification if all settings exist. Set Edge Function secrets `RESEND_API_KEY`, `CONTACT_NOTIFY_FROM` (verified sender) and `CONTACT_NOTIFY_TO` (owner-confirmed recipient). Provider keys stay in Supabase, never in the frontend or public repository. Until configured, notifications remain pending and no email is sent.

Notification status records `pending`, `accepted` or `failed`. Accepted means the provider accepted the API request, not confirmed inbox delivery. Failed notifications do not discard enquiries or ask visitors to resubmit. Review pending/failed rows in Supabase; automatic retry and delivery webhooks are not implemented yet. EmailJS remains an alternative if the owner prefers an existing Gmail sender; that integration requires its service/template configuration.

## Email options

- EmailJS can connect an existing Gmail account for low-volume enquiry notifications. Its free plan currently allows 200 requests/month. Configure a fixed notification recipient in the template rather than letting visitors choose the destination. EmailJS is not a substitute for Supabase's authentication SMTP configuration.
- A provider such as Resend can serve server-side notifications and authentication SMTP after verifying a sender domain. Its free daily cap is currently 100 emails; authentication and notification usage share the applicable provider limits.

No paid subscription or domain purchase is necessary to prepare the integration. The owner chooses the provider and supplies account settings before activation.

## Activation verification

Use a controlled test account to verify signup email, confirmation, login, refresh, logout and password reset. Verify that two real members cannot read each other's saved products, requests or conversations. Submit a clearly labelled test enquiry only after the recipient and email provider are confirmed, and check both storage and notification independently.
