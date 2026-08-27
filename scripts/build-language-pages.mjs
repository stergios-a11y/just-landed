import { mkdir, readFile, writeFile } from "node:fs/promises";

const domain = "https://justlanded.gr";
const pages = [
  "athens.html", "thessaloniki.html", "heraklion.html", "chania.html", "santorini.html", "rhodes.html",
  "athens-airport-to-syntagma.html", "athens-airport-to-monastiraki.html",
  "athens-airport-to-acropolis.html", "athens-airport-to-piraeus.html",
  "athens-airport-to-rafina.html", "athens-airport-to-kifisos-bus-station.html"
];

const greek = {
  "athens.html": ["Αεροδρόμιο Αθηνών προς κέντρο — μετρό, λεωφορείο, τιμές & ζωντανές αναχωρήσεις", "Πώς θα πας από το αεροδρόμιο Αθηνών (ATH) στο κέντρο με δημόσιες συγκοινωνίες: Μετρό Γραμμή 3 (€9), 24ωρο λεωφορείο X95 (€5,50) και προαστιακό. Ζωντανές αναχωρήσεις, χωρίς προώθηση ταξί."],
  "thessaloniki.html": ["Αεροδρόμιο Θεσσαλονίκης προς πόλη — λεωφορείο, τιμές & αναχωρήσεις", "Πώς θα πας από το αεροδρόμιο Θεσσαλονίκης (SKG) στο κέντρο με λεωφορείο ΟΑΣΘ: τιμή, χρόνος διαδρομής, συχνότητα και αναχωρήσεις. Χωρίς προώθηση ταξί."],
  "heraklion.html": ["Αεροδρόμιο Ηρακλείου προς πόλη — λεωφορείο, τιμές & ζωντανές αναχωρήσεις", "Πώς θα πας από το αεροδρόμιο Ηρακλείου (HER) στο κέντρο και το λιμάνι με δημόσιο λεωφορείο: γραμμή, τιμή, χρόνος, συχνότητα και ζωντανές αναχωρήσεις. Χωρίς προώθηση ταξί."],
  "chania.html": ["Αεροδρόμιο Χανίων προς πόλη — λεωφορείο, τιμές & ζωντανές αναχωρήσεις", "Πώς θα πας από το αεροδρόμιο Χανίων (CHQ) στην πόλη με δημόσιο λεωφορείο ΚΤΕΛ: τιμή, χρόνος διαδρομής, δρομολόγια και ζωντανές αναχωρήσεις. Χωρίς προώθηση ταξί."],
  "santorini.html": ["Αεροδρόμιο Σαντορίνης προς Φηρά — λεωφορείο, τιμή & ζωντανές αναχωρήσεις", "Πώς θα πας από το αεροδρόμιο Σαντορίνης (JTR) στα Φηρά με δημόσιο λεωφορείο ΚΤΕΛ: τιμή, χρόνος διαδρομής, συχνότητα και ζωντανές αναχωρήσεις. Χωρίς προώθηση ταξί."],
  "rhodes.html": ["Αεροδρόμιο Ρόδου προς πόλη — λεωφορείο RODA, τιμές & αναχωρήσεις", "Πώς θα πας από το αεροδρόμιο Ρόδου (RHO) στην πόλη της Ρόδου με το λεωφορείο RODA: τιμή, χρόνος διαδρομής, συχνότητα και αναχωρήσεις. Χωρίς προώθηση ταξί."],
  "athens-airport-to-syntagma.html": ["Αεροδρόμιο Αθηνών προς Σύνταγμα — Μετρό, X95, προαστιακός & ζωντανές αναχωρήσεις | JUST LANDED", "Από το αεροδρόμιο Αθηνών (ATH) στο Σύνταγμα με Μετρό Γραμμή 3, λεωφορείο X95, προαστιακό ή ταξί. Σύγκρινε τιμές, αναχωρήσεις, οδηγίες πεζής πρόσβασης και την ταχύτερη επιλογή."],
  "athens-airport-to-monastiraki.html": ["Αεροδρόμιο Αθηνών προς Μοναστηράκι — Μετρό, X95 & ταξί | JUST LANDED", "Από το αεροδρόμιο Αθηνών (ATH) στο Μοναστηράκι με Μετρό Γραμμή 3, λεωφορείο X95 ή ταξί. Δες τιμές, αναχωρήσεις, οδηγίες πεζής πρόσβασης και την ταχύτερη επιλογή."],
  "athens-airport-to-acropolis.html": ["Αεροδρόμιο Αθηνών προς Ακρόπολη — διαδρομές Μετρό, τιμές & αναχωρήσεις | JUST LANDED", "Από το αεροδρόμιο Αθηνών (ATH) προς την Ακρόπολη με Μετρό Γραμμή 3 και άλλες επιλογές. Σύγκρινε τιμές, αναχωρήσεις, περπάτημα και την ταχύτερη διαδρομή."],
  "athens-airport-to-piraeus.html": ["Αεροδρόμιο Αθηνών προς λιμάνι Πειραιά — X96, Μετρό & ταξί | JUST LANDED", "Από το αεροδρόμιο Αθηνών (ATH) στο λιμάνι Πειραιά με λεωφορείο X96, Μετρό ή ταξί. Σύγκρινε τιμές, αναχωρήσεις, οδηγίες πεζής πρόσβασης και την ταχύτερη επιλογή για το πλοίο σου."],
  "athens-airport-to-rafina.html": ["Αεροδρόμιο Αθηνών προς λιμάνι Ραφήνας — λεωφορείο ΚΤΕΛ, τιμές & αναχωρήσεις | JUST LANDED", "Από το αεροδρόμιο Αθηνών (ATH) στο λιμάνι Ραφήνας με λεωφορείο ΚΤΕΛ ή ταξί. Σύγκρινε τιμές, αναχωρήσεις, οδηγίες πεζής πρόσβασης και την ταχύτερη επιλογή για το πλοίο σου."],
  "athens-airport-to-kifisos-bus-station.html": ["Αεροδρόμιο Αθηνών προς σταθμό Κηφισού — X93 & ταξί | JUST LANDED", "Από το αεροδρόμιο Αθηνών (ATH) στους σταθμούς Κηφισού και Λιοσίων με X93 ή ταξί. Σύγκρινε τιμές, αναχωρήσεις, οδηγίες πεζής πρόσβασης και την ταχύτερη επιλογή."]
};

