# Just Landed — Handover

Static bilingual (EL/EN) site telling arriving travellers how to get from Greek
airports into the city by **public transport first** (taxi shown as info, no
booking upsell). Live at **https://justlanded.gr**.

Repo: `github.com/stergios-a11y/just-landed` · local: `~/Projects/justlanded`
(reached in Cowork under `~/mnt/justlanded`).

---

## Stack & how it serves

- **Vanilla HTML/CSS/JS. No framework, no build step.** Pages are hand-authored
  `.html`; all rendering logic + data live in one file, `data.js`.
- **Cloudflare Worker** (`worker.js`) fronts static assets:
  - `/api/airport` and `/api/x95` proxy the **OASA telematics feed** for live
    Athens airport-express bus arrivals (route X95 = code `2051`). Any error
    falls through to static assets, so the site never breaks if OASA is down.
  - Everything else -> `env.ASSETS.fetch` (the static files).
- `wrangler.jsonc`: worker name `airporttocity`, `assets.directory: "./"`.
- `.assetsignore` lists files NOT served publicly (worker.js, wrangler.jsonc,
  README, dotfiles, HANDOVER.md). **Add anything that shouldn't be public here.**

## Deploy

**Primary path — push to `main`, GitHub Actions does the rest:**
```
cd ~/Projects/justlanded && git add -A && git commit -m "..." && git push
```
`.github/workflows/deploy.yml` runs `wrangler deploy` on every push to `main`
(secrets `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` live in GitHub).
Stergios deploys manually this way after each change.

**Manual fallback:** `./deploy.sh` (`git pull --ff-only` + `npx wrangler deploy`)
from the local machine — needs local wrangler auth (`wrangler-account.json`,
gitignored). It deploys the *working dir*, so untracked junk would ship; prefer
the push path.

**Cache-bust:** assets referenced with `?v=N` (e.g. landmark images `?v=2`).
Bump N when you replace an image, or the CDN/browser serves the stale one.

## Local preview

No build. Serve the folder root so absolute paths (`/style.css`) resolve:
```
python3 -m http.server 8000    # then open http://localhost:8000
```
The live-bus API won't respond locally (that's the Worker) — the UI falls back to
timetables, which is fine for layout work.

---

## File map

- `index.html` / `en/index.html` — homepage (airport grid). Has its OWN inline
  `<style>` + i18n dict (does NOT use data.js for its grid text).
- **Route pages** `athens-airport-to-{acropolis,syntagma,monastiraki,piraeus,`
  `rafina,kifisos-bus-station}.html` (+ `en/`) — one destination each; set
  `CODE="ATH"` and `DESTSEL[CODE]="..."`, then `initAirport(CODE)`.
- **City/airport pages** `athens, thessaloniki, heraklion, chania, santorini,`
  `rhodes .html` (+ `en/`) — per-airport, all destinations.
- `data.js` (~81KB) — **the brain**: `AIRPORTS` data + all render logic + i18n.
- `tokens.css` — single colour-palette source (light default + dark).
- `style.css` — main styles. `seo.css` — styles for the SEO prose sections.
- `worker.js`, `wrangler.jsonc`, `.github/workflows/deploy.yml`, `deploy.sh`.
- Assets: `*-landmark.{png,webp}` (perfect-circle city graphics), favicons,
  `og-image.png` (1200x630 share image), inline-SVG logo (see below).
- `robots.txt`, `sitemap.xml`, hreflang alternates on every page.

### Stale files (cleanup candidates)
- `index-backup.html` — tracked, stale, still bulk-edited. Probably deletable.
- `*.before-departure-ui` — old snapshots (gitignored).
- `just-landed-header.svg` / `just-landed-*.svg` — earlier logo experiments; the
  header logo is now inline (below). `just-landed-header.svg` geometry is broken
  (text overlaps arrow) — don't reuse it.
- `.logo_bak/` — backup from the logo edit, gitignored + assetsignored.
  Deletable (rm on the Mac needs a Finder delete; harmless, never deploys).

---

## Data model (`data.js`)

- `AIRPORTS[CODE]` = `{ verified, destinations, options, ... }`. **Only ATH is
  `verified:true`** (fares/times checked Aug 2026). Islands are `verified:false`
  -> each renders a "sample data, confirm at stop" disclaimer; their fares/times
  are **estimates** (web-researched, not official).
