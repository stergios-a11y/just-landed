# Just Landed — Handover

Static bilingual (EL/EN) site telling arriving travellers how to get from Greek
airports into the city by **public transport first** (taxi shown as info, no
booking upsell). Live at **https://justlanded.gr**.

Repo: `github.com/stergios-a11y/just-landed` · local: `~/Projects/justlanded`
(reached in Cowork under `~/mnt/justlanded`).

---

## Stack & how it serves

- **Vanilla HTML/CSS/JS, no framework.** All 26 pages + `sitemap.xml` are
  **generated** by `node scripts/build.mjs` from `site/content.mjs` (prose, SEO,
  FAQ per page/language) and `site/partials/*` (logo, flags, theme script).
  Generated HTML is committed, so deploy still needs no build; CI refuses to
  deploy if the committed HTML is out of date (`npm run check`).
  All rendering logic + timetable data live in one file, `data.js`.
- **Cloudflare Worker** (`worker.js`) fronts static assets:
  - `/api/airport` proxies the **OASA telematics feed** for the airport stop
    (10705). OASA only reports **inbound** buses there (X95 `2051`, X96
    `3028`/`3030` night, X93 `5675`, X97 `5374`/`5375`); the outbound codes
    start at that stop so never appear. The feed returns
    `{lines:{x95:[min,...],x96:[...],...}}` = minutes until the next inbound
    bus reaches the stop; it departs a few minutes later. The UI labels live
    times `~HH:MM · LIVE` with a note saying exactly that — keep it honest.
    Any error falls through to static assets, so the site never breaks if
    OASA is down.
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

**Editing pages:** never hand-edit `*.html` / `en/*.html` — edit
`site/content.mjs` (copy, SEO facts, FAQ; the FAQ JSON-LD is derived from it),
`site/home.css` / `site/home.js` (homepage only), or `scripts/build.mjs`
(template/head/header), then `npm run build` and commit the regenerated files.
Adding a page = one entry in `PAGES` (both languages) + rebuild; the sitemap
follows. `node scripts/build.mjs --touch` bumps every sitemap `lastmod`.

**Prose <-> data lint:** the build fails if a page's intro/prose/facts/FAQ
mention a `€` amount or `HH:MM` that doesn't exist in that airport's `data.js`
entry (fare differences like "€3.50 less" are allowed). So a fare change in
`data.js` forces you to fix the copy too.

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

- `scripts/build.mjs` — the generator (templates for home / airport / route
  pages, meta + hreflang + JSON-LD, sitemap). `site/content.mjs` — all page copy.
  `site/partials/` — `logo.svg`, `flag-en.svg`, `flag-el.svg`, `theme-init.html`.
  `site/home.css`, `site/home.js` — homepage-only styles/script (inlined at build).
- `index.html` / `en/index.html` — GENERATED homepage (airport grid); its grid
  text comes from the `COPY` dict in `site/home.js`, not data.js.
- **Route pages** `athens-airport-to-{acropolis,syntagma,monastiraki,piraeus,`
  `rafina,kifisos-bus-station}.html` (+ `en/`) — GENERATED, one destination
  each (`kind:"route"`, `dest:` in content.mjs → `DESTSEL[CODE]`).
- **City/airport pages** `athens, thessaloniki, heraklion, chania, santorini,`
  `rhodes .html` (+ `en/`) — GENERATED, per-airport (`kind:"airport"`).
- `data.js` (~81KB) — **the brain**: `AIRPORTS` data + all render logic + i18n.
- `tokens.css` — single colour-palette source (light default + dark).
- `style.css` — main styles. `seo.css` — styles for the SEO prose sections.
- `worker.js`, `wrangler.jsonc`, `.github/workflows/deploy.yml`, `deploy.sh`.
- Assets: `*-landmark.{png,webp}` (perfect-circle city graphics), favicons,
  `og-image.png` (1200x630 share image), inline-SVG logo (see below).
- `robots.txt`; `sitemap.xml` + hreflang alternates are generated (`x-default` -> the EN page).
- `package.json` — only npm scripts (`build`, `check`, `serve`); no dependencies.

### Stale files (cleanup candidates)
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
  -> `discText(code)` renders the "indicative data, not verified on site"
  disclaimer (`DISC_UNVERIFIED`); verified airports use `DISC_I18N`/`DISC_EN`.
  Island fares/times are **estimates** from published timetables (Rhodes and
  Santorini re-checked Sep 2026).
