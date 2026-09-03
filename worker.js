/* Just Landed Worker: static assets + live OASA airport-bus feed at /api/airport.
   Any error falls through to static assets, so the site never breaks.

   What the feed actually is (checked against OASA telematics, Sep 2026):
   the airport terminus stop (10705, "AIR TERMINAL") only reports INBOUND buses —
   the outbound route codes start there, so they never appear as "arrivals".
   An inbound bus turns around and departs a few minutes after it arrives, so we
   expose inbound arrivals per line as the best live proxy for the next departure.
   The UI must label it as such (it does: "live · inbound bus"). */

const OASA = "https://telematics.oasa.gr/api/";
const AIRPORT_STOP = "10705";                       // Airport terminus, all express lines

// inbound route codes (→ airport) per line. Outbound codes for reference:
// X95 2052 · X96 4382/4383 · X93 3966/5676 · X97 5373 (circular)/5376
const LINES = {
  x95: ["2051"],          // Syntagma → Airport
  x96: ["3028", "3030"],  // Piraeus → Airport (day / late-night variant)
  x93: ["5675"],          // Kifisos coach station → Airport
  x97: ["5374", "5375"],  // Elliniko → Airport
};
const CODE_TO_LINE = {};
for (const [line, codes] of Object.entries(LINES)) for (const c of codes) CODE_TO_LINE[c] = line;

async function airport(){
  const byLine = {}, seen = new Set();
  const r = await fetch(OASA + "?act=getStopArrivals&p1=" + AIRPORT_STOP, { cf: { cacheTtl: 15 } });
  if (r.ok) {
    const data = await r.json().catch(() => null);
    if (Array.isArray(data)) for (const a of data) {
      const line = CODE_TO_LINE[a.route_code]; if (!line) continue;
      const key = line + "|" + (a.veh_code || "") ; if (seen.has(key)) continue; seen.add(key);
      const m = parseInt(a.btime2, 10);
      if (!isNaN(m)) (byLine[line] = byLine[line] || []).push(m);
    }
  }
  for (const k in byLine) byLine[k].sort((x, y) => x - y);
  return { lines: byLine, kind: "inbound-arrivals", stop: AIRPORT_STOP, ts: Date.now() };
}

function json(o){
  return new Response(JSON.stringify(o), {
    headers: { "content-type":"application/json", "cache-control":"public, max-age=15", "access-control-allow-origin":"*" }
  });
}

export default {
  async fetch(request, env){
    try {
      const url = new URL(request.url);
      if (url.pathname === "/api/airport") return json(await airport());
    } catch (e) {}
    return env.ASSETS.fetch(request);
  }
};
