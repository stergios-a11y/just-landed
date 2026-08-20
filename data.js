/* Just Landed — shared data + render logic (dark-only). ATH verified; live X95 via /api/x95. */

const AIRPORTS = {
  HER: { slug:"heraklion", name:"Heraklion (HER)", city:"Crete", verified:true, title:"Heraklion Airport to town", board:"City bus · centre & port",
    options:[
      { mode:"bus", to:"Heraklion centre & port (Bus Station A)", op:"City bus · look for ‘ΗΡΑΚΛΕΙΟ / IRAKLIO’ on the front", price:"€1.30", journey:"~20 min", freqLabel:"every ~10–15 min", hours:"06:00–00:00",
        walk:"~5 min walk", access:"Main doors → turn right, follow the road",
        sched:{kind:"range",first:"06:00",last:"23:45",every:12},
        note:"€1.30 from the kiosk, €2.30 from the driver — cash. No service after midnight; validate on board." },
    ] },
  CHQ: { slug:"chania", name:"Chania (CHQ)", city:"Crete", verified:true, title:"Chania Airport to town", board:"KTEL bus · to town",
    options:[
      { mode:"bus", to:"Chania town / KTEL station", op:"KTEL Chania bus · buy from the driver", est:true, price:"€2.50", journey:"~30 min", freqLabel:"sparse — ~8–10 buses/day", hours:"05:30–23:50",
        walk:"~3 min walk", access:"Bus waiting area outside arrivals",
        sched:{kind:"range",first:"05:30",last:"23:50",every:90},
        note:"Irregular KTEL timetable (not flight-timed) — the next time shown is an estimate; check the posted schedule at the stop. €2.50 from the driver, cash." },
    ] },
  JTR: { slug:"santorini", name:"Santorini (JTR)", city:"Cyclades", verified:true, title:"Santorini Airport to Fira", board:"KTEL bus · to Fira",
    options:[
      { mode:"bus", to:"Fira (main town bus station)", op:"KTEL bus · buy from the driver", est:true, price:"€2.20", journey:"~20 min", freqLabel:"hourly in summer · ~3h in winter", hours:"~06:40–21:40",
        walk:"~2 min walk", access:"Bus stop by the arrivals exit",
        sched:{kind:"range",first:"06:40",last:"21:40",every:60},
        note:"Summer: about hourly. Winter: roughly every 3 hours — the time shown is an estimate, check the posted schedule. Overnight (00:00–05:00) barely runs; arrange backup for very early/late flights. All airport buses terminate at Fira bus station." },
    ] },
  SKG: { slug:"thessaloniki", name:"Thessaloniki (SKG)", city:"Macedonia", verified:true, title:"Thessaloniki Airport to the city centre", board:"Bus 01X · to the centre",
    options:[
      { mode:"bus", to:"City centre (Aristotelous · White Tower)", op:"OASTH bus 01X · 01N overnight", price:"€2", journey:"~40 min", freqLabel:"every ~25 min · 30 min overnight", hours:"24 hours",
        walk:"~2 min walk", access:"Bus stop outside arrivals",
        sched:{kind:"windows",windows:[{start:"06:10",end:"22:40",every:25},{start:"23:10",end:"05:55",every:30}]},
        note:"€2 airport fare (not the standard €0.90 ticket). Buy at the arrivals machines or onboard — no change given. 01X also stops at the railway station & KTEL Makedonia." },
    ] },
  ATH: { slug:"athens", name:"Athens (ATH)", city:"Attica", verified:true, title:"Athens Airport to the city centre", board:"Metro · X95 · Rail · Taxi",
    connections:[
      {icon:"ferry", to:"Piraeus port", sub:"X96 · €5.50 · Crete, Cyclades, Dodecanese", route:"3028", est:true,
        sched:{kind:"windows",windows:[{start:"05:30",end:"23:00",every:35},{start:"23:00",end:"05:30",every:70}]}},
      {icon:"ferry", to:"Rafina port", sub:"KTEL · €3 · Andros, Tinos, Mykonos, Evia · Exits 2–3", est:true,
        sched:{kind:"range",first:"04:30",last:"22:30",every:45}},
      {icon:"bus", to:"Mainland coaches", sub:"X93 · €5.50 · Kifisós / Liossíon", route:"5675", est:true,
        sched:{kind:"windows",windows:[{start:"05:30",end:"23:00",every:35},{start:"23:00",end:"05:30",every:70}]}},
      {icon:"metro", to:"South Athens", sub:"X97 · €5.50 · Elliniko / Dafni", route:"5373", est:true,
        sched:{kind:"windows",windows:[{start:"05:30",end:"23:00",every:40},{start:"23:00",end:"05:30",every:70}]}},
    ],
    routes:{
      metro:{mode:"metro",name:"Metro M3",price:"€9",journey:"~40 min",walk:"~6 min walk",sched:{kind:"range",first:"06:32",last:"23:32",every:30}},
      x95:{mode:"bus",name:"Bus X95",price:"€5.50",journey:"~50 min",walk:"~3 min walk",route:"2051",est:true,sched:{kind:"windows",windows:[{start:"06:00",end:"22:00",every:20},{start:"22:00",end:"06:00",every:60}]}},
      rail:{mode:"rail",name:"Suburban Rail",price:"€9",journey:"~50 min",walk:"~6 min walk",sched:{kind:"range",first:"06:09",last:"22:09",every:30}},
      x96:{mode:"bus",name:"Bus X96",price:"€5.50",journey:"60–75 min",walk:"~3 min walk",route:"3028",est:true,sched:{kind:"windows",windows:[{start:"05:30",end:"23:00",every:35},{start:"23:00",end:"05:30",every:70}]}},
      rafina:{mode:"bus",name:"KTEL Rafina",price:"€3",journey:"~40 min",walk:"~3 min walk",est:true,sched:{kind:"range",first:"05:00",last:"22:00",every:45}},
      x93:{mode:"bus",name:"Bus X93",price:"€5.50",journey:"~45 min",walk:"~3 min walk",route:"5675",est:true,sched:{kind:"windows",windows:[{start:"05:30",end:"23:00",every:35},{start:"23:00",end:"05:30",every:70}]}},
      taxi:{mode:"taxi",name:"Taxi",price:"€40–55",journey:"~40 min",walk:"~2 min walk",onDemand:true},
    },
    destinations:[
      {id:"centre",label:"City centre",title:"City centre",routes:[
        {k:"metro",to:"Syntagma — direct",best:true},{k:"x95",to:"Syntagma — direct"},{k:"rail",to:"Athens Central (Larissa)"},{k:"taxi",to:"door to door"}]},
      {id:"mon",label:"Monastiráki",title:"Monastiráki / Pláka",routes:[
        {k:"metro",to:"Monastiraki — direct (M3)",best:true},{k:"x95",to:"Syntagma, then ~8 min walk"},{k:"taxi",to:"door to door"}]},
      {id:"acro",label:"Acropolis",title:"Acropolis",routes:[
        {k:"metro",to:"Acropoli station",how:"M3 to <b>Syntagma</b> → change to the <b>red line (M2)</b>, 1 stop",best:true},
        {k:"metro",to:"Monastiraki, then ~10 min walk",how:"M3 <b>direct</b>, then walk up"},{k:"taxi",to:"door to door"}]},
      {id:"pir",label:"Piraeus port",title:"Piraeus port",routes:[
        {k:"x96",to:"Piraeus port — direct",best:true,note:"Ferries to Crete, Cyclades, Dodecanese"},
        {k:"metro",to:"Piraeus",how:"M3 to <b>Monastiraki</b> → change to the <b>green line (M1)</b>"},{k:"taxi",to:"door to door"}]},
      {id:"raf",label:"Rafina port",title:"Rafina port",routes:[
        {k:"rafina",to:"Rafina port — direct",best:true,note:"Ferries to Andros, Tinos, Mykonos, Evia · from Exits 2–3"},{k:"taxi",to:"door to door"}]},
      {id:"ktel",label:"Coaches",title:"Mainland coaches (KTEL)",routes:[
        {k:"x93",to:"Kifisós / Liossíon — direct",best:true,note:"KTEL coaches to the rest of Greece"},{k:"taxi",to:"door to door"}]},
    ],
    options:[
      { mode:"metro", to:"Syntagma / city centre", op:"Metro Line 3 (blue) · direct from airport", price:"€9", journey:"~40 min", freqLabel:"every ~30 min", hours:"06:32–23:32",
        walk:"~6 min walk", access:"Up to Departures level, across the walkway — follow ‘Trains’", ll:"37.936916659098664,23.94463092649655",
        sched:{kind:"range",first:"06:32",last:"23:32",every:30}, tags:["💳 Tap contactless at the gate"], note:"€9 flat airport fare (not the standard €1.20 ticket). Return €16, valid 48h." },
      { mode:"bus", to:"Syntagma", op:"Express bus X95 · runs 24 hours", route:"2051", price:"€5.50", journey:"~40–50 min", freqLabel:"every ~20 min · hourly overnight", hours:"24 hours",
        walk:"~3 min walk", access:"Arrivals level, outside Exit 5", ll:"37.93728569247656,23.947505303800178", tags:["💳 Tap contactless onboard"],
        sched:{kind:"windows",windows:[{start:"06:00",end:"22:00",every:20},{start:"22:00",end:"06:00",every:60}]},
        note:"Cheapest and never closes, but slow in traffic. Buy at the booth or just tap your card on the bus. Live times when buses are running, otherwise the timetable." },
      { mode:"rail", to:"Athens Central (Larissa Station)", op:"Suburban Railway (Proastiakós)", price:"€9", journey:"~50 min", freqLabel:"roughly every 30 min", hours:"06:09–22:09",
        walk:"~6 min walk", access:"Up to Departures level, across the walkway — follow ‘Trains’", ll:"37.936916659098664,23.94463092649655",
        sched:{kind:"range",first:"06:09",last:"22:09",every:30}, tags:["💳 Tap contactless at the gate"], note:"Fewer trains than the metro — best if you're heading to the central rail station." },
      { mode:"taxi", to:"City centre (door to door)", op:"Official flat fare", onDemand:true, price:"€40–55", journey:"~40 min", freqLabel:"on demand", hours:"24 hours",
        walk:"~2 min walk", access:"Arrivals level, outside Exit 3 (taxi rank)", tags:["💳 Card accepted"],
        noapp:"No app needed — walk to the rank and take one.", apps:["freenow","uber","bolt"],
        note:"Flat fare €40 daytime (05:00–24:00) · €55 night (00:00–05:00) to the city centre." },
    ] },
};
const ORDER = ["ATH","SKG","HER","CHQ","JTR"];
const LIVE = {};

