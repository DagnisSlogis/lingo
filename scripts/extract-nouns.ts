import * as fs from "fs";
import * as path from "path";

const FREQUENCY_URL =
  "https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/lv/lv_50k.txt";
const UNIMORPH_URL =
  "https://raw.githubusercontent.com/unimorph/lav/master/lav";

const MIN_FREQUENCY = 0;

async function loadFrequencyMap(): Promise<Map<string, number>> {
  console.log("Downloading frequency list...");
  const response = await fetch(FREQUENCY_URL);
  const text = await response.text();
  const map = new Map<string, number>();

  for (const line of text.split("\n")) {
    const [word, countStr] = line.trim().split(" ");
    if (word && countStr) {
      const count = parseInt(countStr, 10);
      if (!isNaN(count)) {
        map.set(word.toLowerCase(), count);
      }
    }
  }
  console.log(`Loaded ${map.size} words from frequency list`);
  return map;
}

async function extractSingularNouns(): Promise<Set<string>> {
  console.log("Downloading UniMorph Latvian data...");
  const response = await fetch(UNIMORPH_URL);
  const text = await response.text();

  const nouns = new Set<string>();

  for (const line of text.split("\n")) {
    const parts = line.trim().split("\t");
    if (parts.length >= 3) {
      const [lemma, form, tags] = parts;
      // N;NOM;SG = Noun, Nominative case, Singular
      if (tags === "N;NOM;SG" && /^[a-zāčēģīķļņšūž]+$/.test(form)) {
        nouns.add(form.toLowerCase());
      }
    }
  }

  console.log(`Found ${nouns.size} singular nouns from UniMorph`);
  return nouns;
}

async function main() {
  const frequencyMap = await loadFrequencyMap();
  const singularNouns = await extractSingularNouns();

  const scriptsDir = path.dirname(new URL(import.meta.url).pathname);

  // Filter nouns by length and frequency, sorted by frequency
  for (const length of [4, 5, 6]) {
    const words: Array<{ word: string; freq: number }> = [];

    for (const noun of singularNouns) {
      if (noun.length === length) {
        const freq = frequencyMap.get(noun) ?? 0;
        if (freq >= MIN_FREQUENCY) {
          words.push({ word: noun, freq });
        }
      }
    }

    // Sort by frequency (highest first)
    words.sort((a, b) => b.freq - a.freq);

    const outputPath = path.join(scriptsDir, `words_${length}.txt`);
    fs.writeFileSync(outputPath, words.map((w) => w.word).join("\n") + "\n");
    console.log(`Created words_${length}.txt with ${words.length} singular nouns`);
  }
}

main().catch(console.error);
