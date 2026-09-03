#!/usr/bin/env node
/* Just Landed — page generator.
   Renders every HTML page (EL at /, EN at /en/) + sitemap.xml from:
     site/content.mjs      prose, titles, SEO facts, FAQ (per page, per language)
     site/partials/*       logo SVG, flag SVGs, theme-init script (shared by all pages)
     site/home.css/.js     homepage-only styles and script (inlined into index.html)
   Timetables/fares stay in data.js and are rendered client-side as before.

   Usage:  node scripts/build.mjs          (writes files)
           node scripts/build.mjs --check  (exit 1 if any generated file differs — used in CI)
*/
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { SITE, HOME, FOOTER, BACK, LANG_LABEL, PAGES } from "../site/content.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CHECK = process.argv.includes("--check");
const read = (p) => readFileSync(join(ROOT, p), "utf8");

const LOGO = read("site/partials/logo.svg");
const FLAG_EN = read("site/partials/flag-en.svg");
const FLAG_EL = read("site/partials/flag-el.svg");
const THEME_INIT = read("site/partials/theme-init.html").trim();
const HOME_CSS = read("site/home.css").trim();
const HOME_JS = read("site/home.js").trim();

const LOCALE = { el: "el_GR", en: "en_US" };
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const stripTags = (s) => String(s).replace(/<[^>]+>/g, "");
const unesc = (s) => String(s).replace(/&amp;/g, "&").replace(/&#8212;/g, "—").replace(/&#8594;/g, "→").replace(/&#8592;/g, "←").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">");

/* URL helpers — one place to change if the language layout ever changes (e.g. EN at /). */
const pathFor = (slug, lang) => (lang === "el" ? "/" : "/en/") + (slug === "index" ? "" : slug + ".html");
const urlFor = (slug, lang) => SITE.origin + pathFor(slug, lang);
const fileFor = (slug, lang) => (lang === "el" ? "" : "en/") + slug + ".html";

function ga() {
  return `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${SITE.ga}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${SITE.ga}');
</script>`;
}

function metaBlock({ slug, lang, title, description, viewport }) {
  const other = lang === "el" ? "en" : "el";
  const t = esc(title), d = esc(description);
  return `<meta charset="UTF-8">
<meta name="viewport" content="${viewport || "width=device-width, initial-scale=1.0"}">
<title>${t}</title>
<meta name="description" content="${d}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${SITE.name}">
<meta property="og:locale" content="${LOCALE[lang]}">
<meta property="og:locale:alternate" content="${LOCALE[other]}">
<meta property="og:title" content="${t}">
<meta property="og:description" content="${d}">
<meta property="og:url" content="${urlFor(slug, lang)}">
<meta property="og:image" content="${SITE.origin}${SITE.ogImage}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${t}">
<meta name="twitter:description" content="${d}">
<meta name="twitter:image" content="${SITE.origin}${SITE.ogImage}">
<link rel="canonical" href="${urlFor(slug, lang)}">
<link rel="alternate" hreflang="el" href="${urlFor(slug, "el")}">
<link rel="alternate" hreflang="en" href="${urlFor(slug, "en")}">
<link rel="alternate" hreflang="x-default" href="${urlFor(slug, "el")}">
<link rel="icon" type="image/svg+xml" href="/favicon-v16.svg">
<link rel="icon" type="image/png" sizes="48x48" href="/favicon-48.png?v=16">
<link rel="icon" type="image/png" sizes="96x96" href="/favicon-96.png?v=16">
<link rel="icon" type="image/png" sizes="144x144" href="/favicon-144.png?v=16">
<link rel="icon" type="image/png" sizes="192x192" href="/favicon-192.png?v=16">
<link rel="apple-touch-icon" sizes="180x180" href="/favicon-180.png?v=16">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@700;800;900&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
${THEME_INIT}`;
}

function langSwitch(slug, lang) {
  const a = (l, flag) => `<a href="${pathFor(slug, l)}" data-lang="${l}"${l === lang ? ' class="active" aria-current="page"' : ""}>${flag}</a>`;
  return `<div class="lang-switch" id="lang-switch" aria-label="${LANG_LABEL[lang]}">${a("en", FLAG_EN)}${a("el", FLAG_EL)}</div>`;
}

function ldFaq(faq) {
  return JSON.stringify({
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: faq.map((f) => ({ "@type": "Question", name: unesc(f.q), acceptedAnswer: { "@type": "Answer", text: unesc(stripTags(f.a)) } })),
  });
}
function ldWebPage(slug, lang, c) {
  return JSON.stringify({ "@context": "https://schema.org", "@type": "WebPage", name: c.title, url: urlFor(slug, lang), description: c.description, isPartOf: { "@type": "WebSite", name: "JUST LANDED", url: SITE.origin + "/" } });
}
function ldSite(lang) {
  return JSON.stringify({ "@context": "https://schema.org", "@graph": [
    { "@type": "WebSite", "@id": SITE.origin + "/#website", url: urlFor("index", lang), name: SITE.name, inLanguage: lang, publisher: { "@id": SITE.origin + "/#org" } },
    { "@type": "Organization", "@id": SITE.origin + "/#org", name: SITE.name, url: SITE.origin + "/", logo: { "@type": "ImageObject", url: SITE.origin + SITE.logoPng } },
  ] });
}

function seoSection(c) {
  const prose = c.prose.map((p) => `  <h2>${p.h2}</h2><p${p.cls ? ` class="${p.cls}"` : ""}>${p.p}</p>`).join("\n");
  const facts = c.facts.length ? `\n  <h2>${c.factsHeading}</h2><dl class="seo-facts">\n${c.facts.map((f) => `  <div><dt>${f.dt}</dt><dd>${f.dd}</dd></div>`).join("\n")}\n  </dl>` : "";
  const faq = c.faq.length ? `\n  <h2>${c.faqHeading}</h2><div class="faq">\n${c.faq.map((f) => `  <details><summary>${f.q}</summary><div>${f.a}</div></details>`).join("\n")}\n  </div>` : "";
  return `  <section class="seo" aria-label="${esc(c.seoLabel)}">\n${prose}${facts}${faq}</section>`;
}

function airportPage(page, lang) {
  const c = page[lang];
  const isDest = page.kind === "route" || page.code === "ATH";
  const h1 = c.h1 != null ? c.h1 : `${c.h1Prefix} <em id="desttitle">${c.dest}</em>`;
  const body = isDest
    ? `  <div class="qh" data-i18n="whereHeaded">${lang === "el" ? "Πού κατευθύνεσαι;" : "Where are you headed?"}</div>\n  <div class="chips" id="chips"></div>\n  <div id="destcards"></div>`
    : `  <p class="tagline" id="sub"></p>\n  <div id="options"></div>\n  <div class="conns" id="conns"></div>`;
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
${ga()}

${metaBlock({ slug: page.slug, lang, title: c.title, description: c.description })}
<link rel="stylesheet" href="/tokens.css">
<link rel="stylesheet" href="/style.css">
<link rel="stylesheet" href="/seo.css">
${page.kind === "route" ? `<script type="application/ld+json">${ldWebPage(page.slug, lang, c)}</script>\n` : ""}<script type="application/ld+json">${ldFaq(c.faq)}</script>
</head>
<body>
<div class="wrap">
  <header>
    <div class="logo"><a href="${pathFor("index", lang)}" class="lk" aria-label="${HOME[lang].homeLabel}">${LOGO}</a></div>
    <div class="header-tools">${langSwitch(page.slug, lang)}<div class="clock" id="clock">${lang === "el" ? "τώρα" : "now"} –:–</div></div>
  </header>
  <a class="backlink" id="backlink" href="${pathFor("index", lang)}">${BACK[lang]}</a>
  <h1>${h1}</h1>
  <p class="intro">${c.intro}</p>
${body}
${seoSection(c)}
  <div class="disclaimer" id="disc"></div>
  <footer><span data-i18n="footer">${FOOTER[lang]}</span><br><span id="tz"></span></footer>
</div>
<script src="/data.js"></script>
<script>
  const CODE="${page.code}";
  const tzEl=document.getElementById("tz"); if(tzEl) tzEl.textContent=Intl.DateTimeFormat().resolvedOptions().timeZone;
${page.dest ? `  DESTSEL[CODE]="${page.dest}";\n` : ""}  initAirport(CODE);
  if(typeof applyLanguage === "function") applyLanguage();
</script>
</body>
</html>
`;
}

function homePage(lang) {
  const c = HOME[lang];
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
${ga()}
${metaBlock({ slug: "index", lang, title: c.title, description: c.description, viewport: "width=device-width, initial-scale=1.0, viewport-fit=cover" })}
<link rel="stylesheet" href="/tokens.css">
<style>
${HOME_CSS}
</style>
<script type="application/ld+json">${ldSite(lang)}</script>
</head>
<body>
<div class="wrap">
<header>
  <a href="${pathFor("index", lang)}" id="home-link" aria-label="${c.homeLabel}">
    ${LOGO}
  </a>
  <div class="header-tools">
    ${langSwitch("index", lang)}
    <div class="clock" id="clock">--:--</div>
  </div>
</header>
<section class="hero">
  <div class="eyebrow" id="eyebrow">${c.eyebrow}</div>
  <h1 id="hero-heading">${c.heading}</h1>
  <p id="hero-description">${c.hero}</p>
</section>
<section class="airports" id="airports" aria-label="${c.airports}"></section>
<div class="homepage-note" id="homepage-note" aria-live="polite">${c.note}</div>
</div>
<script src="/data.js"></script>
<script>
${HOME_JS}
</script>
</body>
</html>
`;
}

function sitemap() {
  const today = new Date().toISOString().slice(0, 10);
  const existing = existsSync(join(ROOT, "sitemap.xml")) ? read("sitemap.xml") : "";
  const urls = [];
  for (const slug of ["index", ...PAGES.map((p) => p.slug)]) for (const lang of ["el", "en"]) {
    const loc = urlFor(slug, lang);
    // keep an existing lastmod unless the page content changed (caller bumps via --touch)
    const m = existing.match(new RegExp(`<loc>${loc.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}</loc><lastmod>([^<]+)</lastmod>`));
    urls.push(`  <url><loc>${loc}</loc><lastmod>${m && !process.argv.includes("--touch") ? m[1] : today}</lastmod></url>`);
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
}

/* ---- run ---- */
const out = new Map();
for (const lang of ["el", "en"]) out.set(fileFor("index", lang), homePage(lang));
for (const page of PAGES) for (const lang of ["el", "en"]) out.set(fileFor(page.slug, lang), airportPage(page, lang));
out.set("sitemap.xml", sitemap());

let changed = 0;
for (const [file, html] of out) {
  const cur = existsSync(join(ROOT, file)) ? read(file) : null;
  if (cur === html) continue;
  changed++;
  if (CHECK) console.error("STALE: " + file);
  else { writeFileSync(join(ROOT, file), html); console.log("wrote " + file); }
}
if (CHECK && changed) { console.error(`${changed} generated file(s) out of date — run: node scripts/build.mjs`); process.exit(1); }
console.log(CHECK ? "all generated files up to date" : `${changed} file(s) written, ${out.size - changed} unchanged`);