- ATH `destinations[].routes[]` entries: `k` (route key), `to`, `best`, `how`
  (transfer instructions, rendered under the ride step), `alt:true` (never
  competes for Fastest/Cheapest — used for Suburban Rail on "City centre"),
  `jd` (use another destination's journey time) + `walkAfter` (minutes added
  to the ride/total, e.g. "Monastiraki, then ~10 min walk").
- `journeyBands` (time-of-day ride times) scale `journeyByDestination` values
  proportionally, so rush-hour/night differences apply on every ATH page.
- Schedules: `sched` is `{kind:"range"}`, `{kind:"windows"}` (end inclusive
  unless another window starts there) or `{kind:"times", times:[...]}` /
  `{kind:"times", byDay:{weekday,sat,sun}}`. `seasons:[{from:"MM-DD",to:"MM-DD",
  sched, est?}]` overrides `sched` by calendar date (`schedFor`, `isEstimateAt`).
- Each option `o`: `mode` (`metro|bus|rail|taxi`), `name`, `to`, `price`,
  `journey`, `access`, etc. `checked:"Aug 2026"` renders a "Fare & timetable
  checked …" line on the card; `est:true` renders "Estimate — not verified on
  site" instead (`sourceLine(o)`). `official:true` (ATH taxi) says "Official fare".
- "Fastest" tag reads **"Fastest now"** in now-mode because the ranking
  includes waiting time and changes minute to minute; static prose should only
  ever call the Metro fastest *ride*.
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

1. Island verification status (Sep 2026 research, sources in the commit
   message / per-option notes):
   - HER **verified** — fares from Astiko KTEL price list; line 6 official
     weekday (k6.pdf, 01-08-2026) + Saturday/Sunday (s6/kur6.pdf, 01-09-2026)
     lists encoded via `byDay`. Line 12 adds more but isn't encoded.
   - JTR **verified** for summer (official KTEL Santorini routes page); winter
     (Nov–Mar) is a 6-bus estimate flagged `seasons[].est` until KTEL publishes.
   - RHO unverified — €3 + full summer (Mon–Fri/Sat/Sun) and winter lists are
     from rhodesoldtown.gr / rodos-rhodes.com copies; rodospublictransport.gr
     could not be fetched. Summer season set May 1–Oct 15 in `seasons`.
   - CHQ unverified — official PDF (e-ktel.com, monthly) unreadable; times are
     the June/Sep 2026 secondary copies, fare ~€2.70. Re-check monthly.
   - SKG unverified — €2 fare is official (OSETH), no cash on board since Jan
     2026; 01X/01N times are Moovit/secondary. 02X+Metro option added (frequency
     estimated). 03X to Mikra started 27 Aug 2026 — not yet an option.
2. Live feed now covers X95/X96/X93/X97 by line id (`route:"x96"` etc. in
   data.js). If OASA ever exposes departures at the origin stop, switch the
   worker to outbound codes (listed in worker.js) and drop the turnaround note.
3. Delete the `.before-departure-ui` snapshots (gitignored, local only).
4. Language layout stays EL-root by decision (Greek traffic expected to win);
   `x-default` points to EN. `pathFor()/fileFor()` in the generator are the only
   places that know the layout if that ever changes.
5. City → airport page is LIVE: `athens-to-airport.html` (+ `/en/`),
   `kind:"reverse"` in content.mjs, data in `AIRPORTS.ATH.reverse`
   (`origins[].routes[]` with `walkIn`, `gateWalk`, `stop`, `gate`, same
   `sched`/`journeyBands` formats). Logic: `rvPlan()` = latest departure whose
   dep+ride+gateWalk <= arrive-by (within a 4h window), "Leave by" = dep-walkIn;
   modes that can't make it stay as a greyed "too late" card. Sources: STASY L3
   first/last table (airport trains every 36'), Hellenic Train PDF (May 2026),
   OASA express page (24h, journeys, stops); bus headways are 2021 secondary →
   est. Boarding-stop picker: `RV_STOPS` (OASA stop lists for 2051/3028/5675 with
   route fraction → minutes; M3/Proastiakos station offsets, approx). Picking
   a stop shifts the departure by the offset and, for buses, shows LIVE OASA
   arrivals at that stop via `/api/stop?s=<code>` — real, because at
   intermediate stops OASA reports buses en route (unlike origin stops).
   Next: link from the homepage.
