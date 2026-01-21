import * as fs from "fs";
import * as path from "path";

const FREQUENCY_URL =
  "https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/lv/lv_50k.txt";

// Minimum frequency count to consider a word "common"
// Higher = more strict (only very common words)
// Lower = more lenient (includes less common words)
const MIN_FREQUENCY = 10;

interface FrequencyData {
  word: string;
  count: number;
}

async function downloadFrequencyList(): Promise<Map<string, number>> {
  console.log("Downloading Latvian frequency list...");

  const response = await fetch(FREQUENCY_URL);
  if (!response.ok) {
    throw new Error(`Failed to download: ${response.statusText}`);
  }

  const text = await response.text();
  const frequencyMap = new Map<string, number>();

  for (const line of text.split("\n")) {
    const [word, countStr] = line.trim().split(" ");
    if (word && countStr) {
      const count = parseInt(countStr, 10);
      if (!isNaN(count)) {
        frequencyMap.set(word.toLowerCase(), count);
      }
    }
  }

  console.log(`Loaded ${frequencyMap.size} words from frequency list\n`);
  return frequencyMap;
}

function filterWordFile(
  inputPath: string,
  outputPath: string,
  frequencyMap: Map<string, number>,
  minFrequency: number
): { total: number; kept: number; removed: string[] } {
  const content = fs.readFileSync(inputPath, "utf-8");
  const words = content
    .split("\n")
    .map((w) => w.trim())
    .filter((w) => w.length > 0);

  const kept: string[] = [];
  const removed: string[] = [];

  for (const word of words) {
    const freq = frequencyMap.get(word.toLowerCase()) ?? 0;
    if (freq >= minFrequency) {
      kept.push(word);
    } else {
      removed.push(word);
    }
  }

  fs.writeFileSync(outputPath, kept.join("\n") + "\n");

  return { total: words.length, kept: kept.length, removed };
}

async function main() {
  const scriptsDir = path.dirname(new URL(import.meta.url).pathname);

  const frequencyMap = await downloadFrequencyList();

  const files = [
    { input: "words_4.txt", output: "words_4_common.txt", label: "4-letter" },
    { input: "words_5.txt", output: "words_5_common.txt", label: "5-letter" },
    { input: "words_6.txt", output: "words_6_common.txt", label: "6-letter" },
  ];

  console.log(`Filtering with MIN_FREQUENCY = ${MIN_FREQUENCY}\n`);
  console.log("=".repeat(50));

  let totalKept = 0;
  let totalRemoved = 0;

  for (const file of files) {
    const inputPath = path.join(scriptsDir, file.input);
    const outputPath = path.join(scriptsDir, file.output);

    if (!fs.existsSync(inputPath)) {
      console.log(`Skipping ${file.input} (not found)`);
      continue;
    }

    const result = filterWordFile(
      inputPath,
      outputPath,
      frequencyMap,
      MIN_FREQUENCY
    );

    console.log(`\n${file.label} words (${file.input}):`);
    console.log(`  Total: ${result.total}`);
    console.log(`  Kept:  ${result.kept} (${((result.kept / result.total) * 100).toFixed(1)}%)`);
    console.log(`  Removed: ${result.removed.length}`);
    console.log(`  Output: ${file.output}`);

    // Show sample of removed words
    if (result.removed.length > 0) {
      const sample = result.removed.slice(0, 10);
      console.log(`  Sample removed: ${sample.join(", ")}${result.removed.length > 10 ? "..." : ""}`);
    }

    totalKept += result.kept;
    totalRemoved += result.removed.length;
  }

  console.log("\n" + "=".repeat(50));
  console.log(`\nSummary:`);
  console.log(`  Total kept: ${totalKept}`);
  console.log(`  Total removed: ${totalRemoved}`);
  console.log(`\nNew files created with "_common" suffix.`);
  console.log(`Adjust MIN_FREQUENCY in the script if you want more/fewer words.`);
  console.log(`\nTo use the filtered words, either:`);
  console.log(`  1. Rename the _common files to replace the originals`);
  console.log(`  2. Update seed-words.ts to use the _common files`);
}

main().catch(console.error);