/* transport mode icons — monochrome wayfinding glyphs */
const MODES = {
  ferry:'<path d="M20 21c-1.39 0-2.78-.47-4-1.32-2.44 1.71-5.56 1.71-8 0-1.22.85-2.61 1.32-4 1.32H2v2h2c1.38 0 2.74-.35 4-.99 2.52 1.29 5.48 1.29 8 0 1.26.65 2.62.99 4 .99h2v-2h-2zM3.95 19H4c1.6 0 3.02-.88 4-2 .98 1.12 2.4 2 4 2s3.02-.88 4-2c.98 1.12 2.4 2 4 2h.05l1.89-6.68c.08-.26.06-.54-.06-.78s-.34-.42-.6-.5L20 10.62V6c0-1.1-.9-2-2-2h-3V1H9v3H6c-1.1 0-2 .9-2 2v4.62l-1.29.42c-.26.08-.48.26-.6.5s-.15.52-.06.78L3.95 19zM6 6h12v3.97L12 8 6 9.97V6z"/>',
  metro:'<path d="M12 2c-4.42 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h12v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-3.58-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zM11 10H6V7h5v3zm2 0V7h5v3h-5zm3.5 7c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>',
  bus:'<path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4S4 2.5 4 6v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM18 11H6V6h12v5z"/>',
  rail:'<path d="M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h12v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-3.58-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zM11 10H6V6h5v4zm2 0V6h5v4h-5zm3.5 7c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>',
  taxi:'<path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H15V3H9v2H6.5c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>'
};
function modeIcon(m){ return `<svg class="micon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${MODES[m]||""}</svg>`; }

