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

### Selected enquiry provider: EmailJS with Gmail

The owner chose EmailJS and confirmed `ry753014@gmail.com` as the notification recipient. This does not change the public business contact address, `amrahspr@gmail.com`.

1. Create a free EmailJS account and connect a Gmail email service. Record its Service ID.
2. Create an enquiry-notification template. Set **To Email** to the fixed address `ry753014@gmail.com`. Do not use a visitor-controlled `to_email` variable. Set **Reply To** to `{{reply_to}}` and subject to `Lucent enquiry: {{enquiry_type}}`.
3. Template body variables: `{{from_name}}`, `{{company}}`, `{{reply_to}}`, `{{phone}}`, `{{enquiry_type}}`, `{{location}}`, `{{message}}`, `{{request_reference}}`. Insert message values through ordinary escaped variables; do not enable unescaped visitor HTML.
4. Add GitHub Actions secrets `NEXT_PUBLIC_EMAILJS_SERVICE_ID`, `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID` and `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY`. These IDs and the public key are frontend settings, not Gmail credentials. Never provide a Gmail password or EmailJS private key to the frontend.
5. Rebuild the site after Supabase storage and the Edge Function are activated. The browser sends EmailJS notifications only after successful storage with a returned enquiry reference. Demo submissions send nothing. A mail failure leaves the enquiry saved.

Review EmailJS delivery history separately. Supabase's `notification_status` tracks the optional server-side Resend path only; browser EmailJS outcomes are not treated as trusted database delivery assertions. Leave `RESEND_API_KEY`, `CONTACT_NOTIFY_FROM` and `CONTACT_NOTIFY_TO` unset when using EmailJS, to avoid duplicate notifications.

### Authentication email with no domain

EmailJS does not act as Supabase SMTP. Configure an SMTP sender separately for signup confirmations and password resets. One low-volume option is Gmail SMTP if the chosen Google account supports two-step verification and app passwords: host `smtp.gmail.com`, port `465`, username the full Gmail address, password a dedicated Google app password, sender address that same Gmail address. Enter the app password directly in Supabase Auth's SMTP settings; never commit it or send it in chat. Account restrictions and provider quotas apply. Use a dedicated Lucent sender account and verify delivery before enabling public signups.

- EmailJS can connect an existing Gmail account for low-volume enquiry notifications. Its free plan currently allows 200 requests/month. Configure a fixed notification recipient in the template rather than letting visitors choose the destination. EmailJS is not a substitute for Supabase's authentication SMTP configuration.
- A provider such as Resend can serve server-side notifications and authentication SMTP after verifying a sender domain. Its free daily cap is currently 100 emails; authentication and notification usage share the applicable provider limits.

No paid subscription or domain purchase is necessary to prepare the integration. The owner chooses the provider and supplies account settings before activation.

## Activation verification

Use a controlled test account to verify signup email, confirmation, login, refresh, logout and password reset. Verify that two real members cannot read each other's saved products, requests or conversations. Submit a clearly labelled test enquiry only after the recipient and email provider are confirmed, and check both storage and notification independently.
