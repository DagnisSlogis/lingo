/**
 * Generates a random funny Latvian-style player name
 */

const adjectives = [
  "Ātrais",
  "Lēnais",
  "Gudrais",
  "Veiklais",
  "Drosmīgais",
  "Jautrais",
  "Mierīgais",
  "Spēcīgais",
  "Vieglais",
  "Skaļais",
  "Klusais",
  "Zaļais",
  "Zilais",
  "Sarkanais",
  "Dzeltenais",
  "Melnais",
  "Baltais",
  "Mazais",
  "Lielais",
  "Garais",
];

const nouns = [
  "Ezis",
  "Lācis",
  "Vilks",
  "Lapsa",
  "Zaķis",
  "Bebrs",
  "Ūdrs",
  "Pūce",
  "Vārna",
  "Stārķis",
  "Zivs",
  "Varde",
  "Čūska",
  "Bite",
  "Tauriņš",
  "Koks",
  "Akmens",
  "Upes",
  "Kalns",
  "Mežs",
];

export function generatePlayerName(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 100);

  return `${adjective}${noun}${number}`;
}

/**
 * Generates a unique player ID
 */
export function generatePlayerId(): string {
  return `player_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