const toMin = t => { const [h,m]=t.split(":").map(Number); return h*60+m; };
const fmt = m => { m=((m%1440)+1440)%1440; const h=Math.floor(m/60),mm=m%60; return String(h).padStart(2,"0")+":"+String(mm).padStart(2,"0"); };
function departures(o){
  const s=o.sched; if(!s) return [];
  if(s.kind==="range"){ let a=toMin(s.first),b=toMin(s.last); if(b<a)b+=1440; const out=[]; for(let t=a;t<=b;t+=s.every) out.push(((t%1440)+1440)%1440); return out.sort((x,y)=>x-y); }
  if(s.kind==="windows"){ const set=new Set(); for(const w of s.windows){ let a=toMin(w.start),b=toMin(w.end); if(b<=a)b+=1440; for(let t=a;t<b;t+=w.every) set.add(((t%1440)+1440)%1440);} return [...set].sort((x,y)=>x-y); }
  return [];
}
const is24 = o => o.sched && o.sched.kind==="windows";
function nextTwo(o, nowMin){
  if(o.onDemand) return {onDemand:true, until:1000000};
  if(o.route && LIVE[o.route] && LIVE[o.route].deps && LIVE[o.route].deps.length){ const d=LIVE[o.route].deps; return {dep1:d[0],dep2:d.length>1?d[1]:d[0],until:Math.max(0,d[0]-nowMin),closed:false,isLive:true}; }
  const list=departures(o); if(!list.length) return {dep1:null,dep2:null,until:99999,closed:true};
  let i=list.findIndex(t=>t>=nowMin), wrapped=false; if(i===-1){ i=0; wrapped=true; }
  const dep1=list[i], dep2=list[(i+1)%list.length]; const until=wrapped?dep1+1440-nowMin:dep1-nowMin;
  return {dep1,dep2,until,closed:wrapped && !is24(o),isLive:false};
}