const visibleGreek = {
  "athens-airport-to-syntagma.html": ["Αεροδρόμιο Αθηνών", "Σύνταγμα", "Δημόσιες συγκοινωνίες από το αεροδρόμιο Αθηνών (ATH) προς το Σύνταγμα — σύγκρινε τιμές, αναχωρήσεις, χρόνο περπατήματος και την ταχύτερη επιλογή."],
  "athens-airport-to-monastiraki.html": ["Αεροδρόμιο Αθηνών", "Μοναστηράκι", "Δημόσιες συγκοινωνίες από το αεροδρόμιο Αθηνών (ATH) προς το Μοναστηράκι — σύγκρινε τιμές, αναχωρήσεις, χρόνο περπατήματος και την ταχύτερη επιλογή."],
  "athens-airport-to-acropolis.html": ["Αεροδρόμιο Αθηνών", "Ακρόπολη", "Δημόσιες συγκοινωνίες από το αεροδρόμιο Αθηνών προς την Ακρόπολη — σύγκρινε διαδρομές Μετρό, τιμές, αναχωρήσεις και οδηγίες πεζής πρόσβασης."],
  "athens-airport-to-piraeus.html": ["Αεροδρόμιο Αθηνών", "Λιμάνι Πειραιά", "Δημόσιες συγκοινωνίες από το αεροδρόμιο Αθηνών (ATH) προς το λιμάνι Πειραιά — σύγκρινε X96, Μετρό και ταξί πριν από το πλοίο σου."],
  "athens-airport-to-rafina.html": ["Αεροδρόμιο Αθηνών", "Λιμάνι Ραφήνας", "Δημόσιες συγκοινωνίες από το αεροδρόμιο Αθηνών (ATH) προς το λιμάνι Ραφήνας — σύγκρινε λεωφορείο ΚΤΕΛ και ταξί πριν από το πλοίο σου."],
  "athens-airport-to-kifisos-bus-station.html": ["Αεροδρόμιο Αθηνών", "Σταθμοί Κηφισού / Λιοσίων", "Δημόσιες συγκοινωνίες από το αεροδρόμιο Αθηνών (ATH) προς τους σταθμούς Κηφισού / Λιοσίων — σύγκρινε X93 και ταξί."]
};

function seo(html, path, lang, title, description) {
  const alternate = lang === "el" ? `/en/${path}` : `/${path}`;
  const canonical = lang === "el" ? `/${path}` : `/en/${path}`;
  // Greek is the site's default language, so x-default always resolves there.
  const defaultUrl = `/${path}`;
  const tags = `<link rel="canonical" href="${domain}${canonical}">\n<link rel="alternate" hreflang="${lang}" href="${domain}${canonical}">\n<link rel="alternate" hreflang="${lang === "el" ? "en" : "el"}" href="${domain}${alternate}">\n<link rel="alternate" hreflang="x-default" href="${domain}${defaultUrl}">`;
  html = html.replace(/<link rel="canonical"[^>]*>\s*/g, "").replace(/<link rel="alternate"[^>]*>\s*/g, "");
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`);
  html = html.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${description}">`);
  return html.replace(/(<link rel="icon")/, `${tags}\n$1`);
}

