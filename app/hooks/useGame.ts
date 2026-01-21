import { useState, useCallback, useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { BoardRow, RowAnimation } from "~/components/GameBoard";
import type { TileState } from "~/components/Tile";
import { validateGuess, isWinningGuess, calculateScore } from "~/lib/wordValidator";
import { generatePlayerName, generatePlayerId } from "~/lib/nameGenerator";
import { useSound } from "./useSound";

type Difficulty = "easy" | "medium" | "hard";

const WORD_LENGTHS: Record<Difficulty, number> = {
  easy: 4,
  medium: 5,
  hard: 6,
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
  const getRandomWord = useMutation(api.words.getRandomWord);
  const submitScore = useMutation(api.leaderboard.submitScore);
  const recordGameWin = useMutation(api.players.recordGameWin);
  const { play: playSound } = useSound();

  const [targetWord, setTargetWord] = useState<string>("");
  const [board, setBoard] = useState<BoardRow[]>(() => createEmptyBoard(wordLength));
  const [currentRow, setCurrentRow] = useState(0);
  const [currentGuess, setCurrentGuess] = useState("");
  const [hearts, setHearts] = useState(MAX_HEARTS);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [rowAnimation, setRowAnimation] = useState<{ row: number; type: RowAnimation } | undefined>(undefined);
  const lastTypedIndex = useRef(-1);
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

  // Fetch a new word when targetWord is empty
  useEffect(() => {
    if (!targetWord) {
      getRandomWord({ difficulty }).then((result) => {
        if (result) {
          setTargetWord(result.word);
          // Set first letter as revealed
          setBoard((prev) => {
            const newBoard = [...prev];
            newBoard[0] = {
              ...newBoard[0],
              letters: [result.word[0], ...Array(wordLength - 1).fill("")],
            };
            return newBoard;
          });
        }
      });
    }
  }, [targetWord, difficulty, wordLength, getRandomWord]);

  const handleKeyPress = useCallback(
    (key: string) => {
      if (gameOver || !targetWord) return;
      if (currentGuess.length >= wordLength) return;

      playSound("letterPlaced");
      lastTypedIndex.current = currentGuess.length;

      // Don't allow changing the first letter (it's revealed)
      if (currentGuess.length === 0 && key.toLowerCase() !== targetWord[0].toLowerCase()) {
        setCurrentGuess(targetWord[0] + key);
      } else {
        setCurrentGuess((prev) => prev + key);
      }
    },
    [gameOver, currentGuess, wordLength, targetWord, playSound]
  );

  const handleBackspace = useCallback(() => {
    if (gameOver || !targetWord) return;
    // Don't delete the first letter
    if (currentGuess.length > 1) {
      setCurrentGuess((prev) => prev.slice(0, -1));
    }
  }, [gameOver, currentGuess, targetWord]);

  const triggerRowAnimation = useCallback((row: number, type: RowAnimation) => {
    setRowAnimation({ row, type });
    setTimeout(() => setRowAnimation(undefined), type === "bounce" ? 700 : 500);
  }, []);

  const handleSubmit = useCallback(() => {
    if (gameOver || !targetWord) return;

    // Ensure the guess starts with the first letter and is complete
    let guess = currentGuess;
    if (!guess.startsWith(targetWord[0].toLowerCase())) {
      guess = targetWord[0] + guess;
    }

    if (guess.length !== wordLength) {
      // Shake animation for incomplete guess
      triggerRowAnimation(currentRow, "shake");
      playSound("wrong");
      return;
    }

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
      // Bounce animation and win sound
      triggerRowAnimation(currentRow, "bounce");
      playSound("win");
      // Record win for streak tracking
      recordGameWin({
        playerId,
        playerName,
        difficulty,
      }).catch((err) => console.error("Failed to record win:", err));
    } else if (currentRow >= MAX_ROWS - 1) {
      // Lost this round - shake animation
      triggerRowAnimation(currentRow, "shake");
      playSound("lose");
      const newHearts = hearts - 1;
      setHearts(newHearts);
      setWon(false);
      setGameOver(true);
    } else {
      // Continue to next row - correct sound if has some correct letters
      const hasCorrect = states.some((s) => s === "correct");
      if (hasCorrect) {
        playSound("correct");
      } else {
        playSound("wrong");
      }
      setCurrentRow((prev) => prev + 1);
      setCurrentGuess(targetWord[0]); // Start next guess with first letter
    }
  }, [gameOver, currentGuess, wordLength, targetWord, currentRow, hearts, playSound, triggerRowAnimation]);

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
    rowAnimation,
    lastTypedIndex: lastTypedIndex.current,
  };
}
