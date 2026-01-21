import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import * as fs from "fs";
import * as path from "path";

const CONVEX_URL = process.env.VITE_CONVEX_URL;

if (!CONVEX_URL) {
  console.error("Error: VITE_CONVEX_URL environment variable is not set");
  console.error("Run: source .env.local or set the variable manually");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

const BATCH_SIZE = 100;

interface WordEntry {
  word: string;
  difficulty: string;
}

async function loadWordsFromFile(
  filePath: string,
  difficulty: string
): Promise<WordEntry[]> {
  const content = fs.readFileSync(filePath, "utf-8");
  const words = content
    .split("\n")
    .map((w) => w.trim())
    .filter((w) => w.length > 0);

  return words.map((word) => ({ word, difficulty }));
}

async function seedWords(words: WordEntry[]): Promise<void> {
  console.log(`Seeding ${words.length} words in batches of ${BATCH_SIZE}...`);

  let seeded = 0;
  let skipped = 0;

  for (let i = 0; i < words.length; i += BATCH_SIZE) {
    const batch = words.slice(i, i + BATCH_SIZE);

    try {
      const results = await client.mutation(api.words.seedWords, {
        words: batch,
      });

      for (const result of results) {
        if (result.status === "created") {
          seeded++;
        } else {
          skipped++;
        }
      }

      const progress = Math.min(i + BATCH_SIZE, words.length);
      const percent = ((progress / words.length) * 100).toFixed(1);
      process.stdout.write(
        `\rProgress: ${progress}/${words.length} (${percent}%) - Created: ${seeded}, Skipped: ${skipped}`
      );
    } catch (error) {
      console.error(`\nError seeding batch at index ${i}:`, error);
    }
  }

  console.log("\n");
}

async function main() {
  const scriptsDir = path.dirname(new URL(import.meta.url).pathname);

  console.log("Loading word files...\n");

  // Load words from each file
  const easyWords = await loadWordsFromFile(
    path.join(scriptsDir, "words_4.txt"),
    "easy"
  );
  console.log(`Loaded ${easyWords.length} easy words (4 letters)`);

  const mediumWords = await loadWordsFromFile(
    path.join(scriptsDir, "words_5.txt"),
    "medium"
  );
  console.log(`Loaded ${mediumWords.length} medium words (5 letters)`);

  const hardWords = await loadWordsFromFile(
    path.join(scriptsDir, "words_6.txt"),
    "hard"
  );
  console.log(`Loaded ${hardWords.length} hard words (6 letters)`);

  const totalWords = easyWords.length + mediumWords.length + hardWords.length;
  console.log(`\nTotal: ${totalWords} words to seed\n`);

  // Seed each difficulty
  console.log("=== Seeding EASY words (4 letters) ===");
  await seedWords(easyWords);

  console.log("=== Seeding MEDIUM words (5 letters) ===");
  await seedWords(mediumWords);

  console.log("=== Seeding HARD words (6 letters) ===");
  await seedWords(hardWords);

  console.log("Done! Verifying word counts...\n");

  // Verify counts
  const counts = await client.query(api.words.getWordCount, {});
  console.log("Words in database:");
  console.log(`  Easy: ${counts.easy}`);
  console.log(`  Medium: ${counts.medium}`);
  console.log(`  Hard: ${counts.hard}`);
  console.log(`  Total: ${counts.total}`);
}

main().catch(console.error);
