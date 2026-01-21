import { mutation, query } from "./_generated/server";

// Latvian words for the game
// Easy: 4 letters, Medium: 5 letters, Hard: 6 letters

const LATVIAN_WORDS = {
  easy: [
    // 4-letter Latvian words (233 words)
    "tēvs", "dēls", "vīrs", "māte", "doma", "daļa", "runa", "māja", "suns", "karš",
    "ceļš", "zēns", "māsa", "joks", "zeme", "gads", "puse", "alus", "maks", "sūds",
    "deva", "gars", "kuce", "jēga", "vējš", "zīme", "cīņa", "mīla", "dāma", "roze",
    "zivs", "soda", "tips", "pils", "cena", "elle", "gals", "sods", "nams", "rīts",
    "gaļa", "gejs", "iela", "jūra", "zāle", "elpa", "āķis", "inde", "cūka", "govs",
    "hans", "deja", "vīns", "logs", "pols", "loma", "puķe", "aste", "čoms", "rīss",
    "zoss", "kopa", "tēja", "lapa", "mele", "šahs", "zupa", "poga", "pele", "jaka",
    "nūja", "robs", "tapa", "mežs", "sula", "zods", "auss", "pase", "rīks", "vads",
    "kaps", "pīle", "eļļa", "mēle", "osta", "rags", "kaka", "papa", "taka", "vāks",
    "kola", "lops", "mats", "zobs", "āzis", "bads", "gids", "muša", "gans", "odze",
    "kaza", "lija", "mape", "aita", "bēda", "ķēde", "sals", "kubs", "mūsa", "pupa",
    "rūpe", "sega", "sērs", "zars", "bots", "dūre", "mūks", "nags", "sēta", "šūna",
    "tase", "vaļa", "veļa", "zeķe", "mols", "nots", "bite", "buča", "desa", "jērs",
    "kūts", "laka", "mala", "pods", "raža", "sēne", "suka", "zīle", "cars", "duša",
    "ērce", "ieva", "paka", "pups", "rats", "varš", "žogs", "alva", "apse", "arka",
    "auka", "auns", "bāre", "bits", "bize", "bole", "bors", "čehs", "čība", "dome",
    "dusa", "egle", "ezis", "gane", "goba", "guba", "guns", "jaks", "java", "jūgs",
    "jura", "kaķe", "kāss", "keda", "ķets", "ķēve", "kija", "kore", "lāma", "lāpa",
    "lats", "lēca", "leja", "lete", "lins", "ļipa", "luba", "lūpa", "mice", "miza",
    "nāss", "nāvs", "oāze", "odzs", "ogle", "osis", "peža", "pika", "pile", "lohi",
    "pors", "purs", "pūte", "puve", "raja", "rasa", "rija", "rits", "rūda", "rūpa",
    "sams", "sāts", "sēja", "sils", "sols", "soms", "sūna", "tajs", "tāse", "tāss",
    "tece", "tele", "teļš", "tūce", "tūja", "ūdrs", "vate", "vats", "vēna", "vīģe",
    "vīķe", "zāgs", "zupe",
  ],
  medium: [
    // 5-letter Latvian words (402 words)
    "kungs", "dievs", "laiks", "velns", "lieta", "mamma", "diena", "pāris", "vieta", "darbs",
    "dzīve", "nauda", "bērns", "tētis", "sieva", "puika", "gaida", "vaina", "ideja", "spēle",
    "meita", "veids", "kuģis", "balss", "kārta", "spēks", "reize", "bumba", "kļūda", "saule",
    "uguns", "ārsts", "vecis", "prāts", "ledus", "sekss", "miers", "zelts", "banka", "kaķis",
    "skola", "kauns", "vētra", "ziema", "tante", "lācis", "vilks", "līķis", "avots", "skats",
    "spēja", "melis", "gaiss", "karte", "fakts", "vēzis", "gulta", "slava", "norma", "sargs",
    "laiva", "kalns", "skaņa", "ieeja", "pūķis", "nazis", "delta", "kalps", "žurka", "tauta",
    "kaste", "miesa", "laime", "zvērs", "balle", "būtne", "lapsa", "manta", "čūska", "muļķe",
    "vergs", "lelle", "maksa", "skots", "smaka", "zagle", "lauva", "siers", "parks", "piens",
    "gaume", "klase", "naids", "tests", "vista", "tilts", "cilts", "jumts", "bēbis", "dārzs",
    "garša", "maize", "maiss", "mauka", "virve", "bulta", "svars", "bārda", "grēks", "lauks",
    "miegs", "vanna", "viela", "telts", "galds", "kauls", "rinda", "tīkls", "tinte", "avīze",
    "kurpe", "nasta", "varde", "žests", "grīda", "jahta", "burts", "ezers", "medus", "prece",
    "stars", "dzeja", "josta", "krūze", "līcis", "pasts", "āmurs", "krūts", "maijs", "mērce",
    "plecs", "redze", "cālis", "kakls", "šķēps", "ābols", "glāze", "jūdze", "marts", "bokss",
    "josla", "opera", "tārps", "arābs", "ciems", "lente", "migla", "putra", "skate", "valis",
    "zaķis", "zieds", "grozs", "miets", "niere", "celis", "fails", "kņazs", "purvs", "saite",
    "skābe", "skuķe", "ārste", "daile", "dvaša", "kārpa", "kāsis", "kross", "tulks", "zebra",
    "bieds", "brits", "dzīle", "grāfs", "grīva", "iekša", "krūms", "panna", "plate", "sakne",
    "spars", "vasks", "augša", "aukla", "cents", "dīķis", "krona", "ozols", "pekle", "piere",
    "pļāpa", "plīts", "slota", "stabs", "svece", "valde", "zāģis", "znots", "ateja", "birzs",
    "celms", "cimds", "diegs", "ētika", "koris", "krogs", "saime", "siens", "svins", "vārna",
    "volts", "abate", "abats", "ābece", "ābele", "adata", "airis", "alata", "alēle", "alnis",
    "āmars", "āmers", "aorta", "apavs", "āpsis", "arājs", "arējs", "arkls", "arums", "asars",
    "asums", "ašums", "avene", "bāris", "bebrs", "bēris", "bērza", "bērze", "bērzs", "biete",
    "birka", "blaka", "blīve", "bļoda", "blusa", "brads", "brīve", "cauna", "caune", "celle",
    "cinks", "colla", "cūška", "dakša", "dānis", "darva", "dieve", "drāna", "dvīne", "emīrs",
    "ēšana", "esība", "gārša", "gauma", "ģifts", "ģints", "gnīda", "golfs", "grīds", "hercs",
    "hlors", "hurma", "iezis", "īlens", "īriss", "īsums", "kaija", "kaiva", "kālis", "kalla",
    "kārte", "kēkss", "ķelts", "ķemme", "ķerra", "ķīsis", "klade", "klēts", "krāce", "krusa",
    "kurds", "ķūska", "laima", "laims", "lanka", "lasis", "latve", "lauve", "lavis", "lazda",
    "leija", "liepa", "lūsis", "maurs", "menca", "metrs", "milze", "mukla", "neļķe", "neons",
    "oglis", "ošana", "paija", "palma", "pelde", "perve", "pērve", "piala", "pīzda", "pļava",
    "plīte", "plūme", "polis", "psihe", "punšs", "radze", "raize", "rasma", "rasme", "raude",
    "raups", "reņģe", "ronis", "rutks", "salna", "sarma", "sēkla", "sēkle", "selga", "selva",
    "sence", "serbs", "sirde", "skans", "šķēde", "šķīva", "šķīve", "skuja", "slave", "slāve",
    "slavs", "slāvs", "slēpe", "sloka", "smaks", "spals", "spīde", "spora", "stāds", "stara",
    "stepe", "store", "šurks", "taiga", "tāsis", "taurs", "teika", "teķis", "temps", "truše",
    "tulpe", "turks", "ubags", "ūdris", "upene", "urāns", "uzacs", "vaiņa", "vaine", "vārne",
    "verbs", "vēsma", "viese", "vilns", "virsa", "žorks", "žurks", "zutis", "zveja", "zvīna",
    "zvīņa", "zvīne",
  ],
  hard: [
    // 6-letter Latvian words (462 words)
    "draugs", "kundze", "prieks", "puisis", "mašīna", "brālis", "ģimene", "valsts", "stāsts", "sajūta",
    "akmens", "gaisma", "lietus", "likums", "muļķis", "mūzika", "istaba", "armija", "pakaļa", "ēdiens",
    "idiots", "nozīme", "zibens", "stunda", "zaglis", "kamera", "uzvara", "sākums", "būšana", "ātrums",
    "mēness", "ragana", "pasaka", "debess", "cepure", "pavēle", "dzelzs", "kafija", "klints", "centrs",
    "dators", "nedēļa", "vasara", "atmiņa", "zobens", "pilots", "prieka", "viesis", "bībele", "adrese",
    "motors", "minūte", "pudele", "biedrs", "labums", "nejēga", "drosme", "upuris", "sezona", "deguns",
    "sniegs", "parole", "daikts", "kalējs", "valoda", "papīrs", "muzejs", "raksts", "kucēns", "parāds",
    "sīkums", "pamats", "barons", "krēsls", "smaids", "karogs", "dolārs", "dēmons", "tornis", "būtība",
    "okeāns", "sātans", "rudens", "vagīna", "jūlijs", "vecums", "zābaka", "apziņa", "asmens", "klauns",
    "monēta", "stikls", "vēders", "vīruss", "retums", "vilnis", "panika", "sports", "vecene", "ēzelis",
    "idiote", "metāls", "mugura", "ieleja", "metode", "sišana", "stārks", "humors", "milzis", "sperma",
    "cepums", "dibens", "kanāls", "ķivere", "liesma", "pimpis", "skuķis", "ērglis", "jūnijs", "pediņš",
    "rubīns", "tabaka", "tēviņš", "anglis", "garums", "ģitāra", "krievs", "mezgls", "vājība", "auglis",
    "krāsns", "krasts", "morāle", "sencis", "trusis", "tvaiks", "vājums", "asaris", "barība", "ķīmija",
    "mātīte", "skapis", "arbūzs", "dzirde", "ieelpa", "kurmis", "patēvs", "spārns", "vanags", "bullis",
    "cukurs", "gailis", "īkšķis", "kodols", "krupis", "kumeļš", "melone", "valūta", "augsne", "biedre",
    "dzērve", "efekts", "gulbis", "knābis", "spalva", "vērsis", "zābaks", "žagars", "aborts", "aziāts",
    "banāns", "dzīsla", "ievads", "klepus", "lustra", "mazums", "priede", "runcis", "sūknis", "vāvere",
    "bremze", "cirvis", "došana", "dvīnis", "dzenis", "filtrs", "fināls", "fizika", "izelpa", "kabata",
    "karote", "komēta", "lācēns", "mūķene", "teniss", "tīrība", "titāns", "tuncis", "vabole", "žoklis",
    "bārene", "dobums", "dzimta", "kapela", "nācija", "šķīvis", "skudra", "spānis", "strops", "tūplis",
    "virsus", "agrums", "aklība", "aklums", "ālants", "ampērs", "apinis", "apīnis", "aploks", "argāns",
    "argons", "arklis", "aršana", "arsēns", "aseris", "astats", "astere", "atvere", "augsme", "aziāte",
    "bālums", "banāna", "barels", "bārijs", "batāte", "bebris", "beļģis", "betons", "borijs", "borščs",
    "brasls", "brasts", "brūnis", "budele", "butele", "cālēns", "cekuls", "ceplis", "cerijs", "cērijs",
    "cēzijs", "cīpsla", "cītība", "čuguns", "dālija", "dancis", "datīvs", "duraks", "dzelme", "dzemde",
    "dzimte", "entēze", "erbijs", "ērkšis", "ēršķis", "ērtība", "firsts", "fiziķe", "fluors", "gādība",
    "grīnis", "guņģis", "gurķis", "halāts", "hasijs", "hēlijs", "hokejs", "iešana", "ievoga", "īgšana",
    "indijs", "irānis", "īriete", "islāms", "īstums", "itālis", "itrijs", "jāņoga", "jāšana", "kajaks",
    "kaķene", "kaķēns", "kālijs", "kaņepe", "kaplis", "kārkls", "kazahs", "kazene", "ķeksis", "ķērpis",
    "ķīmiķe", "ķirbis", "kirijs", "ķirsis", "kizils", "knisis", "knusis", "komika", "komiķe", "koniņš",
    "ķoniņš", "korāns", "košana", "krāsne", "krāsts", "kreile", "krists", "kuilis", "kuņģis", "labība",
    "lagzda", "lāpsta", "latvis", "leitis", "lēnība", "lēnums", "lētums", "liekņa", "litera", "litijs",
    "lodīte", "madara", "mafins", "maksts", "mārīte", "melnis", "metāns", "miģele", "mīlība", "mīļums",
    "mošeja", "možums", "musons", "nākote", "nebēda", "nedeļa", "nedele", "olnīca", "orbīta", "orgāns",
    "osmijs", "paduse", "paegle", "pagoda", "pakava", "pakavs", "pāksts", "pamāte", "pamežs", "papuve",
    "parīts", "pātaga", "pīlēns", "pipars", "pipele", "prieca", "psalms", "puravs", "purvis", "rādijs",
    "radons", "rašana", "ražība", "redīss", "rēnijs", "rodijs", "rotaļa", "rublis", "runība", "rūpība",
    "šahāda", "salāts", "salnis", "sāļums", "sarķis", "seklis", "sēklis", "selēns", "senība", "sērsna",
    "sīpols", "sirmis", "sirpis", "sivēns", "skanis", "sklēra", "skudre", "skudrs", "sliņķe", "šlipse",
    "spanis", "speķis", "spilva", "spilve", "spulga", "starks", "stirna", "strads", "strēla", "strēle",
    "stulms", "šūšana", "svaine", "tabula", "tāfele", "tāpele", "tapirs", "tauste", "telēns", "telūrs",
    "tēvija", "tomāts", "torijs", "trušis", "tūlijs", "tundra", "turība", "ubadze", "ungārs", "uzbeks",
    "vabala", "vabale", "vabals", "vabele", "vabols", "vabule", "vabuls", "vaisla", "valgme", "vecība",
    "vēsums", "vēzele", "vīksna", "vīnoga", "virsis", "virsma", "vītols", "zaķene", "zaķēns", "zaļums",
    "zemene", "zemums", "zeņķis", "žīgurs", "zilene", "zīlīte", "zilums", "zinība", "ziņote", "zirnis",
    "zīšana", "zvīnis",
  ],
};

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const results = { easy: 0, medium: 0, hard: 0, skipped: 0 };

    for (const [difficulty, words] of Object.entries(LATVIAN_WORDS)) {
      for (const word of words) {
        const cleanWord = word.toLowerCase().trim();
        const length = cleanWord.length;

        // Check if word already exists using compound index
        const existing = await ctx.db
          .query("words")
          .withIndex("by_difficulty_word", (q) =>
            q.eq("difficulty", difficulty).eq("word", cleanWord)
          )
          .first();

        if (!existing) {
          await ctx.db.insert("words", {
            word: cleanWord,
            length,
            difficulty,
          });
          results[difficulty as keyof typeof results]++;
        } else {
          results.skipped++;
        }
      }
    }

    return {
      ...results,
      total: results.easy + results.medium + results.hard,
    };
  },
});

export const getStats = query({
  args: {},
  handler: async () => {
    return {
      embedded: {
        easy: LATVIAN_WORDS.easy.length,
        medium: LATVIAN_WORDS.medium.length,
        hard: LATVIAN_WORDS.hard.length,
        total:
          LATVIAN_WORDS.easy.length +
          LATVIAN_WORDS.medium.length +
          LATVIAN_WORDS.hard.length,
      },
    };
  },
});