- Each option `o`: `mode` (`metro|bus|rail|taxi`), `name`, `to`, `price`,
  `journey`, `access`, etc.
- **Taxi:** `fareDay`/`fareNight`, `nightStart:0, nightEnd:5` (Greek night tariff
  00:00-05:00). Night fare is computed from **arrival time** (departure +
  journey), shown as "arrive ~HH:MM · night fare", with a note it's by arrival
  time. `est:true` islands add "approx / metered" wording. ATH taxi is the
  **official flat fare** EUR 40 day / EUR 55 night (no `est`, no metered wording).
  Helpers: `taxiNow(o,d)`, logic in `optionBody`'s TAXI branch.
- **Stop link:** island bus options carry `ll:"lat,lng"` + `startPin:true`;
  `stopLink(o)` opens a Google Maps **location pin** labelled "Αφετηρία" /
  "Start point". Athens uses `walkDir(o)` -> walking **directions** ("Οδηγίες").
- **i18n:** `JL_LANG` (`el`/`en`), `I18N.el` dict, `tr()`, and
  `T=(el,en)=>JL_LANG==="el"?el:en` inline. EL is default; `/en/` mirrors it.
  `applyLanguage()` swaps text after render.
- **Cards:** `destCard()` -> Fastest/Cheapest tags sit inline on the right of the
  headline (`.tagcol`); taxi cards suppress the route arrow.

## Theme system

- `tokens.css`: **light is the default** on bare `:root`; dark is defined under
  BOTH `:root[data-theme="dark"]` and
  `@media(prefers-color-scheme:dark){:root:not([data-theme="light"])}`.
- AA-safe small-text variants: `--amber-ink` (#985f00 light), `--green-ink`
  (#157a41 light) = accent colour in dark. Use these for small coloured text, not
  raw `--amber`/`--green` (which fail AA on white).
- **Init script** is inline in every page `<head>` (before tokens.css, avoids
  FOUC). Priority: (1) saved `localStorage['jl-theme']` wins; (2) else follow OS
  `prefers-color-scheme`; (3) else — only if the browser reports no preference at
  all — fall back to clock (dark 19:00-07:00). In practice (3) rarely fires. It
  also injects the `#theme-toggle` (moon/sun) button into `.header-tools` and
  defines `window.toggleTheme`.
- Fonts: **Inter 700/800/900 + JetBrains Mono only.** Chakra Petch was removed;
  body weights 400-600 fall back to system-ui by design.

## Logo (current)

Header logo is an **inline SVG** in every page (`class="header-logo"`), themed via
`currentColor` (`.header-logo{color:var(--ink)}`) so it flips ink-dark /
near-white automatically; the amber block-arrow is fixed `#FFC107`. It's the
**traced approved airliner** (potrace of the PNG, blur-then-threshold to kill
raster jaggies) + live Inter text — razor-sharp at any size.
- The old PNG src-swap is retired: `logo()` in the theme script is now a no-op.
- `just-landed-approved-logo*.png` are **kept** only because JSON-LD
  `Organization.logo` still references them. If you re-export the logo, update
  those PNGs and the OG image too.
- To change the logo, edit the inline `<svg>` — identical in all 27 files, so use
  a scripted find-replace, don't hand-edit each.

---

## Conventions & gotchas

- **Metric units**, factual tone, no booking upsell — the product stance.
- Header markup + inline theme script + inline SVG logo are **duplicated across
  all 27 HTML files**. Cross-file changes = ONE scripted find/replace over
  `*.html en/*.html`, never file-by-file.
- Keep EL and EN in sync — every page has an `/en/` twin and hreflang tags.
- Coloured small text: use the `-ink` token or check AA contrast on white.
- The Uber app pill is fixed brand-black `#10131a` (don't tie it to a surface
  token — it went invisible on light once).

## Suggested next work (leftovers)

1. **Verify island fares/times** and flip their `verified` flags — HER, CHQ, JTR,
   RHO, SKG currently show the "sample data" disclaimer.
2. Extend the **live feed** beyond Athens X95 (route codes for X96 Piraeus etc.
   are already in `worker.js` `ROUTES` but not surfaced per-destination).
3. Delete stale `index-backup.html` and the `.before-departure-ui` snapshots.
4. Consider **generating** route/city pages from `data.js` instead of hand-
   maintaining 27 near-identical HTML files (biggest maintenance win, bigger lift).
