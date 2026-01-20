import type { TileState } from "~/components/Tile";

/**
 * Validates a guess against the target word and returns tile states.
 * Follows standard Wordle rules for duplicate letter handling.
 */
export function validateGuess(guess: string, target: string): TileState[] {
  const guessArray = guess.toLowerCase().split("");
  const targetArray = target.toLowerCase().split("");
  const result: TileState[] = new Array(guessArray.length).fill("absent");

  // Track which letters in target have been matched
  const targetLetterCounts: Record<string, number> = {};
  for (const letter of targetArray) {
    targetLetterCounts[letter] = (targetLetterCounts[letter] || 0) + 1;
  }

  // First pass: mark correct positions (green)
  for (let i = 0; i < guessArray.length; i++) {
    if (guessArray[i] === targetArray[i]) {
      result[i] = "correct";
      targetLetterCounts[guessArray[i]]--;
    }
  }

  // Second pass: mark present letters (yellow)
  for (let i = 0; i < guessArray.length; i++) {
    if (result[i] === "correct") continue;

    const letter = guessArray[i];
    if (targetLetterCounts[letter] && targetLetterCounts[letter] > 0) {
      result[i] = "present";
      targetLetterCounts[letter]--;
    }
  }

  return result;
}

/**
 * Checks if a guess is a winning guess (all letters correct)
 */
export function isWinningGuess(states: TileState[]): boolean {
  return states.every((state) => state === "correct");
}

/**
 * Calculate score based on attempt number (1-indexed)
 */
export function calculateScore(attempt: number): number {
  const scores: Record<number, number> = {
    1: 500,
    2: 200,
    3: 100,
    4: 50,
    5: 25,
    6: 10,
  };
  return scores[attempt] || 0;
}
