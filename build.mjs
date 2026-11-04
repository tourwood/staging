// Tiny dependency-free static site builder.  Run:  node build.mjs
// Env:  BASE=/staging   (sub-path, e.g. GitHub Pages project site; default '')
//       FORM_DEMO=1     (form simulates success instead of posting to quote.php)
//       TURNSTILE_SITEKEY=...  (Cloudflare Turnstile site key; defaults to Cloudflare's always-pass test key)
import { mkdirSync, rmSync, cpSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { site, images, services, marquee } from './src/data/site.mjs';

const BASE = (process.env.BASE || '').replace(/\/$/, '');
const DEMO = process.env.FORM_DEMO === '1';
const SITEKEY = process.env.TURNSTILE_SITEKEY || '1x00000000000000000000AA'; // Cloudflare test key
const OUT = 'dist';

const u = (p) => `${BASE}${p}`;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const b64 = (s) => Buffer.from(s, 'utf8').toString('base64');

// ---------- helpers ----------
function pic(key, { sizes = '100vw', cls = '', eager = false, alt, style } = {}) {
  const im = images[key];
  const srcset = im.widths.map((w) => `${u(`/assets/img/${key}-${w}.webp`)} ${w}w`).join(', ');
  const big = im.widths[im.widths.length - 1];
  return `<img class="${cls}" src="${u(`/assets/img/${key}-${big}.webp`)}" srcset="${srcset}" sizes="${sizes}" width="${im.w}" height="${im.h}" alt="${esc(alt ?? im.alt)}"${style ? ` style="object-position:${style}"` : ''} ${eager ? 'fetchpriority="high"' : 'loading="lazy" decoding="async"'}>`;
}

// Email is emitted only as base64 fragments; JS assembles it in the visitor's browser.
function email(label = '') {
  const l = label ? esc(label) : 'Email us';
  return `<a class="em" href="${u('/contact/')}" data-u="${b64(site.emailUser)}" data-d="${b64(site.emailDomain)}" data-show="${label ? '0' : '1'}">${l}</a><noscript> (enable JavaScript to see our email address, or use the contact form)</noscript>`;
}

const cta = (text = 'Get a Quote', href = '/#quote', cls = '') =>
  `<a class="btn ${cls}" href="${u(href)}">${text}<svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></a>`;

function quoteForm(id = 'quote-form') {
  return `
<form class="qform" id="${id}" method="post" action="${u('/quote.php')}" data-demo="${DEMO ? '1' : '0'}" novalidate>
  <div class="qform__row">
    <label>Your name<input name="name" autocomplete="name" required maxlength="100"></label>
    <label>Email<input name="email" type="email" autocomplete="email" required maxlength="150"></label>
  </div>
  <div class="qform__row">
    <label><span>Phone <span class="opt">(optional)</span></span><input name="phone" type="tel" autocomplete="tel" maxlength="30"></label>
    <label>Property type
      <select name="property" required>
        <option value="">Choose one…</option>
        <option>Commercial / Industrial</option>
        <option>High rise residential</option>
        <option>Body corporate</option>
        <option>Other</option>
      </select>
    </label>
  </div>
  <label><span>What do you need? <span class="opt">(optional)</span></span><textarea name="message" rows="3" maxlength="2000"></textarea></label>
  <div class="hp" aria-hidden="true"><label>Leave this empty<input name="company_website" tabindex="-1" autocomplete="off"></label></div>
  <input type="hidden" name="t" value="">
  <div class="cf-turnstile" data-sitekey="${SITEKEY}" data-theme="light"></div>
  <button class="btn btn--solid" type="submit">Send my request</button>
  <p class="qform__status" role="status" aria-live="polite"></p>
</form>`;
}

// ---------- layout ----------
function layout({ title, desc, path, body, home = false }) {
  const nav = [
    ['/services/', 'Services'],
    ['/about-quality/', 'About & Quality'],
    ['/contact/', 'Contact'],
  ];
  const full = `${title}${home ? '' : ' | ' + site.name}`;
  return `<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(full)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="#862f35">
<meta name="robots" content="${BASE ? 'noindex, nofollow' : 'index, follow'}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${u('/assets/style.css')}">
<script defer src="${u('/assets/main.js')}"></script>
<script defer src="https://challenges.cloudflare.com/turnstile/v0/api.js"></script>
</head>
<body class="${home ? 'is-home' : ''}">
<div class="progress" aria-hidden="true"></div>
<a class="skip" href="#main">Skip to content</a>
<header class="hdr">
  <a class="hdr__logo" href="${u('/')}" aria-label="${esc(site.name)} home"><img src="${u('/assets/img/logo.png')}" width="1191" height="369" alt="${esc(site.name)}"></a>
  <button class="hdr__toggle" aria-expanded="false" aria-controls="nav" aria-label="Menu"><span></span><span></span></button>
  <nav class="hdr__nav" id="nav" aria-label="Main">
    ${nav.map(([h, t]) => `<a href="${u(h)}"${path === h ? ' aria-current="page"' : ''}>${t}</a>`).join('\n    ')}
    ${cta('Get a Quote', '/#quote', 'btn--sm')}
  </nav>
</header>
<main id="main">
${body}
</main>
<footer class="ftr">
  <div class="ftr__grid">
    <div>
      <img class="ftr__logo" src="${u('/assets/img/logo-white.png')}" width="1191" height="369" alt="${esc(site.name)}" loading="lazy">
      <p class="ftr__tag">${esc(site.tagline)}</p>
    </div>
    <div>
      <h2>Contact</h2>
      <p><a href="tel:${site.phoneHref}">${site.phone}</a><br>${email()}<br>${site.addressLines.join('<br>')}</p>
    </div>
    <div>
      <h2>Services</h2>
      <ul>${services.map((s) => `<li><a href="${u(`/services/${s.slug}/`)}">${esc(s.title)}</a></li>`).join('')}</ul>
    </div>
  </div>
  <p class="ftr__legal">${esc(site.legal)} · ABN ${site.abn} · Licence ${site.licence}<br>© <span class="yr">2026</span> Tourwood Property Services</p>
</footer>
</body>
</html>`;
}

// ---------- pages ----------
const pages = [];
const add = (path, o) => pages.push({ path, html: layout({ ...o, path }) });

// Home
add('/', {
  home: true,
  title: 'Tourwood Property Services | Property maintenance & cleaning across Victoria',
  desc: 'One team for property maintenance, cleaning and building services across Victoria. Commercial, industrial, high rise residential and body corporate. 30+ years of experience.',
  body: `
<section class="hero">
  <div class="hero__media" aria-hidden="true">${pic('office', { cls: 'hero__img', eager: true, sizes: '100vw', alt: '' })}</div>
  <div class="hero__shade" aria-hidden="true"></div>
  <div class="hero__content wrap">
    <p class="eyebrow">Property maintenance &amp; cleaning · Victoria</p>
    <h1>One team for everything your building needs.</h1>
    <p class="hero__sub">Cleaning, maintenance and building services for commercial, industrial, high rise and body corporate properties, backed by over 30 years of experience.</p>
    <div class="hero__cta">${cta('Get a Quote', '#quote', 'btn--solid btn--lg')}${cta('Our services', '/services/', 'btn--ghost btn--lg')}</div>
  </div>
  <a class="hero__cue" href="#statement" aria-label="Scroll down"><span></span></a>
</section>

<section class="statement wrap" id="statement">
  <p class="statement__text reveal">Your building has a lot of moving parts, and we take responsibility for all of them:</p>
  <ul class="statement__list">
    <li class="reveal">Daily running of the site</li>
    <li class="reveal">Hands-on repairs and technical work</li>
    <li class="reveal">Compliance</li>
    <li class="reveal">Larger capital projects</li>
  </ul>
  <p class="statement__text reveal">One team answers for the lot, so nothing gets lost when a job passes between different trades.</p>
</section>

<section class="stats">
  <div class="wrap stats__grid">
    <div class="stat reveal"><span class="stat__n count" aria-label="30 plus years">30+</span><span class="stat__l">years of experience</span></div>
    <div class="stat reveal"><span class="stat__n">Victoria</span><span class="stat__l">wide service</span></div>
    <div class="stat reveal"><span class="stat__n">Fortnightly</span><span class="stat__l">site inspections</span></div>
    <div class="stat reveal"><span class="stat__n">One</span><span class="stat__l">point of contact</span></div>
  </div>
</section>

<section class="sectors wrap">
  <h2 class="h2 reveal">What we look after</h2>
  <div class="sectors__grid">
    ${services.map((s, i) => `
    <a class="card reveal" href="${u(`/services/${s.slug}/`)}">
      <span class="card__img">${pic(s.img, { sizes: '(min-width: 900px) 25vw, 90vw', alt: '', style: s.pos })}</span>
      <span class="card__body"><span class="card__n">0${i + 1}</span><h3>${esc(s.title)}</h3><p>${esc(s.short)}</p><span class="card__more">Learn more →</span></span>
    </a>`).join('')}
  </div>
</section>

<section class="marquee" aria-hidden="true">
  <div class="marquee__track">${[...marquee, ...marquee].map((m) => `<span>${esc(m)}</span>`).join('')}</div>
</section>

<section class="why wrap">
  <div class="why__media clipin">${pic('highrise', { sizes: '(min-width: 900px) 50vw, 100vw' })}</div>
  <div class="why__text">
    <h2 class="h2 reveal">Less chasing. More done.</h2>
    <ul class="ticks">
      <li class="reveal"><strong>A single point of contact.</strong> Requests, interactions and schedules are recorded in our Customer Services Database.</li>
      <li class="reveal"><strong>Inspected and signed off.</strong> Operations Management inspects sites fortnightly or as required, with reports signed off by a client representative.</li>
      <li class="reveal"><strong>Screened, trained, insured.</strong> Staff are inducted, trained in OH&amp;S and issued ID cards. WorkCover and public risk policies are held.</li>
    </ul>
    <p class="reveal"><a class="link" href="${u('/about-quality/')}">How we work →</a></p>
  </div>
</section>

<section class="quote" id="quote">
  <div class="wrap quote__grid">
    <div class="quote__intro">
      <h2 class="h2 h2--light reveal">Get a quote</h2>
      <p class="reveal">Tell us about your property and what you need. We'll come back to you to discuss the details.</p>
      <p class="reveal quote__alt">Prefer to talk? <a href="tel:${site.phoneHref}">${site.phone}</a></p>
    </div>
    <div class="quote__form reveal">${quoteForm('quote-form')}</div>
  </div>
</section>`,
});

// Services overview
add('/services/', {
  title: 'Services',
  desc: 'Commercial, industrial, high rise residential and body corporate cleaning and maintenance across Victoria.',
  body: `
<section class="pagehead"><div class="wrap"><p class="eyebrow">Services</p><h1>Cleaning and maintenance, coordinated.</h1><p class="pagehead__lead">Ongoing programmes or ad hoc jobs, for properties large and small. Choose the area closest to your property.</p></div></section>
<section class="wrap sectors sectors--page">
  <div class="sectors__grid">
    ${services.map((s, i) => `
    <a class="card reveal" href="${u(`/services/${s.slug}/`)}">
      <span class="card__img">${pic(s.img, { sizes: '(min-width: 900px) 25vw, 90vw', alt: '', style: s.pos })}</span>
      <span class="card__body"><span class="card__n">0${i + 1}</span><h3>${esc(s.title)}</h3><p>${esc(s.short)}</p><span class="card__more">Learn more →</span></span>
    </a>`).join('')}
  </div>
</section>
<section class="band"><div class="wrap band__in"><p>Not sure which fits? Tell us about your property.</p>${cta('Get a Quote', '/#quote', 'btn--solid')}</div></section>`,
});

// Service detail pages
for (const s of services) {
  add(`/services/${s.slug}/`, {
    title: s.title,
    desc: s.lead,
    body: `
<section class="pagehead pagehead--img">
  <div class="pagehead__bg" aria-hidden="true">${pic(s.img, { eager: true, alt: '' })}</div>
  <div class="wrap"><p class="eyebrow"><a href="${u('/services/')}">Services</a> / ${esc(s.title)}</p><h1>${esc(s.title)}</h1></div>
</section>
<section class="wrap detail">
  <p class="detail__lead reveal">${esc(s.lead)}</p>
  <div class="detail__grid">
    ${s.points.map(([h, t]) => `<div class="point reveal"><h2>${esc(h)}</h2><p>${esc(t)}</p></div>`).join('')}
  </div>
</section>
<section class="band"><div class="wrap band__in"><p>Discuss ${esc(s.title.toLowerCase())} for your property.</p>${cta('Get a Quote', '/#quote', 'btn--solid')}</div></section>`,
  });
}

// About & Quality
add('/about-quality/', {
  title: 'About & Quality',
  desc: 'Kew-based, Victorian, with over 30 years in property maintenance and commercial cleaning. How we inspect, record and report.',
  body: `
<section class="pagehead"><div class="wrap"><p class="eyebrow">About &amp; Quality</p><h1>Over 30 years looking after Victorian properties.</h1><p class="pagehead__lead">Tourwood is a Kew-based Victorian organisation delivering responsive, cost-effective services to a diverse client base throughout the state.</p></div></section>
<section class="wrap prose">
  <div class="prose__block reveal"><h2>Who we work with</h2><p>We work with property managers, owners and tenants, providing ongoing programmes and ad hoc services for properties large and small, across offices, factories, retail sites, medical facilities, warehouses, showrooms, residential units, high rise complexes and body corporate properties.</p></div>
  <div class="prose__block reveal"><h2>Our people &amp; insurance</h2><p>Our team receives induction and occupational health and safety training. Staff are screened and issued identification cards, with ongoing site assignments supporting consistency and trust. Tourwood holds WorkCover and public risk policies covering its activities. Certificates of Currency are available on request.</p></div>
  <div class="prose__block reveal"><h2>Quality assurance</h2><p>Operations Management conducts site inspections fortnightly or as required, supported by monthly customer service calls. Inspection reports are shared with clients and cleaning staff, signed off by a client representative and followed up at the next inspection or service call.</p></div>
  <div class="prose__block reveal"><h2>Service records &amp; communication</h2><p>Our Customer Services Database maintains site details, inspection records, communications and service history. Periodic carpet, vinyl and window cleaning is scheduled by frequency, flagged for completion and signed off by the client. A site Communication Book supports special requests and records completed tasks.</p></div>
  <div class="prose__block reveal"><h2>Environmental commitment</h2><p>Our existing programme specifies biodegradable cleaning products, with product safety documentation available for each site on request. Where possible, and subject to client requirements, we aim to minimise plastic use.</p></div>
</section>
<section class="band"><div class="wrap band__in"><p>Talk to us about a coordinated programme for your property.</p>${cta('Get a Quote', '/#quote', 'btn--solid')}</div></section>`,
});

// Contact
add('/contact/', {
  title: 'Contact',
  desc: 'Contact Tourwood Property Services in Kew, Victoria. Ongoing maintenance, routine cleaning or an ad hoc service.',
  body: `
<section class="pagehead"><div class="wrap"><p class="eyebrow">Contact</p><h1>Discuss your property requirements.</h1><p class="pagehead__lead">Ongoing maintenance, routine cleaning or an ad hoc service. Talk to us about a coordinated programme for your property.</p></div></section>
<section class="wrap contact">
  <div class="contact__info reveal">
    <h2>Tourwood Property Services</h2>
    <p>${site.addressLines.join('<br>')}</p>
    <p>Tel <a href="tel:${site.phoneHref}">${site.phone}</a><br>Fax ${site.fax}<br>${email()}</p>
    <p class="small">${esc(site.legal)}<br>ABN ${site.abn}<br>Licence ${site.licence}</p>
  </div>
  <div class="contact__form reveal"><h2>Send us a message</h2>${quoteForm('contact-form')}</div>
</section>`,
});

// 404
add('/404.html', {
  title: 'Page not found',
  desc: 'Page not found.',
  body: `<section class="pagehead"><div class="wrap"><p class="eyebrow">404</p><h1>We couldn't find that page.</h1><p class="pagehead__lead">${cta('Back to home', '/', 'btn--solid')}</p></div></section>`,
});

// ---------- write ----------
rmSync(OUT, { recursive: true, force: true });
for (const p of pages) {
  const file = p.path.endsWith('.html') ? join(OUT, p.path) : join(OUT, p.path, 'index.html');
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, p.html);
}
mkdirSync(join(OUT, 'assets'), { recursive: true });
cpSync('assets/img', join(OUT, 'assets/img'), { recursive: true });
cpSync('src/css/style.css', join(OUT, 'assets/style.css'));
cpSync('src/js/main.js', join(OUT, 'assets/main.js'));
if (existsSync('public')) cpSync('public', OUT, { recursive: true });
// robots + sitemap
writeFileSync(join(OUT, 'robots.txt'), BASE ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\nSitemap: https://tourwood.com.au/sitemap.xml\n`);
if (!BASE) {
  const urls = pages.filter((p) => !p.path.endsWith('.html')).map((p) => `<url><loc>https://tourwood.com.au${p.path}</loc></url>`).join('');
  writeFileSync(join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`);
}
console.log(`Built ${pages.length} pages -> ${OUT}/ (BASE='${BASE}', demo=${DEMO})`);
