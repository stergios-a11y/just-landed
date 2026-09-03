const COPY={
  el:{
    title:"Από το αεροδρόμιο στην πόλη — Ελλάδα | Just Landed",
    description:"Πώς θα πας από το αεροδρόμιο στην πόλη σε Αθήνα, Θεσσαλονίκη, Κρήτη, Σαντορίνη και Ρόδο — ζωντανές αναχωρήσεις, τιμές, χρόνοι διαδρομής και οδηγίες με τα πόδια.",
    homeLabel:"Αρχική σελίδα Just Landed",logoAlt:"JUST LANDED — Από το αεροδρόμιο στην πόλη",languageLabel:"Επιλογή γλώσσας",
    eyebrow:"ΑΠΟ ΤΟ ΑΕΡΟΔΡΟΜΙΟ ΣΤΗΝ ΠΟΛΗ",heading:"ΠΟΥ ΠΡΟΣΓΕΙΩΘΗΚΕΣ;",hero:"Διάλεξε αεροδρόμιο για να δεις τους καλύτερους τρόπους να φτάσεις στην πόλη.",
    airports:"Αεροδρόμια",note:"Η επόμενη αναχώρηση εμφανίζεται για κάθε αεροδρόμιο. Η Αθήνα χρησιμοποιεί ζωντανά δεδομένα ΟΑΣΑ όταν είναι διαθέσιμα· τα υπόλοιπα αεροδρόμια χρησιμοποιούν το δημοσιευμένο πρόγραμμα ή εκτίμηση συχνότητας.",
    city:"Πόλη",next:"ΕΠΟΜΕΝΟ",live:"ΖΩΝΤΑΝΑ",estimate:"ΕΚΤ.",now:"ΤΩΡΑ",min:"ΛΕΠ",noService:"ΧΩΡΙΣ ΔΡΟΜΟΛΟΓΙΑ",landmark:"ορόσημο",transport:"ΜΕΤΑΚΙΝΗΣΗ",
    modes:{metro:"ΜΕΤΡΟ",bus:"ΛΕΩΦΟΡΕΙΟ",rail:"ΤΡΕΝΟ",ferry:"ΠΛΟΙΟ"},
    airportsByCode:{ATH:"Αθήνα",SKG:"Θεσσαλονίκη",HER:"Ηράκλειο",CHQ:"Χανιά",JTR:"Σαντορίνη",RHO:"Ρόδος"}
  },
  en:{
    title:"Airport to city — Greece | Just Landed",
    description:"How to get from the airport into town in Athens, Thessaloniki, Crete, Santorini and Rhodes — live departures, fares, journey times and walking directions.",
    homeLabel:"Just Landed home",logoAlt:"JUST LANDED — Airport to City",languageLabel:"Language",
    eyebrow:"FROM THE AIRPORT INTO TOWN",heading:"WHERE DID YOU LAND?",hero:"Choose your airport to see the best ways into town.",
    airports:"Airports",note:"NEXT DEPARTURE is shown for each airport. Athens uses live OASA data when available; other airports use the published schedule or frequency estimate.",
    city:"City",next:"NEXT",live:"LIVE",estimate:"EST",now:"NOW",min:"MIN",noService:"NO SERVICE",landmark:"landmark",transport:"TRANSPORT",
    modes:{metro:"METRO",bus:"BUS",rail:"RAIL",ferry:"FERRY"},
    airportsByCode:{ATH:"Athens",SKG:"Thessaloniki",HER:"Heraklion",CHQ:"Chania",JTR:"Santorini",RHO:"Rhodes"}
  }
};
const language=document.documentElement.lang==="en"?"en":"el";
function homepageText(){return COPY[language];}
function applyHomepageLanguage(){
  const t=homepageText();
  document.documentElement.lang=language;
  document.title=t.title;
  document.querySelector('meta[name="description"]').content=t.description;
  document.getElementById("home-link").setAttribute("aria-label",t.homeLabel);
  var hl=document.querySelector(".header-logo");if(hl)hl.setAttribute("aria-label",t.logoAlt);
  document.getElementById("lang-switch").setAttribute("aria-label",t.languageLabel);
  document.getElementById("eyebrow").textContent=t.eyebrow;
  document.getElementById("hero-heading").textContent=t.heading;
  document.getElementById("hero-description").textContent=t.hero;
  document.getElementById("airports").setAttribute("aria-label",t.airports);
  document.getElementById("homepage-note").textContent=t.note;
  render();
}
function renderClock(){
  document.getElementById("clock").textContent =
    new Intl.DateTimeFormat([], {hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false}).format(new Date());
}
function soonestAirport(code){
  const ap=AIRPORTS[code], now=new Date(); let best=null;
  for(const o of ap.options||[]){
    if(o.onDemand) continue;
    const r=nextTwo(o,now);
    if(r.closed&&!best) continue;
    if(!best||r.until<best.until) best={...r,o};
  }
  return best;
}
function transportIcon(mode){
  const icons={
    bus:'<rect x="3.5" y="4" width="17" height="12.5" rx="2.5"/><rect x="5.5" y="6" width="13" height="4.2" rx="1" fill="var(--bg)"/><circle cx="6.6" cy="13.2" r="1" fill="var(--bg)"/><circle cx="17.4" cy="13.2" r="1" fill="var(--bg)"/><circle cx="7.5" cy="18" r="1.8"/><circle cx="16.5" cy="18" r="1.8"/>',
    metro:'<path d="M6 10a6 6 0 0 1 12 0v8a1.4 1.4 0 0 1-1.4 1.4H7.4A1.4 1.4 0 0 1 6 18z"/><rect x="8" y="7.5" width="8" height="5" rx="1.6" fill="var(--bg)"/><circle cx="9" cy="15.8" r="1" fill="var(--bg)"/><circle cx="15" cy="15.8" r="1" fill="var(--bg)"/>',
    rail:'<path d="M7.5 9a4.5 4.5 0 0 1 9 0v6a1.2 1.2 0 0 1-1.2 1.2H8.7A1.2 1.2 0 0 1 7.5 15z"/><rect x="9.2" y="7" width="5.6" height="3.8" rx="1" fill="var(--bg)"/><circle cx="9.7" cy="13.3" r="0.85" fill="var(--bg)"/><circle cx="14.3" cy="13.3" r="0.85" fill="var(--bg)"/><path d="M9 16.5 6.8 21.5M15 16.5 17.2 21.5" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round"/><path d="M8 18.5h8M7.1 20.5h9.8" stroke="currentColor" stroke-width="1.3" fill="none" stroke-linecap="round"/>',
    ferry:'<path d="M3 15h18l-2 5H5z"/><path d="M6 15l2-9h8l2 9z"/><path d="M9 6h6V3H9z"/><path d="M2 22c2 1 4 1 6 0 2 1 4 1 6 0 2 1 4 1 6 0" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>'
  };
  return `<svg class="transport-icon" viewBox="0 0 24 24" aria-hidden="true">${icons[mode]||icons.bus}</svg>`;
}

