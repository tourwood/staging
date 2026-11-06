# Tourwood Property Services – new website (staging)

Static site, no runtime dependencies (Node 18+ only, for the build script).

```bash
node build.mjs                 # builds to dist/
FORM_DEMO=1 BASE=/staging node build.mjs   # staging build (GitHub Pages)
cd dist && python3 -m http.server 8123     # preview
```

## Structure
- `src/data/site.mjs` – contact details, services copy, image registry (edit copy here)
- `build.mjs` – page templates (home, services + 4 sub-pages, about & quality, contact, 404)
- `src/css/style.css` – brand tokens at the top (`--maroon #862f35`, `--cream #f3eee8`, `--mint #dce8e5`)
- `src/js/main.js` – nav, email de-obfuscation, form handling
- `assets/img/` – optimised images and logos
- `public/` – copied as-is: `quote.php` (form handler), `config.sample.php`, `.htaccess`

## Staging (GitHub Pages)
Repo Settings → Pages → Source: **GitHub Actions**. Every push to `main` deploys to
`https://tourwood.github.io/staging/` (noindex). The form runs in demo mode there (nothing is sent).

## Going live on cPanel
1. `node build.mjs` (no env vars), upload the **contents** of `dist/` to `public_html/`.
2. On the server copy `config.sample.php` to `config.php` and set the Turnstile **secret** key.
3. Create a Cloudflare Turnstile widget for tourwood.com.au; build with `TURNSTILE_SITEKEY=<site key>`.
4. Confirm `noreply@tourwood.com.au` exists (or change `from`), and send a test submission.
5. Uncomment the HTTPS redirect in `.htaccess` once SSL is active.

## Spam protection
- Emails are never in the HTML; they're assembled in the browser from base64 fragments.
- Form: Cloudflare Turnstile (verified server-side), honeypot field, minimum fill time, per-IP rate limit, header-injection checks.

## Known TODOs
- Self-host fonts (currently Google Fonts: Inter only).
- Replace logo with a vector/high-res original (current one is upscaled from 397×123 px).
- Replace the three building images with real Tourwood photography if available.

## SEO / migration notes
- Old WordPress URLs kept unchanged: `/why-tourwood/`, `/emergencies/`, `/covid-deep-cleaning/`, `/quality-assurance/`, `/environment/` (see `extras` in `src/data/site.mjs`). Linked from the footer only.
- 301 redirects in `public/.htaccess` cover every URL in the old WordPress sitemap (checked 5 Nov 2026): `/home/`, `/services-client-sectors/`, `/contact-us/`, 8 `/project/*` stubs, `/project_category/*`. `/testing-2/` and `/hover-images/` return 410 Gone. After launch test with `curl -I https://www.tourwood.com.au/contact-us/`.
- Canonical host is `https://www.tourwood.com.au` (override with `SITE_URL=`). Canonical, Open Graph and LocalBusiness JSON-LD are only emitted on the live build (not on staging, which is noindex).
- Pending client confirmation: Emergencies and COVID wording (old content is partly dated), and any old URLs not yet seen.

## Form email: authenticated SMTP
`public/quote.php` sends via `public/_smtp.php` (implicit TLS, port 465, AUTH LOGIN) when `smtp_host` and `smtp_pass` are set in the server-only `config.php`
(see `config.sample.php`). The sender mailbox `noreply@tourwood.com.au` must exist in cPanel > Email Accounts (not Microsoft 365).
If SMTP is not configured it falls back to PHP `mail()`. Each submission's send result ("sent" / "FAILED: reason") is appended to the private log file.
