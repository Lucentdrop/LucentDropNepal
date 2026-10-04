# GitHub Pages deployment

The workflow `.github/workflows/github-pages.yml` publishes the static export on pushes to `main`, or through its manual Actions trigger.

Expected website URL: https://lucentdrop.github.io/LucentDropNepal/

In repository Settings → Pages, use GitHub Actions as the publishing source. The repository must be public on GitHub Free, or the account must have a plan supporting Pages for private repositories. Do not change repository visibility without the owner's approval.

The workflow sets `NEXT_PUBLIC_BASE_PATH=/LucentDropNepal`, builds directory-style routes, and prefixes public images, data downloads and browser redirects. Next links handle the base path automatically. Local development retains root URLs when the variable is unset.

This deployment uses demo mode. Real authentication, messages and contact submissions require the configured Supabase backend; Pages hosts static files only. No private API or service-role keys belong in the workflow or frontend. Configure Supabase redirect allowlists for the deployed callback URL before enabling real auth.

To build locally with the Pages layout in PowerShell:

```powershell
$env:NEXT_PUBLIC_BASE_PATH = '/LucentDropNepal'
$env:NEXT_PUBLIC_SITE_URL = 'https://lucentdrop.github.io/LucentDropNepal'
pnpm build:static
```