function nextLabel(code){
  const r=soonestAirport(code);
  const t=homepageText();

  if(!r||r.closed) return `<span class="estimate">${transportIcon(r&&r.o&&r.o.mode)} ${t.noService}</span>`;

  const mins=Math.max(0,Math.round(r.until));
  const prefix=r.isLive?`<span class="live"><i class="live-dot"></i>${t.live}</span> · `:(r.o&&r.o.est?`<span class="estimate">${t.estimate} · </span>`:"");
  let when;
  if(mins<=0) when=t.now;
  else if(mins>60){
    const h=Math.floor(mins/60), m=mins%60;
    when=language==="el"
      ? `σε ${h}ώ${m?` ${m}λ`:""}`
      : `in ${h}h${m?` ${m}min`:""}`;
  } else {
    when=language==="el"?`σε ${mins} λεπτά`:`in ${mins} min`;
  }

  return `<span class="departure-inline">${transportIcon(r.o&&r.o.mode)} ${prefix}${when}</span>`;
}

function airportCard(code){
  const ap=AIRPORTS[code], t=homepageText(), name=t.airportsByCode[code]||ap.name.split(" (")[0];
  const landmarks={ATH:"athens-landmark.png",SKG:"thessaloniki-landmark.png",HER:"heraklion-landmark.png",CHQ:"chania-landmark.png",JTR:"santorini-landmark.png",RHO:"rhodes-landmark.png"};
  return `<a class="airport" href="/${ap.slug}.html" aria-label="${name} — ${code} → ${t.city}">
    <div class="landmark"><picture><source type="image/webp" srcset="/${landmarks[code].replace('.png','.webp')}?v=2"><img src="/${landmarks[code]}?v=2" alt="${name} ${t.landmark}" loading="eager" width="352" height="352"></picture></div>
    <div class="airport-name">${name}</div>
    <div class="airport-route">${code} → ${t.city}</div>
    <div class="airport-next" id="next-${code}">${nextLabel(code)}</div>
    <div class="airport-arrow">→</div>
  </a>`;
}
function render(){document.getElementById("airports").innerHTML=ORDER.map(airportCard).join("");}
async function boardLive(){
  try{
    const r=await fetch("/api/airport",{cache:"no-store"}); if(!r.ok)return;
    const j=await r.json(), d=new Date(), base=d.getHours()*60+d.getMinutes(), lines=j.lines||{};
    for(const k of LIVE_LINES){
      const mins=lines[k];
      if(Array.isArray(mins)&&mins.length)LIVE[k]={deps:mins.map(m=>base+m),ts:Date.now()};
      else delete LIVE[k];
    }
    render();
  }catch(e){}
}
applyHomepageLanguage();renderClock();
setInterval(()=>{renderClock();render()},15000);
boardLive();setInterval(boardLive,30000);