function wayOf(o){
  if(!o.access && !o.walk) return "";
  const w=o.walk?`<span class="walk">🚶 ${o.walk}</span>`:"";
  const sep=(o.walk && o.access)?" · ":"";
  let loc="";
  if(o.ll){ const url="https://www.google.com/maps/search/?api=1&query="+o.ll; loc=`<a class="maplink" href="${url}" target="_blank" rel="noopener">${o.access} <span class="pin">↗ map</span></a>`; }
  else if(o.access){ loc=`<span class="access">${o.access}</span>`; }
  return `<div class="way">${w}${sep}${loc}</div>`;
}
const BOLT_SVG='<svg width="11" height="11" viewBox="0 0 24 24" fill="#fff"><path d="M13 2L4 14h6l-1 8 9-12h-6z"/></svg>';
const APP={ freenow:{cls:"freenow",label:"FREE NOW"}, uber:{cls:"uber",label:"Uber"}, bolt:{cls:"bolt",label:BOLT_SVG+"Bolt"} };
const appBtn = k => { const a=APP[k]; return a?`<span class="appbtn ${a.cls}">${a.label}</span>`:""; };

function optionCard(r, n){
  const o=r.o;
  const meta=`<div class="meta"><b>${o.journey}</b> · ${o.freqLabel} · ${o.hours}</div>`;
  const tags=o.tags?`<div class="tags">${o.tags.map(t=>`<span class="tag">${t}</span>`).join("")}</div>`:"";
  const head=`<div class="top"><div class="rank">${n}</div><div class="mode">${modeIcon(o.mode)}</div><div class="route"><div class="to">${o.to}</div><div class="op">${o.op}</div></div><div class="price">${o.price}</div></div>${wayOf(o)}${meta}${tags}`;
  if(r.onDemand){
    const noapp=o.noapp?`<div class="noapp">${o.noapp}</div>`:"";
    const apps=o.apps?`<div class="alsoapps">Also on app: ${o.apps.map(appBtn).join("")}</div>`:"";
    return `<div class="card">${head}${noapp}${apps}
      <div class="dep"><div class="dep-l"><span class="lbl">Availability</span><div class="timerow"><span class="time">Now</span><span class="in soon">on demand</span></div></div><div class="dep-r"><div class="then">24 hours</div></div></div>
      ${o.note?`<div class="note">⚠ ${o.note}</div>`:""}</div>`;
  }
  const est=(o.est && !r.isLive)?"~":"";
  let inTxt,cls;
  if(r.closed){ inTxt="service closed now"; cls="closed"; }
  else if(r.until<=0){ inTxt="departing now"; cls="soon"; }
  else if(r.until<20){ inTxt="in "+r.until+" min"; cls="soon"; }
  else if(r.until<60){ inTxt="in "+r.until+" min"; cls="wait"; }
  else { inTxt="in "+Math.floor(r.until/60)+"h "+String(r.until%60).padStart(2,"0")+"m"; cls="wait"; }
  const badge=r.isLive?`<span class="live">LIVE <span class="dash"></span></span>`:"";
  return `<div class="card">${head}
    <div class="dep"><div class="dep-l"><span class="lbl">Departs${r.closed?" next":""}${badge}</span><div class="timerow"><span class="time ${r.closed?"closed":""}">${est}${fmt(r.dep1)}</span><span class="in ${cls}">${inTxt}</span></div></div>
      <div class="dep-r">${r.dep2!=null?`<div class="then">then ${est}${fmt(r.dep2)}</div>`:""}</div></div>${o.note?`<div class="note">⚠ ${o.note}</div>`:""}</div>`;
}

