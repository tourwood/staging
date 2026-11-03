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
