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

  RHO: { slug:"rhodes", name:"Rhodes (RHO)", city:"Dodecanese", verified:true, title:"Rhodes Airport to Rhodes Town", board:"RODA bus · to Rhodes Town",
    options:[
      { mode:"bus", to:"Rhodes Town", op:"RODA bus · Airport → Rhodes", est:true, price:"€3", journey:"~30 min", freqLabel:"every ~30 min", hours:"05:45–23:45",
        walk:"~2 min walk", access:"Bus stop between the old and new terminals",
        sched:{kind:"range",first:"05:45",last:"23:45",every:30},
        note:"Direct RODA service to Rhodes Town. The airport bus stop is between the old and new terminals. Published timetables vary by season and day; check the current schedule before travelling." },
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
      metro:{mode:"metro",name:"Metro M3",price:"€9",journey:"~40 min",walk:"~6 min walk",
        journeyByDestination:{centre:40,mon:42,acro:52,pir:61}, accessShort:"Trains",
        sched:{kind:"range",first:"06:10",last:"23:34",every:36}, payment:"💳 Card accepted · tap at gate"},
      x95:{mode:"bus",name:"Bus X95",price:"€5.50",journey:"~60 min",walk:"~3 min walk",accessShort:"Exit 5",route:"2051",est:true,
        journeyBands:[{from:0,to:6,mins:40},{from:6,to:9.5,mins:65},{from:9.5,to:16,mins:55},{from:16,to:19.5,mins:70},{from:19.5,to:23,mins:50},{from:23,to:24,mins:40}],
        journeyByDestination:{centre:60,mon:68,acro:68},
        sched:{kind:"windows",windows:[{start:"06:00",end:"22:00",every:20},{start:"22:00",end:"06:00",every:60}]}, payment:"💳 Card accepted · tap onboard"},
      rail:{mode:"rail",name:"Suburban Rail",price:"€9",journey:"~50 min",walk:"~6 min walk",accessShort:"Trains",sched:{kind:"range",first:"06:09",last:"22:09",every:30}, payment:"💳 Ticket/card · tap at gate"},
      x96:{mode:"bus",name:"Bus X96",price:"€5.50",journey:"~90 min",walk:"~3 min walk",accessShort:"Exit 2–3",route:"3028",est:true,
        journeyBands:[{from:0,to:6,mins:60},{from:6,to:9.5,mins:105},{from:9.5,to:16,mins:90},{from:16,to:19.5,mins:110},{from:19.5,to:23,mins:85},{from:23,to:24,mins:60}],
        journeyByDestination:{pir:90},
        sched:{kind:"windows",windows:[{start:"05:30",end:"23:00",every:35},{start:"23:00",end:"05:30",every:70}]}, payment:"💳 Card accepted · tap onboard"},
      rafina:{mode:"bus",name:"KTEL Rafina",price:"€3",journey:"~40 min",walk:"~3 min walk",access:"Arrivals level, between Exits 2–3, outer lane opposite Sofitel",accessShort:"Exits 2–3",ll:"37.93728569247656,23.947505303800178",est:true,
        journeyBands:[{from:0,to:6,mins:30},{from:6,to:10,mins:45},{from:10,to:16,mins:40},{from:16,to:20,mins:50},{from:20,to:24,mins:35}],
        sched:{kind:"range",first:"05:00",last:"22:00",every:45}, payment:"💳 Card accepted · tap onboard"},
      x93:{mode:"bus",name:"Bus X93",price:"€5.50",journey:"~65 min",walk:"~3 min walk",accessShort:"Exit 2–3",route:"5675",est:true,
        journeyBands:[{from:0,to:6,mins:45},{from:6,to:9.5,mins:75},{from:9.5,to:16,mins:65},{from:16,to:19.5,mins:80},{from:19.5,to:23,mins:60},{from:23,to:24,mins:45}],
        journeyByDestination:{ktel:65},
        sched:{kind:"windows",windows:[{start:"05:30",end:"23:00",every:35},{start:"23:00",end:"05:30",every:70}]}, payment:"💳 Card accepted · tap onboard"},
      taxi:{mode:"taxi",name:"Taxi",price:"€40–55",fareDay:"€40",fareNight:"€55",nightStart:0,nightEnd:5,journey:"~40 min",walk:"~2 min walk",accessShort:"Exit 3",onDemand:true, payment:"💳 Card accepted", apps:["freenow","uber","bolt"]},
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
      { mode:"metro", to:"Syntagma / city centre", op:"Metro Line 3 (blue) · direct from airport", price:"€9", journey:"~40 min", freqLabel:"every 36 min", hours:"06:10–23:34",
        walk:"~6 min walk", access:"Up to Departures level, across the walkway — follow ‘Trains’", ll:"37.936916659098664,23.94463092649655",
        sched:{kind:"range",first:"06:32",last:"23:32",every:30}, payment:"💳 Card accepted · tap at gate", tags:["💳 Card accepted · tap at gate"], note:"€9 flat airport fare (not the standard €1.20 ticket). Airport trains run every 36 min, daily. Last airport departure is around 23:34." },
      { mode:"bus", to:"Syntagma", op:"Express bus X95 · runs 24 hours", route:"2051", price:"€5.50", journey:"~60 min", freqLabel:"every ~20 min · hourly overnight", hours:"24 hours",
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
const ORDER = ["ATH","SKG","HER","CHQ","JTR","RHO"];
const LIVE = {};

const ACCESS_TRANSLATIONS = {"Trains":"Τρένα","Exit 5":"Έξοδος 5","Exits 2–3":"Έξοδοι 2–3","Exit 2–3":"Έξοδοι 2–3","Exit 3":"Έξοδος 3"};
const I18N = {
  el: {
    "Greece · airport → city":"Ελλάδα · αεροδρόμιο → πόλη",
    "You made it.":"Έφτασες.", "Now get out.":"Τώρα φύγαμε.",
    "Find your airport.":"Βρες το αεροδρόμιό σου.",
    "Get the next useful option into town — with the fare, time and where to walk.":"Δες την επόμενη χρήσιμη επιλογή προς την πόλη — με τιμή, χρόνο και σημείο επιβίβασης.",
    "Where did you land?":"Πού προσγειώθηκες;", "LIVE WHERE AVAILABLE":"ΖΩΝΤΑΝΑ ΟΠΟΥ ΥΠΑΡΧΟΥΝ",
    "What happens next":"Τι ακολουθεί", "Pick an airport.":"Διάλεξε αεροδρόμιο.",
    "The airport page puts the fastest option first, then gives you alternatives, fares, journey times and the exact walk from arrivals.":"Η σελίδα του αεροδρομίου βάζει πρώτη τη γρηγορότερη επιλογή και μετά δείχνει εναλλακτικές, τιμές, χρόνους και ακριβή διαδρομή με τα πόδια από τις αφίξεις.",
    "Fastest option first. Then alternatives, fares, journey times and where to walk from arrivals.":"Πρώτα η γρηγορότερη επιλογή. Μετά εναλλακτικές, τιμές, χρόνοι και σημείο περπατήματος από τις αφίξεις.",
    "Data status":"Κατάσταση δεδομένων", "means an actual departure feed.":"σημαίνει πραγματική ροή αναχωρήσεων.",
    "Timetable and estimated times are labelled separately.":"Τα προγραμματισμένα και τα εκτιμώμενα δρομολόγια επισημαίνονται ξεχωριστά.",
    "PUBLIC TRANSPORT FIRST · TAXI FACTS TOO · NO BOOKING UPSELL":"ΠΡΩΤΑ ΔΗΜΟΣΙΑ ΣΥΓΚΟΙΝΩΝΙΑ · ΚΑΙ ΠΛΗΡΟΦΟΡΙΕΣ ΤΑΞΙ · ΧΩΡΙΣ ΠΡΟΩΘΗΣΗ ΚΡΑΤΗΣΗΣ",
    "Public transport first — taxi facts too, no booking upsell.":"Πρώτα δημόσια συγκοινωνία — και πληροφορίες ταξί, χωρίς προώθηση κράτησης.",
    "Prototype":"Πρωτότυπο", "all airports":"όλα τα αεροδρόμια", "Where are you headed?":"Πού κατευθύνεσαι;",
    "ASAP":"ΤΩΡΑ", "SET TIME":"ΟΡΙΣΕ ΩΡΑ", "WHEN?":"ΠΟΤΕ;",
    "See the next departures and fastest option from this time.":"Δες τις επόμενες αναχωρήσεις και τη γρηγορότερη επιλογή από αυτή την ώρα.",
    "Fixed start time — departures are calculated from the selected moment.":"Σταθερή ώρα έναρξης — οι αναχωρήσεις υπολογίζονται από την επιλεγμένη στιγμή.",
    "FASTEST":"ΓΡΗΓΟΡΟΤΕΡΟ", "LIVE":"ΖΩΝΤΑΝΑ", "Departs":"Αναχωρεί", "Availability":"Διαθεσιμότητα",
    "service closed now":"η υπηρεσία δεν λειτουργεί τώρα", "service closed":"η υπηρεσία δεν λειτουργεί", "departing now":"αναχωρεί τώρα", "now":"τώρα",
    "on demand":"κατόπιν ζήτησης", "Now":"Τώρα", "then":"μετά", "24 hours":"24 ώρες", "24h":"24ωρο",
    "No app needed — walk to the rank and take one.":"Δεν χρειάζεται εφαρμογή — πήγαινε στην πιάτσα και πάρε ένα.",
    "Also on app:":"Επίσης στην εφαρμογή:", "Apps available:":"Διαθέσιμες εφαρμογές:", "Card accepted · tap onboard":"Δέχεται κάρτα · ανέπαφα μέσα στο λεωφορείο", "Card accepted · tap at gate":"Δέχεται κάρτα · ανέπαφα στην πύλη", "Ticket/card · tap at gate":"Εισιτήριο/κάρτα · ανέπαφα στην πύλη", "TAXI · DOOR TO DOOR":"ΤΑΞΙ · ΠΟΡΤΑ-ΠΟΡΤΑ",
    "WALK TO DEPARTURE":"ΠΕΡΠΑΤΗΣΕ ΩΣ ΤΗΝ ΑΝΑΧΩΡΗΣΗ", "Departure point":"Σημείο αναχώρησης", "Airport arrivals":"Αφίξεις αεροδρομίου",
    "Follow airport signs to the departure point":"Ακολούθησε τις πινακίδες του αεροδρομίου προς το σημείο αναχώρησης",
    "OPEN WALKING DIRECTIONS ↗":"ΑΝΟΙΓΜΑ ΟΔΗΓΙΩΝ ΠΕΖΗ ↗", "Show walking directions":"Εμφάνιση οδηγιών πεζή", "Close":"Κλείσιμο", "DIRECTIONS":"ΟΔΗΓΙΕΣ", "VIEW TIMETABLE →":"ΠΡΟΓΡΑΜΜΑ →",
    "LIVE WHERE AVAILABLE":"ΖΩΝΤΑΝΑ ΟΠΟΥ ΥΠΑΡΧΟΥΝ", "NO SERVICE":"ΧΩΡΙΣ ΔΡΟΜΟΛΟΓΙΟ",
    "city centre":"κέντρο πόλης", "City centre":"Κέντρο πόλης", "Monastiráki":"Μοναστηράκι", "Monastiráki / Pláka":"Μοναστηράκι / Πλάκα",
    "Acropolis":"Ακρόπολη", "Piraeus port":"Λιμάνι Πειραιά", "Rafina port":"Λιμάνι Ραφήνας", "Coaches":"ΚΤΕΛ", "Mainland coaches (KTEL)":"ΚΤΕΛ προς ηπειρωτική Ελλάδα",
    "Syntagma / city centre":"Σύνταγμα / κέντρο πόλης", "Syntagma — direct":"Σύνταγμα — απευθείας", "Syntagma":"Σύνταγμα",
    "Monastiraki — direct (M3)":"Μοναστηράκι — απευθείας (Μ3)", "Acropoli station":"Σταθμός Ακρόπολη", "Piraeus port — direct":"Λιμάνι Πειραιά — απευθείας", "Rafina port — direct":"Λιμάνι Ραφήνας — απευθείας", "Kifisós / Liossíon — direct":"Κηφισός / Λιοσίων — απευθείας",
    "door to door":"πόρτα-πόρτα", "City centre (door to door)":"Κέντρο πόλης (πόρτα-πόρτα)", "Official flat fare":"Επίσημη σταθερή χρέωση",
    "Metro M3":"Μετρό Μ3", "Bus X95":"Λεωφορείο X95", "Suburban Rail":"Προαστιακός", "Bus X96":"Λεωφορείο X96", "KTEL Rafina":"ΚΤΕΛ Ραφήνας", "Bus X93":"Λεωφορείο X93", "Taxi":"Ταξί",
    "Metro Line 3 (blue) · direct from airport":"Γραμμή Μετρό 3 (μπλε) · απευθείας από το αεροδρόμιο", "Express bus X95 · runs 24 hours":"Express λεωφορείο X95 · 24ωρο", "Suburban Railway (Proastiakós)":"Προαστιακός Σιδηρόδρομος",
    "Arrivals level, outside Exit 5":"Επίπεδο αφίξεων, έξω από την Έξοδο 5", "Arrivals level, outside Exit 3 (taxi rank)":"Επίπεδο αφίξεων, έξω από την Έξοδο 3 (πιάτσα ταξί)",
    "Bus stop outside arrivals":"Στάση λεωφορείου έξω από τις αφίξεις", "Bus waiting area outside arrivals":"Χώρος αναμονής λεωφορείων έξω από τις αφίξεις", "Bus stop by the arrivals exit":"Στάση λεωφορείου δίπλα στην έξοδο αφίξεων",
    "Main doors → turn right, follow the road":"Κύριες πόρτες → στρίψε δεξιά και ακολούθησε τον δρόμο", "Up to Departures level, across the walkway — follow ‘Trains’":"Ανέβα στο επίπεδο Αναχωρήσεων, από τη γέφυρα — ακολούθησε τις πινακίδες «Trains»",
    "every ~10–15 min":"κάθε ~10–15 λεπτά", "sparse — ~8–10 buses/day":"αραιά — ~8–10 λεωφορεία/ημέρα", "hourly in summer · ~3h in winter":"ανά ώρα το καλοκαίρι · ~3 ώρες τον χειμώνα", "every ~25 min · 30 min overnight":"κάθε ~25 λεπτά · 30 λεπτά τη νύχτα", "every ~30 min":"περίπου κάθε 30 λεπτά", "roughly every 30 min":"περίπου κάθε 30 λεπτά", "every ~20 min · hourly overnight":"κάθε ~20 λεπτά · ανά ώρα τη νύχτα",
    "~5 min walk":"~5 λεπτά με τα πόδια", "~3 min walk":"~3 λεπτά με τα πόδια", "~2 min walk":"~2 λεπτά με τα πόδια", "~6 min walk":"~6 λεπτά με τα πόδια",
    "~20 min":"~20 λεπτά", "~30 min":"~30 λεπτά", "~40 min":"~40 λεπτά", "~45 min":"~45 λεπτά", "~50 min":"~50 λεπτά", "~40–50 min":"~40–50 λεπτά", "60–75 min":"60–75 λεπτά",
    "City bus · centre & port":"Αστικό λεωφορείο · κέντρο & λιμάνι", "KTEL bus · to town":"ΚΤΕΛ · προς πόλη", "KTEL bus · to Fira":"ΚΤΕΛ · προς Φηρά", "Bus 01X · to the centre":"Λεωφορείο 01Χ · προς κέντρο", "City bus · look for ‘ΗΡΑΚΛΕΙΟ / IRAKLIO’ on the front":"Αστικό λεωφορείο · αναζήτησε «ΗΡΑΚΛΕΙΟ / IRAKLIO» στην μπροστινή πλευρά", "KTEL Chania bus · buy from the driver":"ΚΤΕΛ Χανίων · αγορά εισιτηρίου από τον οδηγό", "KTEL bus · buy from the driver":"ΚΤΕΛ · αγορά εισιτηρίου από τον οδηγό", "OASTH bus 01X · 01N overnight":"ΟΑΣΘ λεωφορείο 01Χ · 01Ν νυχτερινό",
    "Heraklion centre & port (Bus Station A)":"Κέντρο Ηρακλείου & λιμάνι (Σταθμός Λεωφορείων Α)", "Chania town / KTEL station":"Πόλη Χανίων / σταθμός ΚΤΕΛ", "Fira (main town bus station)":"Φηρά (κεντρικός σταθμός λεωφορείων)", "City centre (Aristotelous · White Tower)":"Κέντρο πόλης (Αριστοτέλους · Λευκός Πύργος)",
    "Piraeus port":"Λιμάνι Πειραιά", "Rafina port":"Λιμάνι Ραφήνας", "Mainland coaches":"ΚΤΕΛ προς ηπειρωτική Ελλάδα", "South Athens":"Νότια Αθήνα",
    "X96 · €5.50 · Crete, Cyclades, Dodecanese":"X96 · €5,50 · Κρήτη, Κυκλάδες, Δωδεκάνησα", "KTEL · €3 · Andros, Tinos, Mykonos, Evia · Exits 2–3":"ΚΤΕΛ · €3 · Άνδρος, Τήνος, Μύκονος, Εύβοια · Έξοδοι 2–3", "X93 · €5.50 · Kifisós / Liossíon":"X93 · €5,50 · Κηφισός / Λιοσίων", "X97 · €5.50 · Elliniko / Dafni":"X97 · €5,50 · Ελληνικό / Δάφνη",
    "Ferries to Crete, Cyclades, Dodecanese":"Πλοία για Κρήτη, Κυκλάδες, Δωδεκάνησα", "Ferries to Andros, Tinos, Mykonos, Evia · from Exits 2–3":"Πλοία για Άνδρο, Τήνο, Μύκονο, Εύβοια · από τις Εξόδους 2–3", "KTEL coaches to the rest of Greece":"ΚΤΕΛ προς την υπόλοιπη Ελλάδα",
    "every ~30 min":"περίπου κάθε 30 λεπτά", "~6 min walk":"~6 λεπτά με τα πόδια", "~3 min walk":"~3 λεπτά με τα πόδια",
    "Tap contactless at the gate":"Πλήρωσε ανέπαφα στην πύλη", "Tap contactless onboard":"Πλήρωσε ανέπαφα στο λεωφορείο", "Card accepted":"Δέχεται κάρτα",
    "Fare & service hours verified Aug 2026.":"Οι τιμές και τα ωράρια υπηρεσίας έχουν επαληθευτεί τον Αύγ. 2026.",
    "Fares & service hours verified Aug 2026. Metro/rail show exact clock-face times; the X95 shows live arrivals from OASA when buses are running, otherwise the timetable. Always confirm at the stop.":"Οι τιμές και τα ωράρια υπηρεσίας έχουν επαληθευτεί τον Αύγ. 2026. Μετρό/τρένο δείχνουν προγραμματισμένες ώρες, ενώ το X95 δείχνει ζωντανές αφίξεις από τον ΟΑΣΑ όταν τα λεωφορεία λειτουργούν, αλλιώς το πρόγραμμα. Έλεγξε πάντα στη στάση.",
    "Sample data — fares and times are illustrative and not yet verified. Departure times are estimated from the listed frequency. Confirm at the stop.":"Ενδεικτικά δεδομένα — τιμές και ώρες δεν έχουν ακόμη επαληθευτεί. Οι αναχωρήσεις υπολογίζονται από τη δηλωμένη συχνότητα. Έλεγξε στη στάση.",
    "Cheapest and never closes, but slow in traffic. Buy at the booth or just tap your card on the bus. Live times when buses are running, otherwise the timetable.":"Η φθηνότερη επιλογή και λειτουργεί όλο το 24ωρο, αλλά καθυστερεί στην κίνηση. Αγόρασε εισιτήριο στο εκδοτήριο ή πλήρωσε ανέπαφα στο λεωφορείο. Ζωντανές ώρες όταν λειτουργούν τα λεωφορεία, αλλιώς το πρόγραμμα.",
    "Fewer trains than the metro — best if you're heading to the central rail station.":"Λιγότερα τρένα από το μετρό — καλύτερο αν κατευθύνεσαι στον κεντρικό σιδηροδρομικό σταθμό.",
    "Flat fare €40 daytime (05:00–24:00) · €55 night (00:00–05:00) to the city centre.":"Σταθερή χρέωση €40 την ημέρα (05:00–24:00) · €55 τη νύχτα (00:00–05:00) προς το κέντρο.",
    "€9 flat airport fare (not the standard €1.20 ticket). Return €16, valid 48h.":"€9 σταθερή τιμή αεροδρομίου (όχι το κανονικό εισιτήριο €1,20). Επιστροφή €16, ισχύει 48 ώρες.",
    "Irregular KTEL timetable (not flight-timed) — the next time shown is an estimate; check the posted schedule at the stop. €2.50 from the driver, cash.":"Ακανόνιστο πρόγραμμα ΚΤΕΛ (δεν είναι συνδεδεμένο με τις πτήσεις) — η επόμενη ώρα είναι εκτίμηση· έλεγξε το αναρτημένο πρόγραμμα στη στάση. €2,50 από τον οδηγό, μετρητά.",
    "Summer: about hourly. Winter: roughly every 3 hours — the time shown is an estimate, check the posted schedule. Overnight (00:00–05:00) barely runs; arrange backup for very early/late flights. All airport buses terminate at Fira bus station.":"Καλοκαίρι: περίπου ανά ώρα. Χειμώνας: περίπου κάθε 3 ώρες — η ώρα είναι εκτίμηση, έλεγξε το πρόγραμμα. Τη νύχτα (00:00–05:00) σχεδόν δεν εκτελείται· βρες εναλλακτική για πολύ πρωινές/βραδινές πτήσεις. Όλα τα λεωφορεία του αεροδρομίου τερματίζουν στον σταθμό Φηρών.",
    "€2 airport fare (not the standard €0.90 ticket). Buy at the arrivals machines or onboard — no change given. 01X also stops at the railway station & KTEL Makedonia.":"€2 τιμή αεροδρομίου (όχι το κανονικό εισιτήριο €0,90). Αγόρασε από τα μηχανήματα στις αφίξεις ή μέσα στο λεωφορείο — δεν δίνονται ρέστα. Το 01Χ σταματά επίσης στον σιδηροδρομικό σταθμό και στο ΚΤΕΛ Μακεδονία.",
    "€1.30 from the kiosk, €2.30 from the driver — cash. No service after midnight; validate on board.":"€1,30 από το περίπτερο, €2,30 από τον οδηγό — μετρητά. Δεν υπάρχει υπηρεσία μετά τα μεσάνυχτα· επικύρωσε το εισιτήριο μέσα στο λεωφορείο.",
    "M3 to <b>Syntagma</b> → change to the <b>red line (M2)</b>, 1 stop":"Μ3 έως <b>Σύνταγμα</b> → αλλαγή στην <b>κόκκινη γραμμή (Μ2)</b>, 1 στάση",
    "M3 <b>direct</b>, then walk up":"Μ3 <b>απευθείας</b>, μετά περπάτημα προς τα πάνω", "Syntagma, then ~8 min walk":"Σύνταγμα, μετά ~8 λεπτά με τα πόδια", "Monastiraki, then ~10 min walk":"Μοναστηράκι, μετά ~10 λεπτά με τα πόδια",
    "M3 to <b>Monastiraki</b> → change to the <b>green line (M1)</b>":"Μ3 έως <b>Μοναστηράκι</b> → αλλαγή στην <b>πράσινη γραμμή (Μ1)</b>",
    "next":"επόμενο", "first":"πρώτο", "live · ":"ζωντανά · ", "in ":"σε ", "m":"λ", "h":"ώ",
  }
};

I18N.el.airportName="Αεροδρόμιο Αθηνών"; I18N.el.cityCentre="κέντρο πόλης"; I18N.el.whereHeaded="Πού κατευθύνεσαι;"; I18N.el["Athens Airport"]="Αεροδρόμιο Αθηνών"; I18N.el["Athens (ATH)"]="Αθήνα (ATH)"; I18N.el["Heraklion (HER)"]="Ηράκλειο (HER)"; I18N.el["Chania (CHQ)"]="Χανιά (CHQ)"; I18N.el["Santorini (JTR)"]="Σαντορίνη (JTR)"; I18N.el["Thessaloniki (SKG)"]="Θεσσαλονίκη (SKG)"; I18N.el["Attica"]="Αττική"; I18N.el["Crete"]="Κρήτη"; I18N.el["Cyclades"]="Κυκλάδες"; I18N.el["Macedonia"]="Μακεδονία"; I18N.el["Dodecanese"]="Δωδεκάνησα"; I18N.el["Heraklion Airport to town"]="Αεροδρόμιο Ηρακλείου προς πόλη"; I18N.el["Chania Airport to town"]="Αεροδρόμιο Χανίων προς πόλη"; I18N.el["Santorini Airport to Fira"]="Αεροδρόμιο Σαντορίνης προς Φηρά"; I18N.el["Rhodes Airport to Rhodes Town"]="Αεροδρόμιο Ρόδου προς πόλη Ρόδου"; I18N.el["Thessaloniki Airport to the city centre"]="Αεροδρόμιο Θεσσαλονίκης προς κέντρο"; I18N.el["Athens Airport to the city centre"]="Αεροδρόμιο Αθηνών προς κέντρο";I18N.el.kicker="Ελλάδα · αεροδρόμιο → πόλη"; I18N.el.hero1="Έφτασες."; I18N.el.hero2="Τώρα φύγαμε."; I18N.el.findAirport="Βρες το αεροδρόμιό σου."; I18N.el.heroCopy="Δες την επόμενη χρήσιμη επιλογή προς την πόλη — με τιμή, χρόνο και σημείο επιβίβασης."; I18N.el.whereLanded="Πού προσγειώθηκες;"; I18N.el.liveWhere="ΖΩΝΤΑΝΑ ΟΠΟΥ ΥΠΑΡΧΟΥΝ"; I18N.el.whatNext="Τι ακολουθεί"; I18N.el.pickAirport="Διάλεξε αεροδρόμιο."; I18N.el.nextDesktop="Η σελίδα του αεροδρομίου βάζει πρώτη τη γρηγορότερη επιλογή και μετά δείχνει εναλλακτικές, τιμές, χρόνους και ακριβή διαδρομή με τα πόδια από τις αφίξεις."; I18N.el.nextMobile="Πρώτα η γρηγορότερη επιλογή. Μετά εναλλακτικές, τιμές, χρόνοι και σημείο περπατήματος από τις αφίξεις."; I18N.el.dataStatus="Κατάσταση δεδομένων"; I18N.el.liveMeans="σημαίνει πραγματική ροή αναχωρήσεων. Τα προγραμματισμένα και τα εκτιμώμενα δρομολόγια επισημαίνονται ξεχωριστά."; I18N.el.footer="ΠΡΩΤΑ ΔΗΜΟΣΙΑ ΣΥΓΚΟΙΝΩΝΙΑ · ΚΑΙ ΠΛΗΡΟΦΟΡΙΕΣ ΤΑΞΙ · ΧΩΡΙΣ ΠΡΟΩΘΗΣΗ ΚΡΑΤΗΣΗΣ";
I18N.el["Trains"]="Τρένα";I18N.el["Exit 5"]="Έξοδος 5";I18N.el["Exit 2–3"]="Έξοδοι 2–3";I18N.el["Exits 2–3"]="Έξοδοι 2–3";I18N.el["Exit 3"]="Έξοδος 3";I18N.el["Athens Central (Larissa)"]="Σταθμός Λαρίσης";I18N.el["Athens Central (Larissa Station)"]="Σταθμός Λαρίσης";I18N.el["Rhodes (RHO)"]="Ρόδος (RHO)";I18N.el["Rhodes Town"]="πόλη της Ρόδου";I18N.el["RODA bus · to Rhodes Town"]="Λεωφορείο RODA · προς πόλη Ρόδου";I18N.el["RODA bus · Airport → Rhodes"]="Λεωφορείο RODA · Αεροδρόμιο → Ρόδος";I18N.el["frequent · see timetable"]="συχνά · δες το πρόγραμμα";I18N.el["Bus stop between the old and new terminals"]="Στάση λεωφορείου ανάμεσα στο παλιό και το νέο τερματικό";I18N.el["Direct RODA service to Rhodes Town. The airport bus stop is between the old and new terminals. Published timetables vary by season and day; check the current schedule before travelling."]="Απευθείας δρομολόγιο RODA προς την πόλη της Ρόδου. Η στάση βρίσκεται ανάμεσα στο παλιό και το νέο τερματικό. Τα δημοσιευμένα δρομολόγια αλλάζουν ανά εποχή και ημέρα· έλεγξε το τρέχον πρόγραμμα πριν ταξιδέψεις.";
// Language is determined by the indexable page URL, never by browser state.
let JL_LANG = document.documentElement.lang === "el" ? "el" : "en";
function tr(v){
  if(JL_LANG!=="el" || v==null) return v;
  const s=String(v);
  if(I18N.el[s]) return I18N.el[s];
  const _em=s.match(/^([^\p{L}\p{N}]+\s*)(\p{L}[\s\S]*)$/u);
  if(_em && I18N.el[_em[2]]) return _em[1]+I18N.el[_em[2]];
  if(/^~?\d+(?:\.\d+)? min walk$/.test(s)) return s.replace(/(\d+(?:\.\d+)?)/,"$1") .replace(" min walk"," λεπτά με τα πόδια").replace("~","~");
  if(/^~?\d+(?:\.\d+)?\s*min$/.test(s)) return s.replace("min","λεπτά");
  if(/^every ~/.test(s) && / min/.test(s)) return s.replace(/ min/g," λεπτά");
  if(/^in \d+ min$/.test(s)) return s.replace("in ","σε ").replace(" min"," λεπτά");
  if(/^IN \d+M$/.test(s)) return s.replace("IN ","ΣΕ ").replace("M","Λ");
  if(/^IN \d+H$/.test(s)) return s.replace("IN ","ΣΕ ").replace("H","ΩΡ");
  return s;
}
function trHtml(v){ return tr(v); }
function selectedLangLabel(){ return JL_LANG==="el" ? "ΕΛ" : "EN"; }
const DISC_I18N={ATH:"Οι τιμές και τα ωράρια υπηρεσίας έχουν επαληθευτεί τον Αύγ. 2026. Μετρό/τρένο δείχνουν προγραμματισμένες ώρες, ενώ το X95 δείχνει ζωντανές αφίξεις από τον ΟΑΣΑ όταν τα λεωφορεία λειτουργούν, αλλιώς το πρόγραμμα. Έλεγξε πάντα στη στάση.",CHQ:"Οι τιμές και τα ωράρια υπηρεσίας έχουν επαληθευτεί τον Αύγ. 2026. Τα δρομολόγια ΚΤΕΛ εμφανίζονται με βάση το διαθέσιμο πρόγραμμα. Έλεγξε πάντα στη στάση.",HER:"Οι τιμές και τα ωράρια υπηρεσίας έχουν επαληθευτεί τον Αύγ. 2026. Οι ώρες βασίζονται στο διαθέσιμο πρόγραμμα και τη συχνότητα. Έλεγξε πάντα στη στάση.",JTR:"Οι τιμές και τα ωράρια υπηρεσίας έχουν επαληθευτεί τον Αύγ. 2026. Τα δρομολόγια είναι εποχικά και ορισμένες ώρες είναι εκτιμήσεις. Έλεγξε πάντα στη στάση.",SKG:"Οι τιμές και τα ωράρια υπηρεσίας έχουν επαληθευτεί τον Αύγ. 2026. Οι ώρες βασίζονται στο διαθέσιμο πρόγραμμα. Έλεγξε πάντα στη στάση.",RHO:"Οι τιμές και τα ωράρια υπηρεσίας έχουν επαληθευτεί τον Αύγ. 2026. Το λεωφορείο RODA εκτελεί απευθείας δρομολόγια προς την πόλη της Ρόδου· τα δημοσιευμένα ωράρια αλλάζουν ανά εποχή. Έλεγξε πάντα στη στάση."};
function applyLanguage(){
  document.documentElement.lang=JL_LANG;
  document.querySelectorAll(".lang-switch a").forEach(b=>b.classList.toggle("active",b.dataset.lang===JL_LANG));
  document.querySelectorAll("[data-i18n]").forEach(el=>{ const key=el.dataset.i18n; el.textContent=JL_LANG==="el"?(I18N.el[key]||el.dataset.i18nOriginal||el.textContent):(el.dataset.i18nOriginal||el.textContent); });
  const back=document.getElementById("backlink"); if(back) back.innerHTML=JL_LANG==="el"?"← όλα τα αεροδρόμια":"← all airports";
  const proto=document.querySelector('[data-i18n="prototype"]'); if(proto) proto.textContent=JL_LANG==="el"?"Πρωτότυπο":"Prototype";
  document.querySelectorAll("[data-page-title]").forEach(el=>{el.textContent=JL_LANG==="el"?el.dataset.pageTitleEl:el.dataset.pageTitleEn;});
  document.querySelectorAll("[data-page-intro]").forEach(el=>{el.textContent=JL_LANG==="el"?el.dataset.pageIntroEl:el.dataset.pageIntroEn;});
  if(typeof CODE!=="undefined" && CODE==="ATH"){ const h=document.querySelector("h1"); const i=document.querySelector(".intro"); const cur=(typeof DESTSEL!=="undefined"&&DESTSEL[CODE])?AIRPORTS[CODE].destinations.find(x=>x.id===DESTSEL[CODE]):AIRPORTS[CODE].destinations[0]; if(h) h.innerHTML=JL_LANG==="el"?"Αεροδρόμιο Αθηνών → <em id=\"desttitle\">"+tr(cur.title)+"</em>":"Athens Airport → <em id=\"desttitle\">"+cur.title+"</em>"; if(i) i.textContent=JL_LANG==="el"?"Δημόσιες συγκοινωνίες από το αεροδρόμιο Αθηνών (ATH) προς την πόλη — διάλεξε προορισμό. Ζωντανές ώρες όπου υπάρχουν.":"Public transport from Athens Airport (ATH) into town — pick where you’re headed. Live times where the buses are running."; }
  const disc=document.getElementById("disc"); if(disc && typeof CODE!=="undefined"){ if(JL_LANG==="el" && DISC_I18N[CODE]) disc.textContent=DISC_I18N[CODE]; else if(disc.dataset.en) disc.textContent=disc.dataset.en; }
  updateTimePicker();
}
function bindLanguage(){
  applyLanguage();
}
if(typeof document!=="undefined") { if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",bindLanguage); else bindLanguage(); }


/* transport mode icons — monochrome wayfinding glyphs */
const MODES = {
  ferry:'<path d="M20 21c-1.39 0-2.78-.47-4-1.32-2.44 1.71-5.56 1.71-8 0-1.22.85-2.61 1.32-4 1.32H2v2h2c1.38 0 2.74-.35 4-.99 2.52 1.29 5.48 1.29 8 0 1.26.65 2.62.99 4 .99h2v-2h-2zM3.95 19H4c1.6 0 3.02-.88 4-2 .98 1.12 2.4 2 4 2s3.02-.88 4-2c.98 1.12 2.4 2 4 2h.05l1.89-6.68c.08-.26.06-.54-.06-.78s-.34-.42-.6-.5L20 10.62V6c0-1.1-.9-2-2-2h-3V1H9v3H6c-1.1 0-2 .9-2 2v4.62l-1.29.42c-.26.08-.48.26-.6.5s-.15.52-.06.78L3.95 19zM6 6h12v3.97L12 8 6 9.97V6z"/>',
  metro:'<path d="M12 2c-4.42 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h12v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-3.58-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zM11 10H6V7h5v3zm2 0V7h5v3h-5zm3.5 7c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>',
  bus:'<path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4S4 2.5 4 6v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM18 11H6V6h12v5z"/>',
  rail:'<path d="M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h12v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-3.58-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zM11 10H6V6h5v4zm2 0V6h5v4h-5zm3.5 7c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>',
  taxi:'<path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H15V3H9v2H6.5c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>'
};
let VIEW_TIME_MODE="now";
let VIEW_TIME_CUSTOM=null;
let SLIDER_BASE_TIME=null;
function getViewTime(){
  if(VIEW_TIME_MODE==="now") return new Date();
  return VIEW_TIME_CUSTOM ? new Date(VIEW_TIME_CUSTOM) : new Date();
}
function setViewTime(d, mode="custom"){
  VIEW_TIME_MODE=mode;
  VIEW_TIME_CUSTOM=mode==="custom" ? new Date(d) : null;
  if(mode==="now") SLIDER_BASE_TIME=new Date();
  else if(!SLIDER_BASE_TIME || Math.abs(new Date(d)-SLIDER_BASE_TIME)>6*60*60*1000) SLIDER_BASE_TIME=new Date(d);
  updateTimePicker();
  const code=typeof CODE!=="undefined"?CODE:null;
  if(code){
    const ap=AIRPORTS[code];
    (ap&&ap.destinations?renderDest:renderAirport)(code);
  }
}
function ensureTimePicker(){
  if(document.getElementById("time-slider")) return;
  const intro=document.querySelector(".intro");
  if(!intro) return;
  intro.insertAdjacentHTML("afterend",`
    <section class="time-panel" aria-label="Choose departure time">
      <div class="time-panel-head"><span class="time-kicker" id="time-kicker">WHEN ARE YOU LEAVING?</span><strong id="when-label">NOW</strong></div>
      <div class="time-actions">
        <button type="button" class="time-btn on" id="time-now">NOW</button>
        <button type="button" class="time-btn" id="time-plus10">+10 MIN</button>
        <button type="button" class="time-btn" id="time-plus20">+20 MIN</button>
      </div>
      <button type="button" class="later-toggle" id="time-later" aria-expanded="false">Pick a time <span class="chev">▾</span></button>
      <div class="later-panel" id="later-panel" hidden>
        <div class="time-slider-wrap">
          <div class="time-slider-top"><span id="time-slider-day">NOW</span><b id="time-slider-value">NOW</b></div>
          <input id="time-slider" class="time-slider" type="range" min="0" max="6" step="1" value="0" aria-label="Move departure time in 15 minute steps">
          <div class="time-slider-labels" id="time-slider-labels"></div>
          <button type="button" class="tomorrow-btn" id="time-tomorrow">Next day <span>→</span></button>
        </div>
        <div class="time-help" id="time-help">Move the slider to see how the fastest option changes.</div>
      </div>
    </section>`);
  document.getElementById("time-now").onclick=()=>{ SLIDER_BASE_TIME=new Date(); setViewTime(new Date(),"now"); };
  document.getElementById("time-plus10").onclick=()=>{ const d=new Date(Date.now()+10*60000); SLIDER_BASE_TIME=new Date(d); setViewTime(d,"custom"); };
  document.getElementById("time-plus20").onclick=()=>{ const d=new Date(Date.now()+20*60000); SLIDER_BASE_TIME=new Date(d); setViewTime(d,"custom"); };
  document.getElementById("time-later").onclick=function(){ const panel=document.getElementById("later-panel"); panel.hidden=!panel.hidden; this.classList.toggle("open", !panel.hidden); this.setAttribute("aria-expanded", String(!panel.hidden)); updateTimePicker(); };
  document.getElementById("time-tomorrow").onclick=()=>{ const d=getViewTime(); d.setDate(d.getDate()+1); SLIDER_BASE_TIME=new Date(d); setViewTime(d,"custom"); };
  document.getElementById("time-slider").addEventListener("input",e=>{
    const base=SLIDER_BASE_TIME?new Date(SLIDER_BASE_TIME):new Date();
    const d=new Date(base); d.setMinutes(d.getMinutes()+Number(e.target.value)*15);
    setViewTime(d,"custom");
  });
  updateTimePicker();
}
function updateTimePicker(){
  const nowBtn=document.getElementById("time-now"), plus10=document.getElementById("time-plus10"), plus20=document.getElementById("time-plus20"), label=document.getElementById("when-label");
  if(!nowBtn||!label) return;
  const d=getViewTime();
  const selected=selectedLabel(d);
  const now=new Date();
  const isToday=d.toDateString()===now.toDateString();
  const minutesFromNow=Math.round((d-now)/60000);
  label.textContent=VIEW_TIME_MODE==="now"?(JL_LANG==="el"?"ΤΩΡΑ":"NOW"):selected;
  nowBtn.classList.toggle("on",VIEW_TIME_MODE==="now");
  plus10.classList.toggle("on",VIEW_TIME_MODE==="custom" && Math.abs(minutesFromNow-10)<=1);
  plus20.classList.toggle("on",VIEW_TIME_MODE==="custom" && Math.abs(minutesFromNow-20)<=1);
  nowBtn.textContent=JL_LANG==="el"?"ΤΩΡΑ":"NOW";
  plus10.textContent=JL_LANG==="el"?"+10 ΛΕΠ":"+10 MIN";
  plus20.textContent=JL_LANG==="el"?"+20 ΛΕΠ":"+20 MIN";
  const later=document.getElementById("time-later"); if(later){ const lp=document.getElementById("later-panel"); const op=lp&&!lp.hidden; later.firstChild.textContent=op?(JL_LANG==="el"?"Απόκρυψη ":"Hide time picker "):(JL_LANG==="el"?"Διάλεξε ώρα ":"Pick a time "); }
  const slider=document.getElementById("time-slider"), sliderDay=document.getElementById("time-slider-day"), sliderValue=document.getElementById("time-slider-value"), labels=document.getElementById("time-slider-labels");
  if(slider&&sliderDay&&sliderValue&&labels){
    const base=SLIDER_BASE_TIME?new Date(SLIDER_BASE_TIME):new Date();
    const minutesFromBase=Math.round((d-base)/60000);
    const idx=Math.max(0,Math.min(12,Math.round(minutesFromBase/15)));
    slider.max="12";
    slider.value=String(idx);
    slider.disabled=false;
    const times=Array.from({length:13},(_,i)=>{const x=new Date(base);x.setMinutes(x.getMinutes()+i*15);return x;});
    labels.innerHTML=times.filter((_,i)=>i%2===0).map((x,i)=>{const real=i*2; return `<span class="${Math.abs(real-idx)<=1?'active':''}">${fmt(x.getHours()*60+x.getMinutes())}</span>`;}).join("");
    const sameDay=d.toDateString()===new Date().toDateString();
    sliderDay.textContent=sameDay?(JL_LANG==="el"?"ΣΗΜΕΡΑ":"TODAY"):(JL_LANG==="el"?"ΑΥΡΙΟ":"TOMORROW");
    sliderValue.textContent=VIEW_TIME_MODE==="now"?(JL_LANG==="el"?"ΤΩΡΑ":"NOW"):fmt(d.getHours()*60+d.getMinutes());
  }
  const tomorrow=document.getElementById("time-tomorrow");
  if(tomorrow) tomorrow.innerHTML=JL_LANG==="el"?"Επόμενη μέρα <span>→</span>":"Next day <span>→</span>";
  const kicker=document.getElementById("time-kicker"); if(kicker) kicker.textContent=JL_LANG==="el"?"ΠΟΤΕ ΦΕΥΓΕΙΣ;":"WHEN ARE YOU LEAVING?";
  const help=document.getElementById("time-help"); if(help) help.textContent=VIEW_TIME_MODE==="custom"?(JL_LANG==="el"?"Μετακίνησε τη μπάρα για να δεις πώς αλλάζει η γρηγορότερη επιλογή.":"Move the slider to see how the fastest option changes."):(JL_LANG==="el"?"Οι χρόνοι υπολογίζονται από τώρα. Μετακίνησε τη μπάρα για να δεις πώς αλλάζει η γρηγορότερη επιλογή.":"Times are calculated from now. Move the slider to see how the fastest option changes.");
}

const STEP_SVG={
  walk:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9 7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7z"/></svg>',
  clock:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm.5-13H11v6l5.2 3.1.8-1.3-4.5-2.7z"/></svg>'
};
function stepIcon(kind,mode){ if(kind==="walk") return STEP_SVG.walk; if(kind==="wait") return STEP_SVG.clock; return `<svg viewBox="0 0 24 24" fill="currentColor">${MODES[mode]||MODES.bus}</svg>`; }
function modeIcon(m){ return `<svg class="micon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${MODES[m]||""}</svg>`; }

const toMin = t => { const [h,m]=t.split(":").map(Number); return h*60+m; };
const fmt = m => { m=((m%1440)+1440)%1440; const h=Math.floor(m/60),mm=m%60; return String(h).padStart(2,"0")+":"+String(mm).padStart(2,"0"); };
const pad2 = n => String(n).padStart(2,"0");
function localDateInputValue(d){ return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`; }
function dateOnly(d, delta=0){ const x=new Date(d); x.setHours(12,0,0,0); x.setDate(x.getDate()+delta); return x; }
function serviceAvailable(o, date){
  if(!o || !o.serviceRule) return true;
  return o.serviceRule(date);
}
function scheduleDates(o, baseDate){
  const s=o.sched; if(!s) return [];
  const out=[];
  for(let day=-1;day<=2;day++){
    const base=dateOnly(baseDate,day);
    if(s.kind==="range"){
      let a=toMin(s.first), b=toMin(s.last); if(b<a)b+=1440;
      for(let t=a;t<=b;t+=s.every){ const d=new Date(base); d.setHours(0,0,0,0); d.setMinutes(t); out.push(d); }
    } else if(s.kind==="windows"){
      for(const w of s.windows){
        let a=toMin(w.start), b=toMin(w.end); if(b<=a)b+=1440;
        for(let t=a;t<b;t+=w.every){ const d=new Date(base); d.setHours(0,0,0,0); d.setMinutes(t); out.push(d); }
      }
    }
  }
  const filtered=out.filter(d=>serviceAvailable(o,d));
  return filtered.sort((a,b)=>a-b);
}
function nextTwo(o, atDate){
  if(o.onDemand) return {onDemand:true, until:0, selected:atDate};
  if(!(atDate instanceof Date)) atDate=new Date();
  const useLive=Math.abs(atDate.getTime()-Date.now()) < 90000;
  if(useLive && o.route && LIVE[o.route] && LIVE[o.route].deps && LIVE[o.route].deps.length){
    const nowMin=atDate.getHours()*60+atDate.getMinutes();
    const d=LIVE[o.route].deps;
    return {dep1:d[0],dep2:d.length>1?d[1]:d[0],until:Math.max(0,d[0]-nowMin),closed:false,isLive:true,selected:atDate};
  }
  const list=scheduleDates(o,atDate), target=atDate.getTime();
  const next=list.find(d=>d.getTime()>=target);
  if(!next) return {dep1:null,dep2:null,until:99999,closed:true,isLive:false,selected:atDate};
  const following=list.find(d=>d.getTime()>next.getTime());
  const until=Math.max(0,Math.round((next-target)/60000));
  return {dep1:next.getHours()*60+next.getMinutes(),dep2:following?following.getHours()*60+following.getMinutes():null,until,closed:false,isLive:false,selected:atDate,depDate:next};
}
function selectedLabel(d){
  const now=new Date();
  if(Math.abs(d.getTime()-now.getTime())<90000) return JL_LANG==="el"?"ΤΩΡΑ":"ASAP";
  const today=new Date(); today.setHours(0,0,0,0);
  const day=new Date(d); day.setHours(0,0,0,0);
  const diff=Math.round((day-today)/86400000);
  const dayLabel=JL_LANG==="el" ? (diff===0?"ΣΗΜΕΡΑ":diff===1?"ΑΥΡΙΟ":new Intl.DateTimeFormat("el-GR", {weekday:"short",day:"numeric",month:"short"}).format(d).toUpperCase()) : (diff===0?"TODAY":diff===1?"TOMORROW":new Intl.DateTimeFormat([], {weekday:"short",day:"numeric",month:"short"}).format(d).toUpperCase());
  return `${dayLabel} · ${fmt(d.getHours()*60+d.getMinutes())}`;
}
function tripWaitText(r){
  if(r.onDemand) return "on demand";
  if(r.until<=0) return "departing now";
  if(r.until<60) return `wait ${r.until} min`;
  return `wait ${Math.floor(r.until/60)}h ${pad2(r.until%60)}m`;
}

function wayOf(o){
  if(!o.access && !o.walk) return "";
  const w=o.walk
    ? `<button class="walk walk-btn" type="button" onclick="showWalk(this)" data-walk="${encodeURIComponent(o.walk||"")}" data-access="${encodeURIComponent(o.access||"")}" data-ll="${encodeURIComponent(o.ll||"")}" data-to="${encodeURIComponent(o.to||"")}" aria-label="${JL_LANG==="el"?"Εμφάνιση οδηγιών πεζή":"Show walking directions"}">${"🚶 "+tr(o.walk)} <span class="walk-action">${JL_LANG==="el"?"ΟΔΗΓΙΕΣ":"DIRECTIONS"} →</span></button>`
    : "";
  const sep=(o.walk && o.access)?" ":"";
  let loc="";
  if(o.access){ loc=`<span class="access">${tr(o.access)}</span>`; }
  return `<div class="way">${w}${sep}${loc}</div>`;
}

function ensureWalkModal(){
  if(document.getElementById("walk-modal")) return;
  document.body.insertAdjacentHTML("beforeend",`
    <div class="walk-modal" id="walk-modal" hidden>
      <div class="walk-backdrop" data-close-walk></div>
      <section class="walk-sheet" role="dialog" aria-modal="true" aria-labelledby="walk-title">
        <button class="walk-close" type="button" data-close-walk aria-label="${JL_LANG==="el"?"Κλείσιμο":"Close"}">×</button>
        <div class="walk-kicker">${tr("WALK TO DEPARTURE")}</div>
        <h2 id="walk-title">${tr("Departure point")}</h2>
        <div class="walk-route">
          <div class="walk-point"><span class="walk-dot start"></span><div><b id="walk-start">${JL_LANG==="el"?"Αφίξεις αεροδρομίου":"Airport arrivals"}</b><small id="walk-start-detail"></small></div></div>
          <div class="walk-line"></div>
          <div class="walk-point"><span class="walk-dot end"></span><div><b id="walk-end">${tr("Departure point")}</b><small id="walk-time"></small></div></div>
        </div>
        <a class="walk-map" id="walk-map" href="#" target="_blank" rel="noopener">OPEN WALKING DIRECTIONS ↗</a>
      </section>
    </div>`);
  document.querySelectorAll("[data-close-walk]").forEach(el=>el.addEventListener("click",closeWalk));
}
function showWalk(btn){
  ensureWalkModal();
  const m=document.getElementById("walk-modal");
  const walk=decodeURIComponent(btn.dataset.walk||"");
  const access=decodeURIComponent(btn.dataset.access||"");
  const ll=decodeURIComponent(btn.dataset.ll||"");
  const to=decodeURIComponent(btn.dataset.to||"Departure point");
  const ap=(typeof AIRPORTS!=="undefined" && window.location.pathname.includes("/")) ? AIRPORTS[document.body.dataset.airport||""] : null;
  const airportName=(typeof CODE!=="undefined" && AIRPORTS[CODE]) ? AIRPORTS[CODE].name : "Airport";
  document.getElementById("walk-title").textContent=tr(to);
  document.getElementById("walk-start").textContent=tr(airportName)+" "+(JL_LANG==="el"?"αφίξεις":"arrivals");
  document.getElementById("walk-start-detail").textContent=tr(access||"Follow airport signs to the departure point");
  document.getElementById("walk-end").textContent=tr(to);
  document.getElementById("walk-time").textContent=walk;
  const origin=encodeURIComponent(airportName+" arrivals");
  const dest=ll?encodeURIComponent(ll):encodeURIComponent(to);
  document.getElementById("walk-map").textContent=JL_LANG==="el"?"ΑΝΟΙΓΜΑ ΟΔΗΓΙΩΝ ΠΕΖΗ ↗":"OPEN WALKING DIRECTIONS ↗";
  document.getElementById("walk-map").href=`https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=walking`;
  m.hidden=false;
  document.body.classList.add("walk-open");
}
function closeWalk(){
  const m=document.getElementById("walk-modal");
  if(m){m.hidden=true;document.body.classList.remove("walk-open");}
}
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeWalk();});
const BOLT_SVG='<svg width="11" height="11" viewBox="0 0 24 24" fill="var(--white)"><path d="M13 2L4 14h6l-1 8 9-12h-6z"/></svg>';
const APP={ freenow:{cls:"freenow",label:"FREE NOW"}, uber:{cls:"uber",label:"Uber"}, bolt:{cls:"bolt",label:BOLT_SVG+"Bolt"} };
const appBtn = k => { const a=APP[k]; return a?`<span class="appbtn ${a.cls}">${a.label}</span>`:""; };


function upcomingDepartures(o, atDate, count=4){
  if(o.onDemand) return {dates:[], isLive:false};
  if(!(atDate instanceof Date)) atDate=new Date();
  const useLive=Math.abs(atDate.getTime()-Date.now()) < 90000;
  if(useLive && o.route && LIVE[o.route]?.deps?.length){
    const base=new Date(atDate); base.setHours(0,0,0,0);
    const dates=LIVE[o.route].deps.map(m=>{
      const d=new Date(base); d.setMinutes(m); return d;
    }).filter(d=>d>=atDate).slice(0,count);
    if(dates.length) return {dates,isLive:true};
  }
  const dates=scheduleDates(o,atDate).filter(d=>d>=atDate).slice(0,count);
  return {dates,isLive:false};
}
function waitLabel(from, to){
  const mins=Math.max(0,Math.round((to-from)/60000));
  if(mins<=0) return JL_LANG==="el" ? "τώρα" : "now";
  if(mins<60) return JL_LANG==="el" ? `σε ${mins} λ.` : `in ${mins} min`;
  return JL_LANG==="el" ? `σε ${Math.floor(mins/60)}ω ${String(mins%60).padStart(2,"0")}λ` : `in ${Math.floor(mins/60)}h ${String(mins%60).padStart(2,"0")}m`;
}
function departureClockDate(d){
  return fmt(d.getHours()*60+d.getMinutes());
}
function futureDepartureStrip(o, atDate){
  const r=upcomingDepartures(o,atDate,4);
  const rest=r.dates.slice(1,4);
  if(!rest.length) return "";
  const times=rest.map(d=>departureClockDate(d)).join("&nbsp; · &nbsp;");
  const lbl=JL_LANG==="el"?"ΕΠΟΜΕΝΑ":"NEXT";
  const live=r.isLive?`<span class="next-live">${JL_LANG==="el"?"ΖΩΝΤΑΝΑ":"LIVE"}</span>`:"";
  return `<div class="next-line"><span class="lbl">${lbl}</span><b>${times}</b>${live}</div>`;
}

function optionCard(r, n){
  const fastest=!!r.fastest;
  const o=r.o;
  const meta=`<div class="meta"><b>${tr(effectiveJourney(o, r.selected))}</b> · ${tr(o.freqLabel)} · ${tr(o.hours)}${o.journeyBands?` · ${JL_LANG==="el"?"εκτίμηση κίνησης":"traffic-adjusted estimate"}`:""}</div>`;
  const tags=o.tags?`<div class="tags">${o.tags.map(t=>`<span class="tag">${tr(t)}</span>`).join("")}</div>`:"";
  const head=`<div class="top"><div class="rank">${n}</div><div class="mode">${modeIcon(o.mode)}</div><div class="route"><div class="to">${tr(o.to)}</div><div class="op">${tr(o.op)}</div></div><div class="price">${o.price||""}</div></div>${wayOf(o)}${meta}${tags}`;
  if(r.onDemand){
    const noapp=o.noapp?`<div class="noapp">${tr(o.noapp)}</div>`:"";
    const apps=o.apps?`<div class="alsoapps">${tr("Also on app:")} ${o.apps.map(appBtn).join("")}</div>`:"";
    return `<div class="card${fastest?' best':''}${o.mode==="taxi"?' taxi-card':''}">${fastest?`<div class="best-tag">★ ${tr("FASTEST")}</div>`:''}${head}${noapp}${apps}
      <div class="dep"><div class="dep-l"><span class="lbl">${tr("Availability")}</span><div class="timerow"><span class="time">${tr("Now")}</span><span class="in soon">${tr("on demand")}</span></div></div><div class="dep-r"><div class="then">${tr("24 hours")}</div></div></div>
      ${o.note?`<div class="note">⚠ ${tr(o.note)}</div>`:""}</div>`;
  }
  const est=(o.est && !r.isLive)?"~":"";
  let inTxt,cls;
  if(r.closed){ inTxt=tr("service closed now"); cls="closed"; }
  else if(r.until<=0){ inTxt=tr("departing now"); cls="soon"; }
  else if(r.until<20){ inTxt=JL_LANG==="el"?`σε ${r.until} λεπτά`:`in ${r.until} min`; cls="soon"; }
  else if(r.until<60){ inTxt=JL_LANG==="el"?`σε ${r.until} λεπτά`:`in ${r.until} min`; cls="wait"; }
  else { inTxt=JL_LANG==="el"?`σε ${Math.floor(r.until/60)}ω ${String(r.until%60).padStart(2,"0")}λ`:`in ${Math.floor(r.until/60)}h ${String(r.until%60).padStart(2,"0")}m`; cls="wait"; }
  const badge=r.isLive?`<span class="live">${JL_LANG==="el"?"ΖΩΝΤΑΝΑ":"LIVE"} <span class="dash"></span></span>`:"";
  return `<div class="card${fastest?' best':''}${o.mode==="taxi"?' taxi-card':''}">${fastest?`<div class="best-tag">★ ${tr("FASTEST")}</div>`:''}${head}
    <div class="dep"><div class="dep-l"><span class="lbl">${tr("Departs")}${r.closed?" "+tr("next"):""}${badge}</span><div class="timerow"><span class="time ${r.closed?"closed":""}">${est}${fmt(r.dep1)}</span><span class="in ${cls}">${inTxt}</span></div></div>
      </div></div>${o.note?`<div class="note">⚠ ${tr(o.note)}</div>`:""}${futureDepartureStrip(o, r.selected)}</div>`;
}

function connNext(c, atDate){
  const r=nextTwo(c,atDate); if(r.dep1==null) return null; return {dep:r.dep1, until:r.until, isLive:r.isLive, closed:r.closed};
}

function arrivalBreakdown(o,r,destinationId){
  const walk=walkMinutes(o.walk);
  const ride=durationMinutes(effectiveJourney(o,r.selected,destinationId));
  const wait=Math.max(0,Number(r.until)||0);
  return {walk,wait,ride,total:walk+wait+ride};
}
function arrivalClock(o,r,destinationId){
  if(r.closed || r.dep1==null) return null;
  const d=r.selected instanceof Date ? new Date(r.selected) : new Date();
  const dep=new Date(d);
  dep.setHours(0,0,0,0);
  dep.setMinutes(Number(r.dep1));
  if(dep < d && Number(r.until)>0) dep.setDate(dep.getDate()+1);
  const ride=durationMinutes(effectiveJourney(o,r.selected,destinationId));
  dep.setMinutes(dep.getMinutes()+ride);
  return dep;
}
function arrivalLabel(o,r,destinationId){
  const d=arrivalClock(o,r,destinationId);
  if(!d) return r.closed ? (JL_LANG==='el'?'Κλειστό':'Closed') : '—';
  return fmt(d.getHours()*60+d.getMinutes());
}
function breakdownHtml(o,r,destinationId){
  const b=arrivalBreakdown(o,r,destinationId);
  const labels=JL_LANG==='el'?['περπάτημα','αναμονή','διαδρομή']:['walk','wait','ride'];
  const walkAction=JL_LANG==='el'?'ΟΔΗΓΙΕΣ':'DIRECTIONS';
  const shortAccess=o.accessShort ? tr(o.accessShort) : "";
  const walkMeta=[labels[0],shortAccess,walkAction].filter(Boolean).join(" · ");
  const walkStep=`<button class="journey-step journey-walk-btn" type="button" onclick="showWalk(this)" data-walk="${encodeURIComponent(o.walk||'')}" data-access="${encodeURIComponent(o.access||'')}" data-ll="${encodeURIComponent(o.ll||'')}" data-to="${encodeURIComponent(o.name||'Departure point')}" aria-label="${JL_LANG==='el'?'Εμφάνιση οδηγιών πεζή':'Show walking directions'}"><span class="step-icon">${stepIcon("walk")}</span><b>${b.walk} ${JL_LANG==="el"?"λεπτά":"min"}</b><small>${walkMeta} →</small></button>`;
  return `<div class="journey-breakdown">
    ${walkStep}
    <span class="journey-arrow">›</span>
    <div class="journey-step"><span class="step-icon">${stepIcon("wait")}</span><b>${b.wait} ${JL_LANG==="el"?"λεπτά":"min"}</b><small>${labels[1]}</small></div>
    <span class="journey-arrow">›</span>
    <div class="journey-step"><span class="step-icon">${stepIcon("ride",o.mode)}</span><b>${b.ride} ${JL_LANG==="el"?"λεπτά":"min"}</b><small>${labels[2]}</small></div>
  </div>`;
}
function taxiArrivalHtml(o,r){
  const journey=durationMinutes(effectiveJourney(o,r.selected));
  const low=Math.max(1,journey);
  const high=Math.max(low,Math.round(low*1.6));
  const price=o.price||'';
  return `<div class="taxi-summary"><div><div class="arrival-label">${JL_LANG==='el'?'ΑΦΙΞΗ':'ARRIVAL'}</div><div class="arrival-time">${fmt((new Date()).getHours()*60+(new Date()).getMinutes()+low)} – ${fmt((new Date()).getHours()*60+(new Date()).getMinutes()+high)} <span>~${low}–${high} ${JL_LANG==="el"?"λεπτά συνολικά":"min total"}</span></div><div class="arrival-sub">${JL_LANG==='el'?'Πόρτα-πόρτα':'Door-to-door'}</div></div><div class="taxi-price">${price}</div></div>`;
}
function taxiNow(o,d){
  const dt=d instanceof Date ? d : new Date();
  const h=dt.getHours();
  const ns=(o.nightStart!=null)?o.nightStart:0, ne=(o.nightEnd!=null)?o.nightEnd:5;
  const night = ns<ne ? (h>=ns && h<ne) : (h>=ns || h<ne);
  return {fare: night?o.fareNight:o.fareDay, night};
}
function optMatch(o){ return (typeof AIRPORTS!=="undefined" && AIRPORTS[CODE] && AIRPORTS[CODE].options) ? AIRPORTS[CODE].options.find(x=>x.mode===o.mode && (x.route===o.route || (!x.route&&!o.route))) : null; }
function walkLink(o){
  if(!o.walk) return "";
  const T=(el,en)=>JL_LANG==="el"?el:en;
  const airportName=(typeof AIRPORTS!=="undefined" && AIRPORTS[CODE])?AIRPORTS[CODE].name:"Airport";
  const origin=encodeURIComponent(airportName+" arrivals");
  const dest=o.ll?encodeURIComponent(o.ll):encodeURIComponent(o.to||o.name||"");
  const href=`https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=walking`;
  const access=o.access?`<small>${tr(o.access)}</small>`:"";
  return `<a class="walk" href="${href}" target="_blank" rel="noopener"><span class="wic">${STEP_SVG.walk}</span><span class="wtx"><b>${tr(o.walk)}</b>${access}</span><span class="go">${T("ΟΔΗΓΙΕΣ","DIRECTIONS")} ↗</span></a>`;
}
function optionBody(o,e,r,opts={}){
  const dm=optMatch(o);
  o={...o, walk:o.walk||dm?.walk, access:o.access||dm?.access, ll:o.ll||dm?.ll, payment:o.payment||dm?.payment, apps:o.apps||dm?.apps};
  const T=(el,en)=>JL_LANG==="el"?el:en;
  const minW=T("λεπτά","min");
  const note=e.note?`<div class="note-plain">${tr(e.note)}</div>`:"";
  if(r.onDemand || o.mode==="taxi"){
    let taxiInfo="";
    if(o.fareDay){
      const tn=taxiNow(o,r.selected);
      const fareLbl=tn.night?T("νυχτερινή χρέωση","night fare"):T("ημερήσια χρέωση","day fare");
      taxiInfo=`<div class="taxi-fare"><div class="tf-now">${T("Τώρα","Now")}: <b>${tn.fare}</b> <span>${fareLbl}</span></div><div class="tf-all">${o.fareDay} ${T("ημέρα","day")} 05:00–24:00 · ${o.fareNight} ${T("νύχτα","night")} 00:00–05:00</div></div>`;
    }
    const apps=o.apps?`<div class="alsoapps"><span>${tr("Apps available:")}</span> ${o.apps.map(appBtn).join("")}</div>`:"";
    const avail=`<div class="avail">${T("Διαθέσιμο","Available")} <b>${T("τώρα","now")}</b> · ${T("κατόπιν ζήτησης","on demand")}</div>`;
    return `${avail}${taxiInfo}${apps}${note}`;
  }
  const est=(o.est&&!r.isLive)?"~":"";
  let inTxt,cls;
  if(r.closed){inTxt=T("δεν λειτουργεί τώρα","service closed");cls="closed";}
  else if(r.until<=0){inTxt=T("τώρα","now");cls="soon";}
  else if(r.until<60){inTxt=T(`σε ${r.until} λεπτά`,`in ${r.until} min`);cls=r.until<20?"soon":"wait";}
  else {inTxt=T(`σε ${Math.floor(r.until/60)}ω ${String(r.until%60).padStart(2,"0")}λ`,`in ${Math.floor(r.until/60)}h ${String(r.until%60).padStart(2,"0")}m`);cls="wait";}
  const badge=r.isLive?`<span class="live">${T("ΖΩΝΤΑΝΑ","LIVE")} <span class="dash"></span></span>`:"";
  const leave=`<div class="leave"><span class="clock ${r.closed?'closed':''}">${est}${fmt(r.dep1)}</span><span class="in ${cls}">${inTxt}</span>${badge}</div>`;
  const bd=arrivalBreakdown(o,r,e.destinationId);
  const arrD=arrivalClock(o,r,e.destinationId);
  const destName=tr(e.to).replace(/\s+[—–-]\s+(direct|απευθείας)\s*$/i,"");
  let arriveLine="";
  if(arrD){
    let cmp="";
    if(opts.laterThan>0) cmp=` · <span class="later">${T(`${opts.laterThan} λεπτά αργότερα`,`${opts.laterThan} min later`)}</span>`;
    const destIn=o.name?destName+" ":"";
    arriveLine=`<div class="arrive">${T("Άφιξη","Arrive")} <b>${destIn}${fmt(arrD.getHours()*60+arrD.getMinutes())}</b> · ${bd.total} ${minW}${cmp}</div>`;
  }
  const wl=walkLink(o);
  const payment=o.payment?tr(o.payment):"";
  const rideLine=`<div class="ride">${T("Μετά","Then a")} <b>${bd.ride} ${minW}</b> ${T("διαδρομή","ride")}.${payment?` ${payment}`:""}</div>`;
  const next=futureDepartureStrip(o,r.selected);
  return `${leave}${arriveLine}${wl}${rideLine}${next}${note}`;
}

function destCard(o,e,r,opts={}){
  const isFastest=!!opts.fastest, isCheapest=!!opts.cheapest;
  const T=(el,en)=>JL_LANG==="el"?el:en;
  let label="";
  if(isFastest){ label=T("Γρηγορότερο","Fastest"); if(isCheapest) label+=" · "+T("Φθηνότερο","Cheapest"); }
  else if(isCheapest){
    const bits=[T("Φθηνότερο","Cheapest")];
    if(opts.saves) bits.push(T(`€${opts.saves} λιγότερα`,`€${opts.saves} less`));
    if(opts.laterThan>0) bits.push(T(`${opts.laterThan}′ αργότερα`,`${opts.laterThan} min later`));
    label=bits.join(" · ");
  }
  const plabel=label?`<div class="plabel">${label}</div>`:"";
  const isTaxi=o.mode==="taxi"||r.onDemand;
  const destName=tr(e.to).replace(/\s+[—–-]\s+(direct|απευθείας)\s*$/i,"");
  const svc=o.name?tr(o.name):null;
  const nameHtml=isTaxi?(svc||destName):(svc?`${svc} <span class="arw">→</span> ${destName}`:destName);
  const opHtml=(!svc && o.op)?`<div class="op">${tr(o.op)}</div>`:"";
  return `<div class="card b-card${(isFastest||opts.solo)?' fast':''}${isTaxi?' taxi':''}">${plabel}<div class="headline"><div class="mi">${modeIcon(o.mode)}</div><div class="hmain"><h2>${nameHtml}</h2>${opHtml}</div><div class="fare">${o.price||""}</div></div>${optionBody(o,e,r,opts)}</div>`;
}
const DESTSEL={};
function priceNum(p){ if(p==null) return null; const m=String(p).replace(",",".").match(/\d+(?:\.\d+)?/); return m?parseFloat(m[0]):null; }
let ALT_OPEN=false;
const ALT_ROWS_OPEN=new Set();
function altRow(row){
  const o=row.o, e=row.e, r=row.r;
  const T=(el,en)=>JL_LANG==="el"?el:en;
  const destName=tr(e.to).replace(/\s+[—–-]\s+(direct|απευθείας)\s*$/i,"");
  const isTaxi=o.mode==="taxi"||r.onDemand;
  const svc=o.name?tr(o.name):null;
  const nameHtml=isTaxi?(svc||destName):(svc?`${svc} <span class="arw">→</span> ${destName}`:destName);
  let summary;
  if(isTaxi){ summary=o.fareDay?`${T("κατόπιν ζήτησης","on demand")} · ${o.fareDay}/${o.fareNight}`:(o.price||""); }
  else if(r.closed){ summary=T("δεν λειτουργεί τώρα","not running now"); }
  else { const arrD=arrivalClock(o,r,e.destinationId); const est=(o.est&&!r.isLive)?"~":""; const arr=arrD?` · ${T("άφιξη","arrive")} ~${fmt(arrD.getHours()*60+arrD.getMinutes())}`:""; summary=`${T("φεύγει","leaves")} ${est}${fmt(r.dep1)}${arr}`; }
  const open=ALT_ROWS_OPEN.has(o.name);
  return `<div class="alt-item${open?' open':''}"><button class="alt-row" type="button" data-alt="${encodeURIComponent(o.name||"")}" aria-expanded="${open}"><div class="mi">${modeIcon(o.mode)}</div><div class="an"><b>${nameHtml}</b><span>${summary}</span></div><div class="ap">${o.price||""}</div><span class="alt-chev">▾</span></button><div class="alt-detail"${open?"":" hidden"}>${optionBody(o,e,r)}</div></div>`;
}
function altSection(rest){
  if(!rest||!rest.length) return "";
  const lbl=JL_LANG==="el"?"Άλλοι τρόποι":"Other ways";
  return `<button class="alt-toggle${ALT_OPEN?' open':''}" id="alt-toggle" type="button" aria-expanded="${ALT_OPEN}"><span>${lbl} · ${rest.length}</span><span class="chev">▾</span></button><div class="alt-list" id="alt-list"${ALT_OPEN?"":" hidden"}>${rest.map(altRow).join("")}</div>`;
}
function wireAltToggle(){
  const t=document.getElementById("alt-toggle");
  if(t) t.onclick=function(){ ALT_OPEN=!ALT_OPEN; const l=document.getElementById("alt-list"); if(l) l.hidden=!ALT_OPEN; this.classList.toggle("open",ALT_OPEN); this.setAttribute("aria-expanded",String(ALT_OPEN)); };
  document.querySelectorAll(".alt-row").forEach(function(btn){
    btn.onclick=function(){
      const name=decodeURIComponent(this.dataset.alt||"");
      const item=this.closest(".alt-item"); if(!item) return;
      const det=item.querySelector(".alt-detail");
      const open=!item.classList.contains("open");
      item.classList.toggle("open",open); if(det) det.hidden=!open; this.setAttribute("aria-expanded",String(open));
      if(open) ALT_ROWS_OPEN.add(name); else ALT_ROWS_OPEN.delete(name);
    };
  });
}
function renderDest(code){
  const ap=AIRPORTS[code]; if(!ap||!ap.destinations) return;
  const box=document.getElementById("destcards"); if(!box) return;
  if(!DESTSEL[code]) DESTSEL[code]=ap.destinations[0].id;
  const cur=ap.destinations.find(x=>x.id===DESTSEL[code])||ap.destinations[0];
  const at=getViewTime();
  const chips=document.getElementById("chips");
  if(chips){ chips.innerHTML=ap.destinations.map(x=>`<button class="chip ${x.id===cur.id?'on':''}" data-id="${x.id}">${tr(x.label)}</button>`).join("");
    chips.querySelectorAll(".chip").forEach(b=>b.onclick=()=>{DESTSEL[code]=b.dataset.id;renderDest(code);}); }
  const dt=document.getElementById("desttitle"); if(dt) dt.textContent=tr(cur.title);
  const routeRows=cur.routes.map(e=>{const o=ap.routes[e.k]; if(!o) return null; e={...e,destinationId:cur.id}; const r=nextTwo(o,at); r.total=totalTripMinutes(o,r,cur.id); return {e,o,r};}).filter(Boolean);
  const ranked=routeRows.sort((a,b)=>{
    const at=a.o.mode==="taxi", bt=b.o.mode==="taxi";
    if(at!==bt) return at?1:-1;
    return a.r.total-b.r.total;
  });
  const fastest=ranked.find(row=>row.o.mode!=="taxi" && Number.isFinite(row.r.total));
  const lead=fastest||ranked[0];
  if(!lead){ box.innerHTML=""; return; }
  const payable=ranked.filter(row=>row.o.mode!=="taxi" && Number.isFinite(row.r.total) && priceNum(row.o.price)!=null);
  const cheapest=payable.slice().sort((a,b)=>(priceNum(a.o.price)-priceNum(b.o.price))||(a.r.total-b.r.total))[0];
  const CHEAP_MAX_GAP=30;
  const showCheap=fastest && cheapest && cheapest!==fastest && (cheapest.r.total-fastest.r.total)<CHEAP_MAX_GAP;
  const leads=showCheap?[fastest,cheapest]:[lead];
  const rest=ranked.filter(row=>!leads.includes(row));
  const fArr=fastest?arrivalClock(fastest.o,fastest.r,cur.id):null;
  box.innerHTML=leads.map(row=>{
    const opts={fastest:row===fastest,cheapest:row===cheapest};
    if(row===cheapest && row!==fastest){
      const pf=priceNum(fastest.o.price), pc=priceNum(row.o.price);
      if(pf!=null && pc!=null) opts.saves=(pf-pc).toFixed(2).replace(/\.00$/,"");
      const cArr=arrivalClock(row.o,row.r,cur.id);
      opts.laterThan=(fArr&&cArr)?Math.max(0,Math.round((cArr-fArr)/60000)):0;
    }
    return destCard(row.o,row.e,row.r,opts);
  }).join("")+altSection(rest);
  wireAltToggle();
}

function effectiveJourney(o, atDate, destinationId){
  if(!o) return "";
  const d=atDate instanceof Date ? atDate : new Date();
  if(destinationId && o.journeyByDestination && o.journeyByDestination[destinationId]!=null){
    return "~"+o.journeyByDestination[destinationId]+" min";
  }
  if(Array.isArray(o.journeyBands)){
    const h=d.getHours()+d.getMinutes()/60;
    const band=o.journeyBands.find(b=>h>=b.from && h<b.to);
    if(band) return "~"+band.mins+" min";
  }
  return o.journey || "";
}

function durationMinutes(text){
  if(!text) return 0;
  const nums=(String(text).match(/\d+(?:\.\d+)?/g)||[]).map(Number);
  if(!nums.length) return 0;
  if(nums.length===1) return nums[0];
  return nums.reduce((a,b)=>a+b,0)/nums.length;
}
function walkMinutes(text){ return durationMinutes(text); }
function totalTripMinutes(o, r, destinationId){
  if(r.onDemand) return walkMinutes(o.walk) + durationMinutes(effectiveJourney(o, r.selected, destinationId));
  if(r.closed) return Infinity;
  return walkMinutes(o.walk) + Math.max(0,r.until) + durationMinutes(effectiveJourney(o, r.selected, destinationId));
}
function renderAirport(code){
  const ap=AIRPORTS[code]; if(!ap) return;
  const at=getViewTime();
  const rows=ap.options.map(o=>{
    const r={o, ...nextTwo(o, at)};
    r.total=totalTripMinutes(o,r);
    return r;
  });
  rows.sort((a,b)=>{
    const at=a.o.mode==="taxi", bt=b.o.mode==="taxi";
    if(at!==bt) return at?1:-1;
    return a.total-b.total;
  });
  const fastest=rows.find(r=>r.o.mode!=="taxi" && Number.isFinite(r.total));
  rows.forEach(r=>{r.fastest=!!fastest && r===fastest; r.relegated=r.o.mode==="taxi";});
  document.getElementById("options").innerHTML=rows.map((r)=>{const o=r.o; const e={to:o.to,note:o.note,destinationId:null}; const opts=rows.length>1?{fastest:r===fastest}:{solo:true}; return destCard(o,e,r,opts);}).join("");
  const cc=document.getElementById("conns");
  if(cc) cc.innerHTML=(ap.connections&&ap.connections.length)?`<div class="conns-h">${JL_LANG==="el"?"Άλλες συνδέσεις από":"Other connections from"} ${code}</div>`+ap.connections.map(c=>{
    const r=connNext(c,at); let t="";
    if(r){ const est=(c.est&&!r.isLive)?"~":""; const rel=r.closed?(JL_LANG==="el"?"πρώτο ":"first ")+fmt(r.dep):(r.until<=0?(JL_LANG==="el"?"τώρα":"now"):(r.until<60?(JL_LANG==="el"?`σε ${r.until} λεπτά`:`in ${r.until}m`):(JL_LANG==="el"?`σε ${Math.floor(r.until/60)}ώ${String(r.until%60).padStart(2,"0")}`:`in ${Math.floor(r.until/60)}h${String(r.until%60).padStart(2,"0")}`)));
      t=`<div class="conn-t"><div class="ct ${r.isLive?'live':''}">${est}${fmt(r.dep)}</div><div class="cs">${r.isLive?'live · ':''}${rel}</div></div>`; }
    return `<div class="conn"><div class="conn-ic">${modeIcon(c.icon)}</div><div class="conn-b"><b>${tr(c.to)}</b><span>${tr(c.sub)}</span></div>${t}</div>`;
  }).join(""):"";
  const sub=document.getElementById("sub");
  if(sub){ const nn=ap.options.length; sub.innerHTML=JL_LANG==="el"?`<b>${nn}</b> ${nn===1?"διαδρομή":"διαδρομές"} από <b>${tr(ap.name)}</b> · ${tr(ap.city)} · <b>${selectedLabel(at)}</b>`+(nn>1?` — ${tr("FASTEST").toLowerCase()} πρώτη`:``):`<b>${nn}</b> way${nn>1?"s":""} from <b>${ap.name}</b> · ${ap.city} · <b>${selectedLabel(at)}</b>`+(nn>1?` — fastest first`:``); }
}
async function loadLive(code){
  const ap=AIRPORTS[code]; if(!ap) return;
  const needs=ap.destinations||ap.options.some(o=>o.route)||(ap.connections&&ap.connections.some(c=>c.route)); if(!needs) return;
  try{ const r=await fetch("/api/airport",{cache:"no-store"}); if(!r.ok) return; const j=await r.json(); const d=new Date(),base=d.getHours()*60+d.getMinutes(); const routes=j.routes||{};
    for(const rc of ["2051","3028","5373","5675"]){ const mins=routes[rc]; if(Array.isArray(mins)&&mins.length) LIVE[rc]={deps:mins.map(m=>base+m),ts:Date.now()}; else delete LIVE[rc]; } }catch(e){}
  (ap.destinations?renderDest:renderAirport)(code);
}
function initAirport(code){ ensureWalkModal(); ensureTimePicker(); const ap=AIRPORTS[code]; const rf=(ap&&ap.destinations)?renderDest:renderAirport; rf(code); loadLive(code); setInterval(()=>rf(code),15000); setInterval(()=>loadLive(code),30000); }
function tickClock(){ const el=document.getElementById("clock"); if(!el) return; const d=new Date(); el.textContent=(JL_LANG==="el"?"τώρα ":"now ")+String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0")+":"+String(d.getSeconds()).padStart(2,"0"); }
if (typeof document !== "undefined" && document.getElementById("clock")) { tickClock(); setInterval(tickClock,1000); }
