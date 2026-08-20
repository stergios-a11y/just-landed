/* Just Landed Worker: static assets + live OASA airport-bus feed at /api/airport.
   Any error falls through to static assets, so the site never breaks. */

const OASA = "https://telematics.oasa.gr/api/";
const AIRPORT_STOPS = ["10705", "440103"];        // airport express-bus stops
// airport express route codes: X95 Syntagma, X96 Piraeus, X97 Elliniko, X93 Kifisos
const ROUTES = { "2051":1, "3028":1, "5373":1, "5675":1 };

async function airport(){
  const seen = new Set(), byRoute = {};
  await Promise.all(AIRPORT_STOPS.map(async (s) => {
    try {
      const r = await fetch(OASA + "?act=getStopArrivals&p1=" + s, { cf: { cacheTtl: 15 } });
      if (!r.ok) return;
      const data = await r.json().catch(() => null);
      if (Array.isArray(data)) for (const a of data) {
        const rc = a.route_code; if (!ROUTES[rc]) continue;
        const key = (a.veh_code||"") + "|" + rc + "|" + (a.btime2||"");
        if (seen.has(key)) continue; seen.add(key);
        const m = parseInt(a.btime2, 10);
        if (!isNaN(m)) (byRoute[rc] = byRoute[rc] || []).push(m);
      }
    } catch (e) {}
  }));
  for (const k in byRoute) byRoute[k].sort((x, y) => x - y);
  return { routes: byRoute, ts: Date.now() };
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
      if (url.pathname === "/api/x95") { const d = await airport(); const mins = d.routes["2051"] || []; return json({ live: mins.length>0, mins: mins.slice(0,4), ts: d.ts }); }
    } catch (e) {}
    return env.ASSETS.fetch(request);
  }
};
