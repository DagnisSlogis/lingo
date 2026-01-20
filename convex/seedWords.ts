import { mutation } from "./_generated/server";

// Latvian words for the game
// Easy: 5 letters, Medium: 7 letters, Hard: 9 letters

const LATVIAN_WORDS = {
  easy: [
    // 5-letter Latvian words
    "mājas", "saulē", "ziema", "diena", "nakts",
    "ūdens", "zemes", "gaiss", "uguns", "vējš",
    "kalni", "meži", "lauki", "ceļš", "tilts",
    "durvi", "logs", "siena", "grīda", "jumts",
    "krēsls", "galds", "gulta", "skapis", "spogs",
    "grāma", "lapas", "burts", "vārdi", "teikm",
    "maize", "piens", "gaļas", "zivis", "olas",
    "ābols", "bumba", "zāles", "puķes", "kokus",
    "kaķis", "sunis", "zirgs", "govs", "cūka",
    "putns", "zivs", "bite", "skudr", "taurš",
    "rokas", "kājas", "galva", "acis", "ausis",
    "mute", "zobi", "nags", "māte", "tēvs",
    "brāli", "māsa", "vecis", "bērni", "draugs",
    "darbs", "spēle", "dzīve", "laiks", "vieta",
    "liels", "mazs", "jauns", "vecs", "labs",
    "slikts", "auksts", "karsts", "gaišs", "tumšs",
    "balts", "melns", "zaļš", "zils", "dzelt",
    "sarkn", "brūns", "rozā", "pelēk", "oranž",
    "viens", "divi", "trīs", "četri", "pieci",
    "seši", "septi", "astoi", "devii", "desmt",
  ],
  medium: [
    // 7-letter Latvian words
    "brīvība", "lauksai", "dzīvokl", "mašīnas", "vilcien",
    "autobus", "lidmašī", "kuģis", "laivas", "velosiē",
    "telefon", "dators", "internē", "program", "sistēma",
    "izglītī", "skolotā", "students", "profesō", "direkto",
    "ārstnie", "slimnīc", "aptiekas", "zāļumi", "veselīb",
    "pārtika", "restorā", "virtuvē", "ēdiens", "dzērien",
    "sportin", "futbols", "hokejis", "basketb", "volejbo",
    "mūzikai", "koncert", "teātris", "kinote", "mākslas",
    "grāmate", "bibliotē", "rakstīt", "lasīšan", "mācības",
    "draudzī", "ģimenes", "kaimiņi", "sabiedr", "kultūra",
    "tradīci", "svētkie", "jubilej", "dzimšan", "kāzasdī",
    "ceļojum", "ekskurs", "atpūtas", "viesnīc", "pludmal",
    "kalnier", "mežaino", "ezermal", "upmalas", "parkoji",
    "pilsēta", "ciemati", "provinc", "galvasp", "rajonos",
    "vēsture", "ģeogrāf", "politik", "ekonomi", "zinātne",
    "tehnika", "inženie", "arhitek", "dizains", "būvniec",
    "lauksai", "dārznīe", "mežsaim", "zvejnie", "medniie",
    "amatnīe", "tirgotā", "uzņēmēj", "bankier", "jurists",
    "policis", "ugunsdz", "karavīr", "mediķis", "skolnie",
    "piensai", "gaļasiz", "konditē", "maizniē", "šuvējas",
  ],
  hard: [
    // 9-letter Latvian words
    "universitā", "matemātik", "bibliotēka", "informācij", "tehnoloģij",
    "industriāl", "lauksaimni", "aizsardzīb", "izglītības", "medicīnisk",
    "ekonomiska", "politiskaj", "demokrātij", "republikas", "konstituci",
    "parlaments", "prezidents", "ministrijā", "departamen", "institūcij",
    "organizāci", "asociācija", "federācijā", "konfederāc", "kooperatīv",
    "internacio", "starptauti", "diplomātij", "vēstniecīb", "konsulārā",
    "juridiskie", "administratī", "finansiāla", "komercijāl", "korporatīv",
    "uzņēmējda", "menedžment", "mārketinga", "reklāmiska", "komunikāci",
    "transporta", "loģistiska", "aviācijskā", "navigācijā", "telekomunī",
    "elektronis", "automatizā", "robotizāci", "digitalizā", "virtualizā",
    "intelektuā", "psiholoģis", "filozofisk", "socioloģis", "antropolog",
    "bioloģiska", "ķīmiskāzin", "fizikālais", "astronomis", "ģeoloģiskā",
    "hidrologis", "meteorolog", "klimatoloģ", "ekoloģiska", "vides",
    "arhitekton", "urbānistik", "landskapēš", "restaurāci", "konservāci",
    "renovācija", "rekonstrku", "moderniāci", "transformā", "optimizāci",
  ],
};

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const results = { easy: 0, medium: 0, hard: 0 };

    for (const [difficulty, words] of Object.entries(LATVIAN_WORDS)) {
      for (const word of words) {
        const cleanWord = word.toLowerCase().trim();
        const length = cleanWord.length;

        // Check if word already exists
        const existing = await ctx.db
          .query("words")
          .withIndex("by_difficulty", (q) => q.eq("difficulty", difficulty))
          .filter((q) => q.eq(q.field("word"), cleanWord))
          .first();

        if (!existing) {
          await ctx.db.insert("words", {
            word: cleanWord,
            length,
            difficulty,
          });
          results[difficulty as keyof typeof results]++;
        }
      }
    }

    return results;
  },
});
