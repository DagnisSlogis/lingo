import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { BoardRow } from "~/components/GameBoard";
import type { TileState } from "~/components/Tile";
import { validateGuess, isWinningGuess, calculateScore } from "~/lib/wordValidator";
import { generatePlayerName, generatePlayerId } from "~/lib/nameGenerator";

type Difficulty = "easy" | "medium" | "hard";

const WORD_LENGTHS: Record<Difficulty, number> = {
  easy: 5,
  medium: 7,
  hard: 9,
};

const MAX_ROWS = 6;
const MAX_HEARTS = 3;

function createEmptyBoard(wordLength: number): BoardRow[] {
  return Array.from({ length: MAX_ROWS }, () => ({
    letters: Array(wordLength).fill(""),
    states: Array(wordLength).fill("empty") as TileState[],
    submitted: false,
  }));
}

export function useGame(difficulty: Difficulty) {
  const wordLength = WORD_LENGTHS[difficulty];
  const randomWord = useQuery(api.words.getRandomWord, { difficulty });
  const submitScore = useMutation(api.leaderboard.submitScore);

  const [targetWord, setTargetWord] = useState<string>("");
  const [board, setBoard] = useState<BoardRow[]>(() => createEmptyBoard(wordLength));
  const [currentRow, setCurrentRow] = useState(0);
  const [currentGuess, setCurrentGuess] = useState("");
  const [hearts, setHearts] = useState(MAX_HEARTS);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [playerId] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("lingo_player_id");
      if (stored) return stored;
      const newId = generatePlayerId();
      localStorage.setItem("lingo_player_id", newId);
      return newId;
    }
    return generatePlayerId();
  });
  const [playerName] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("lingo_player_name");
      if (stored) return stored;
      const newName = generatePlayerName();
      localStorage.setItem("lingo_player_name", newName);
      return newName;
    }
    return generatePlayerName();
  });

  // Initialize target word when it loads
  useEffect(() => {
    if (randomWord && !targetWord) {
      setTargetWord(randomWord.word);
      // Set first letter as revealed
      setBoard((prev) => {
        const newBoard = [...prev];
        newBoard[0] = {
          ...newBoard[0],
          letters: [randomWord.word[0], ...Array(wordLength - 1).fill("")],
        };
        return newBoard;
      });
    }
  }, [randomWord, targetWord, wordLength]);

  const handleKeyPress = useCallback(
    (key: string) => {
      if (gameOver || !targetWord) return;
      if (currentGuess.length >= wordLength) return;

      // Don't allow changing the first letter (it's revealed)
      if (currentGuess.length === 0 && key.toLowerCase() !== targetWord[0].toLowerCase()) {
        setCurrentGuess(targetWord[0] + key);
      } else {
        setCurrentGuess((prev) => prev + key);
      }
    },
    [gameOver, currentGuess, wordLength, targetWord]
  );

  const handleBackspace = useCallback(() => {
    if (gameOver || !targetWord) return;
    // Don't delete the first letter
    if (currentGuess.length > 1) {
      setCurrentGuess((prev) => prev.slice(0, -1));
    }
  }, [gameOver, currentGuess, targetWord]);

  const handleSubmit = useCallback(() => {
    if (gameOver || !targetWord) return;

    // Ensure the guess starts with the first letter and is complete
    let guess = currentGuess;
    if (!guess.startsWith(targetWord[0].toLowerCase())) {
      guess = targetWord[0] + guess;
    }

    if (guess.length !== wordLength) return;

    const states = validateGuess(guess, targetWord);
    const isWin = isWinningGuess(states);

    setBoard((prev) => {
      const newBoard = [...prev];
      newBoard[currentRow] = {
        letters: guess.split(""),
        states,
        submitted: true,
      };
      return newBoard;
    });

    if (isWin) {
      const pointsGained = calculateScore(currentRow + 1);
      setScore((prev) => prev + pointsGained);
      setWon(true);
      setGameOver(true);
    } else if (currentRow >= MAX_ROWS - 1) {
      // Lost this round
      const newHearts = hearts - 1;
      setHearts(newHearts);
      setWon(false);
      setGameOver(true);
    } else {
      // Continue to next row
      setCurrentRow((prev) => prev + 1);
      setCurrentGuess(targetWord[0]); // Start next guess with first letter
    }
  }, [gameOver, currentGuess, wordLength, targetWord, currentRow, hearts]);

  const startNewGame = useCallback(() => {
    // If game over (no hearts), reset everything
    if (hearts === 0) {
      setHearts(MAX_HEARTS);
      setScore(0);
    }

    setBoard(createEmptyBoard(wordLength));
    setCurrentRow(0);
    setCurrentGuess("");
    setGameOver(false);
    setWon(false);
    setTargetWord(""); // This will trigger loading a new word
  }, [wordLength, hearts]);

  const submitToLeaderboard = useCallback(async () => {
    if (score === 0) return;

    try {
      await submitScore({
        playerId,
        playerName,
        score,
        difficulty,
        gamesWon: Math.floor(score / 10), // Rough estimate
      });
    } catch (error) {
      console.error("Failed to submit score:", error);
    }
  }, [submitScore, playerId, playerName, score, difficulty]);

  return {
    board,
    currentRow,
    currentGuess: currentGuess || (targetWord ? targetWord[0] : ""),
    hearts,
    score,
    gameOver,
    won,
    wordLength,
    targetWord,
    handleKeyPress,
    handleSubmit,
    handleBackspace,
    startNewGame,
    submitToLeaderboard,
  };
}