function stripStrayAttr(html) {
  // Root-cause guard: remove orphan attribute-only lines such as
  //   href="/favicon-v16.svg">
  // left behind by malformed <link>/<img> tags. These render as visible
  // text in the page and were the cause of the favicon-v16 artifact.
  return html.replace(/^[ \t]*(?:href|src)=["'][^\n>]*>[ \t]*\r?\n/gm, "");
}

function common(html, path, lang) {
  const isEn = lang === "en";
  const enHref = `/en/${path}`;
  const elHref = `/${path}`;
  html = html.replace(/<html lang="(?:en|el)">/, `<html lang="${lang}">`);
  html = html.replace(/(href|src)="(?:\.\/)?(data\.js|style\.css|seo\.css|favicon-v16\.svg|just-landed-approved-logo\.png)"/g, (_, attr, file) => `${attr}="/${file}"`);
  html = html.replace(/href="index\.html"/g, `href="${isEn ? "/en/" : "/"}"`);
  html = html.replace(/<div class="lang-switch" id="lang-switch" aria-label="[^"]*">[\s\S]*?<\/div><div class="clock"/, `<div class="lang-switch" id="lang-switch" aria-label="${isEn ? "Language" : "Επιλογή γλώσσας"}"><a href="${enHref}" data-lang="en"${isEn ? " class=\"active\" aria-current=\"page\"" : ""}>EN</a><span aria-hidden="true">·</span><a href="${elHref}" data-lang="el"${isEn ? "" : " class=\"active\" aria-current=\"page\""}>ΕΛ</a></div><div class="clock"`);
  html = html.replace(/<button type="button" data-lang="en"([^>]*)>EN<\/button>/g, `<a href="${enHref}" data-lang="en"${isEn ? " class=\"active\" aria-current=\"page\"" : ""}>EN</a>`).replace(/<button type="button" data-lang="el"([^>]*)>ΕΛ<\/button>/g, `<a href="${elHref}" data-lang="el"${isEn ? "" : " class=\"active\" aria-current=\"page\""}>ΕΛ</a>`);
  html = html.replace(/\.lang-switch button/g, ".lang-switch a");
  html = html.replace(/(<img\b[^>]*?)\shref=/g, "$1 src=").replace(/(<link\b[^>]*?)\ssrc=/g, "$1 href=");
  // NOTE: the attribute-swap regex above is fragile; stripStrayAttr() below is a
  // safety net so a malformed tag can never ship as visible text again.
  return stripStrayAttr(html);
}

let englishHome = await readFile("index-backup.html", "utf8");
englishHome = common(englishHome, "", "en");
englishHome = seo(englishHome, "", "en", "Just Landed · Airport to city", "Just landed in Greece? Find the best ways to get to or from the airport — live departures, fares, journey times and walking directions.");
englishHome = englishHome.replace('href="/en/index.html"', 'href="/en/"').replace('href="/index.html"', 'href="/"');
englishHome = englishHome.replace('href="${ap.slug}.html"', 'href="/en/${ap.slug}.html"');
await writeFile("en/index.html", englishHome);

await mkdir("en", { recursive: true });
for (const path of pages) {
  let english;
  try { english = await readFile(`en/${path}`, "utf8"); } catch { english = await readFile(path, "utf8"); }
  english = common(english, path, "en");
  const enTitle = (english.match(/<title>([\s\S]*?)<\/title>/) || [])[1];
  const enDescription = (english.match(/<meta name="description" content="([^"]*)">/) || [])[1];
  await writeFile(`en/${path}`, seo(english, path, "en", enTitle, enDescription));

  let el = await readFile(path, "utf8");
  el = common(el, path, "el");
  const [title, description] = greek[path];
  el = seo(el, path, "el", title, description);
  el = el.replace(/<a class="backlink" id="backlink"[^>]*>.*?<\/a>/, `<a class="backlink" id="backlink" href="/">← όλα τα αεροδρόμια</a>`)
    .replace(/Public transport first — taxi facts too, no booking upsell\./g, "Πρώτα δημόσιες συγκοινωνίες — και πληροφορίες για ταξί, χωρίς προώθηση κρατήσεων.")
    .replace(/>Prototype</g, ">Πρωτότυπο<");
  if (path in greek && !visibleGreek[path]) {
    const [heading, intro] = {
      "athens.html": ["Αεροδρόμιο Αθηνών → κέντρο πόλης", "Δημόσιες συγκοινωνίες από το αεροδρόμιο Αθηνών (ATH) προς την πόλη — διάλεξε προορισμό. Ζωντανές ώρες όπου υπάρχουν."],
      "thessaloniki.html": ["Αεροδρόμιο Θεσσαλονίκης → πόλη", "Πώς θα πας από το αεροδρόμιο Θεσσαλονίκης (SKG) στο κέντρο με το δημόσιο λεωφορείο ΟΑΣΘ — τιμή, συχνότητα και αναχωρήσεις, χωρίς προώθηση ταξί."],
      "heraklion.html": ["Αεροδρόμιο Ηρακλείου → πόλη", "Οι απλοί τρόποι από το αεροδρόμιο Ηρακλείου (HER) προς το κέντρο και το λιμάνι — με δημόσιο λεωφορείο ΚΤΕΛ, ζωντανές αναχωρήσεις και χωρίς προώθηση ταξί."],
      "chania.html": ["Αεροδρόμιο Χανίων → πόλη", "Πώς θα πας από το αεροδρόμιο Χανίων (CHQ) στην πόλη με το δημόσιο λεωφορείο ΚΤΕΛ — τιμή, δρομολόγια και ζωντανές αναχωρήσεις, χωρίς προώθηση ταξί."],
      "santorini.html": ["Αεροδρόμιο Σαντορίνης → Φηρά", "Πώς θα πας από το αεροδρόμιο Σαντορίνης (JTR) στα Φηρά με το δημόσιο λεωφορείο — τιμή, συχνότητα και ζωντανές αναχωρήσεις, χωρίς προώθηση ταξί."],
      "rhodes.html": ["Αεροδρόμιο Ρόδου → πόλη", "Πώς θα πας από το αεροδρόμιο Ρόδου (RHO) στην πόλη με το δημόσιο λεωφορείο RODA — τιμή, χρόνος διαδρομής, δρομολόγια και αναχωρήσεις, χωρίς προώθηση ταξί."]
    }[path];
    el = el.replace(/<h1\b[^>]*>[\s\S]*?<\/h1>/, `<h1>${heading}</h1>`).replace(/<p class="intro"[^>]*>[\s\S]*?<\/p>/, `<p class="intro">${intro}</p>`);
  }
  if (visibleGreek[path]) {
    const [airport, destination, intro] = visibleGreek[path];
    el = el.replace(/<h1>[\s\S]*?<\/h1>/, `<h1>${airport} &#8594; <em id="desttitle">${destination}</em></h1>`);
    el = el.replace(/<p class="intro">[\s\S]*?<\/p>/, `<p class="intro">${intro}</p>`);
    el = el.replace(/Where are you headed\?/g, "Πού κατευθύνεσαι;").replace(/Athens destination guides/g, "Οδηγοί προορισμών Αθήνας");
  }
  el = el.replace(/(<div class="qh" data-i18n="whereHeaded">).*?(<\/div>)/, "$1Πού κατευθύνεσαι;$2")
    .replace(/aria-label="Athens destination guides"/g, 'aria-label="Οδηγοί προορισμών Αθήνας"')
    .replace(/Athens Airport to Syntagma/g, "Αεροδρόμιο Αθηνών προς Σύνταγμα")
    .replace(/Athens Airport to Monastiraki/g, "Αεροδρόμιο Αθηνών προς Μοναστηράκι")
    .replace(/Athens Airport to Acropolis/g, "Αεροδρόμιο Αθηνών προς Ακρόπολη")
    .replace(/Athens Airport to Piraeus(?: Port)?/g, "Αεροδρόμιο Αθηνών προς Πειραιά")
    .replace(/Athens Airport to Rafina(?: Port)?/g, "Αεροδρόμιο Αθηνών προς Ραφήνα")
    .replace(/Athens Airport to Kifisos Bus Station/g, "Αεροδρόμιο Αθηνών προς σταθμό Κηφισού")
    .replace(/Athens Airport → Syntagma/g, "Αεροδρόμιο Αθηνών → Σύνταγμα")
    .replace(/Athens Airport → Monastiraki/g, "Αεροδρόμιο Αθηνών → Μοναστηράκι")
    .replace(/Athens Airport → Acropolis/g, "Αεροδρόμιο Αθηνών → Ακρόπολη")
    .replace(/Athens Airport → Piraeus Port/g, "Αεροδρόμιο Αθηνών → Λιμάνι Πειραιά")
    .replace(/Athens Airport → Rafina Port/g, "Αεροδρόμιο Αθηνών → Λιμάνι Ραφήνας")
    .replace(/Athens Airport → Kifisos \/ Liosion Bus Stations/g, "Αεροδρόμιο Αθηνών → Σταθμοί Κηφισού / Λιοσίων");
  await writeFile(path, el);
}
