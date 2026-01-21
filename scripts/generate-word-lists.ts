import * as fs from "fs";
import * as path from "path";

const FREQUENCY_URL =
  "https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/lv/lv_50k.txt";

const MIN_FREQUENCY = 10;

async function main() {
  console.log("Downloading Latvian frequency list...");

  const response = await fetch(FREQUENCY_URL);
  if (!response.ok) {
    throw new Error(`Failed to download: ${response.statusText}`);
  }

  const text = await response.text();
  const words4: string[] = [];
  const words6: string[] = [];

  for (const line of text.split("\n")) {
    const [word, countStr] = line.trim().split(" ");
    if (word && countStr) {
      const count = parseInt(countStr, 10);
      // Only include words with sufficient frequency and only letters (no numbers/special chars)
      if (
        !isNaN(count) &&
        count >= MIN_FREQUENCY &&
        /^[a-zA-ZāčēģīķļņšūžĀČĒĢĪĶĻŅŠŪŽ]+$/.test(word)
      ) {
        if (word.length === 4) {
          words4.push(word.toLowerCase());
        } else if (word.length === 6) {
          words6.push(word.toLowerCase());
        }
      }
    }
  }

  const scriptsDir = path.dirname(new URL(import.meta.url).pathname);

  fs.writeFileSync(path.join(scriptsDir, "words_4.txt"), words4.join("\n") + "\n");
  console.log(`Created words_4.txt with ${words4.length} words`);

  fs.writeFileSync(path.join(scriptsDir, "words_6.txt"), words6.join("\n") + "\n");
  console.log(`Created words_6.txt with ${words6.length} words`);
}

main().catch(console.error);