function connNext(c, nowMin){
  if(c.route && LIVE[c.route] && LIVE[c.route].deps && LIVE[c.route].deps.length){ const d=LIVE[c.route].deps; return {dep:d[0],until:Math.max(0,d[0]-nowMin),isLive:true,closed:false}; }
  const list=departures(c); if(!list.length) return null;
  let i=list.findIndex(t=>t>=nowMin), wrapped=false; if(i===-1){ i=0; wrapped=true; }
  const dep=list[i]; const until=wrapped?dep+1440-nowMin:dep-nowMin;
  return {dep, until, isLive:false, closed: wrapped && !(c.sched&&c.sched.kind==="windows")};
}

function destCard(o,e,r){
  const how=e.how?`<div class="how">↔ ${e.how}</div>`:"";
  const walk=o.walk?` · 🚶 ${o.walk}`:"";
  const meta=`<div class="meta"><b>${o.journey}</b> · ${o.price}${walk}</div>`;
  const note=e.note?`<div class="note-plain">${e.note}</div>`:"";
  let dep;
  if(r.onDemand){ dep=`<div class="dep"><div class="dep-l"><span class="lbl">Availability</span><div class="timerow"><span class="time">Now</span><span class="in soon">on demand</span></div></div><div class="dep-r"><div class="then">24h</div></div></div>`; }
  else { const est=(o.est&&!r.isLive)?"~":""; let inTxt,cls;
    if(r.closed){inTxt="service closed";cls="closed";}
    else if(r.until<=0){inTxt="now";cls="soon";}
    else if(r.until<20){inTxt="in "+r.until+" min";cls="soon";}
    else if(r.until<60){inTxt="in "+r.until+" min";cls="wait";}
    else {inTxt="in "+Math.floor(r.until/60)+"h "+String(r.until%60).padStart(2,"0")+"m";cls="wait";}
    const badge=r.isLive?`<span class="live">LIVE <span class="dash"></span></span>`:"";
    dep=`<div class="dep"><div class="dep-l"><span class="lbl">Departs${badge}</span><div class="timerow"><span class="time ${r.closed?'closed':''}">${est}${fmt(r.dep1)}</span><span class="in ${cls}">${inTxt}</span></div></div><div class="dep-r">${r.dep2!=null?`<div class="then">then ${est}${fmt(r.dep2)}</div>`:""}</div></div>`;
  }
  return `<div class="card${e.best?' best':''}">${e.best?'<div class="best-tag">★ Best</div>':''}
    <div class="top"><div class="mode">${modeIcon(o.mode)}</div><div class="route"><div class="to">${o.name}</div><div class="op">${e.to}</div></div><div class="price">${o.price}</div></div>
    ${how}${meta}${note}${dep}</div>`;
}
const DESTSEL={};
function renderDest(code){
  const ap=AIRPORTS[code]; if(!ap||!ap.destinations) return;
  const box=document.getElementById("destcards"); if(!box) return;
  if(!DESTSEL[code]) DESTSEL[code]=ap.destinations[0].id;
  const cur=ap.destinations.find(x=>x.id===DESTSEL[code])||ap.destinations[0];
  const d=new Date(), nowMin=d.getHours()*60+d.getMinutes();
  const chips=document.getElementById("chips");
  if(chips){ chips.innerHTML=ap.destinations.map(x=>`<button class="chip ${x.id===cur.id?'on':''}" data-id="${x.id}">${x.label}</button>`).join("");
    chips.querySelectorAll(".chip").forEach(b=>b.onclick=()=>{DESTSEL[code]=b.dataset.id;renderDest(code);}); }
  const dt=document.getElementById("desttitle"); if(dt) dt.textContent=cur.title;
  box.innerHTML=cur.routes.map(e=>{const o=ap.routes[e.k]; if(!o) return ""; return destCard(o,e,nextTwo(o,nowMin));}).join("");
}

function renderAirport(code){
  const ap=AIRPORTS[code]; if(!ap) return;
  const d=new Date(), nowMin=d.getHours()*60+d.getMinutes();
  const rows=ap.options.map(o=>({o, ...nextTwo(o, nowMin)}));
  rows.sort((a,b)=>a.until-b.until);
  document.getElementById("options").innerHTML=rows.map((r,i)=>optionCard(r,i+1)).join("");
  const cc=document.getElementById("conns");
  if(cc) cc.innerHTML=(ap.connections&&ap.connections.length)?`<div class="conns-h">Other connections from ${code}</div>`+ap.connections.map(c=>{
    const r=connNext(c,nowMin); let t="";
    if(r){ const est=(c.est&&!r.isLive)?"~":""; const rel=r.closed?("first "+fmt(r.dep)):(r.until<=0?"now":(r.until<60?("in "+r.until+"m"):("in "+Math.floor(r.until/60)+"h"+String(r.until%60).padStart(2,"0"))));
      t=`<div class="conn-t"><div class="ct ${r.isLive?'live':''}">${est}${fmt(r.dep)}</div><div class="cs">${r.isLive?'live · ':''}${rel}</div></div>`; }
    return `<div class="conn"><div class="conn-ic">${modeIcon(c.icon)}</div><div class="conn-b"><b>${c.to}</b><span>${c.sub}</span></div>${t}</div>`;
  }).join(""):"";
  const sub=document.getElementById("sub");
  if(sub){ const nn=ap.options.length; sub.innerHTML=`<b>${nn}</b> way${nn>1?"s":""} from <b>${ap.name}</b> · ${ap.city}`+(nn>1?` — soonest first`:``); }
}
async function loadLive(code){
  const ap=AIRPORTS[code]; if(!ap) return;
  const needs=ap.destinations||ap.options.some(o=>o.route)||(ap.connections&&ap.connections.some(c=>c.route)); if(!needs) return;
  try{ const r=await fetch("/api/airport",{cache:"no-store"}); if(!r.ok) return; const j=await r.json(); const d=new Date(),base=d.getHours()*60+d.getMinutes(); const routes=j.routes||{};
    for(const rc of ["2051","3028","5373","5675"]){ const mins=routes[rc]; if(Array.isArray(mins)&&mins.length) LIVE[rc]={deps:mins.map(m=>base+m),ts:Date.now()}; else delete LIVE[rc]; } }catch(e){}
  (ap.destinations?renderDest:renderAirport)(code);
}
function initAirport(code){ const ap=AIRPORTS[code]; const rf=(ap&&ap.destinations)?renderDest:renderAirport; rf(code); loadLive(code); setInterval(()=>rf(code),15000); setInterval(()=>loadLive(code),30000); }
function tickClock(){ const el=document.getElementById("clock"); if(!el) return; const d=new Date(); el.textContent="now "+String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0")+":"+String(d.getSeconds()).padStart(2,"0"); }
if (typeof document !== "undefined" && document.getElementById("clock")) { tickClock(); setInterval(tickClock,1000); }
