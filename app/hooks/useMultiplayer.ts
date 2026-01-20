import { useState, useCallback, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { BoardRow, RowAnimation } from "~/components/GameBoard";
import type { TileState } from "~/components/Tile";
import { validateGuess, isWinningGuess } from "~/lib/wordValidator";
import { generatePlayerName, generatePlayerId } from "~/lib/nameGenerator";
import { useSound } from "./useSound";

const MAX_ROWS = 6;
const TURN_TIME_LIMIT = 30; // seconds

interface MultiplayerState {
  isMyTurn: boolean;
  timeRemaining: number;
  opponentName: string;
  opponentRating: number;
  myHearts: number;
  opponentHearts: number;
  myScore: number;
  opponentScore: number;
  round: number;
  matchOver: boolean;
  winnerId: string | null;
  isWinner: boolean;
}

interface Match {
  _id: string;
  player1Id: string;
  player2Id: string;
  status: string;
  currentWord: string;
  currentDifficulty: string;
  currentRound: number;
  currentTurn: string;
  guesses: string[];
  player1Hearts: number;
  player2Hearts: number;
  player1Score: number;
  player2Score: number;
  winnerId?: string;
}

interface Player {
  playerId: string;
  name: string;
  rankedRating: number;
  rankedWins: number;
  rankedLosses: number;
}

function createEmptyBoard(wordLength: number): BoardRow[] {
  return Array.from({ length: MAX_ROWS }, () => ({
    letters: Array(wordLength).fill(""),
    states: Array(wordLength).fill("empty") as TileState[],
    submitted: false,
  }));
}

export function useMultiplayer(matchId: string) {
  const { play: playSound } = useSound();

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

  const [currentGuess, setCurrentGuess] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(TURN_TIME_LIMIT);
  const [lastProcessedGuessCount, setLastProcessedGuessCount] = useState(0);
  const [rowAnimation, setRowAnimation] = useState<{ row: number; type: RowAnimation } | undefined>(undefined);
  const lastTypedIndex = useRef(-1);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const previousTurnRef = useRef<string | null>(null);

  // Real-time match subscription - use type assertion for new API
  const match = useQuery((api as any).matches?.getMatch, { matchId }) as Match | undefined | null;

  // Get opponent info
  const opponentId = match
    ? match.player1Id === playerId
      ? match.player2Id
      : match.player1Id
    : null;
  const opponent = useQuery(
    (api as any).players?.getPlayer,
    opponentId ? { playerId: opponentId } : "skip"
  ) as Player | undefined | null;

  // Mutations - use type assertion for new API endpoints
  const submitGuessMutation = useMutation((api as any).matches?.submitGuess);
  const skipTurnMutation = useMutation((api as any).matches?.skipTurn);
  const forfeitMatchMutation = useMutation((api as any).matches?.forfeitMatch);
  const updateRatingMutation = useMutation((api as any).players?.updateRating);
  const clearMatchmakingMutation = useMutation((api as any).matchmaking?.clearMatchmaking);

  // Determine player position
  const isPlayer1 = match?.player1Id === playerId;

  // Build board from match guesses
  const wordLength = match?.currentWord?.length ?? 5;
  const [board, setBoard] = useState<BoardRow[]>(() =>
    createEmptyBoard(wordLength)
  );

  // Update board when match changes
  useEffect(() => {
    if (!match) return;

    const newWordLength = match.currentWord.length;
    const newBoard = createEmptyBoard(newWordLength);

    // Fill in guesses
    match.guesses.forEach((guess: string, index: number) => {
      if (guess === "") {
        // Skipped turn - show empty row
        newBoard[index] = {
          letters: Array(newWordLength).fill(""),
          states: Array(newWordLength).fill("absent") as TileState[],
          submitted: true,
        };
      } else {
        const states = validateGuess(guess, match.currentWord);
        newBoard[index] = {
          letters: guess.split(""),
          states,
          submitted: true,
        };
      }
    });

    // Show first letter in current row if it's available
    const currentRowIndex = match.guesses.length;
    if (currentRowIndex < MAX_ROWS && match.currentWord) {
      newBoard[currentRowIndex] = {
        ...newBoard[currentRowIndex],
        letters: [match.currentWord[0], ...Array(newWordLength - 1).fill("")],
      };
    }

    setBoard(newBoard);

    // Reset guess when new guesses are added
    if (match.guesses.length !== lastProcessedGuessCount) {
      setLastProcessedGuessCount(match.guesses.length);
      setCurrentGuess(match.currentWord[0]);
    }
  }, [match, lastProcessedGuessCount]);

  // Helper for triggering animations
  const triggerRowAnimation = useCallback((row: number, type: RowAnimation) => {
    setRowAnimation({ row, type });
    setTimeout(() => setRowAnimation(undefined), type === "bounce" ? 700 : 500);
  }, []);

  // Sound and animation effects when new guess is added
  useEffect(() => {
    if (!match || match.guesses.length === 0) return;

    const guessCount = match.guesses.length;

    // Only trigger if a new guess was added
    if (guessCount > lastProcessedGuessCount && lastProcessedGuessCount > 0) {
      const lastGuess = match.guesses[guessCount - 1];
      const lastGuessRow = guessCount - 1;

      if (lastGuess && lastGuess !== "") {
        const states = validateGuess(lastGuess, match.currentWord);
        const isWin = isWinningGuess(states);

        if (isWin) {
          triggerRowAnimation(lastGuessRow, "bounce");
          // Determine if this player won or lost
          const wasMyGuess = previousTurnRef.current === playerId;
          if (wasMyGuess) {
            playSound("win");
          } else {
            playSound("lose");
          }
        } else {
          // Regular guess - play opponent guess sound if it wasn't my turn
          const wasOpponentGuess = previousTurnRef.current !== playerId;
          if (wasOpponentGuess) {
            playSound("opponentGuess");
          }
        }
      }
    }
  }, [match?.guesses.length, lastProcessedGuessCount, match?.currentWord, playSound, triggerRowAnimation, match?.guesses, playerId]);

  // Timer management
  useEffect(() => {
    if (!match || match.status !== "active") return;

    const isMyTurn = match.currentTurn === playerId;

    // Play sound when it becomes your turn
    if (isMyTurn && previousTurnRef.current !== null && previousTurnRef.current !== playerId) {
      playSound("yourTurn");
    }
    previousTurnRef.current = match.currentTurn;

    // Reset timer when it becomes your turn
    if (isMyTurn) {
      setTimeRemaining(TURN_TIME_LIMIT);

      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Time's up - skip turn
            if (timerRef.current) clearInterval(timerRef.current);
            if (skipTurnMutation) {
              skipTurnMutation({ matchId, playerId });
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      // Not your turn - stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setTimeRemaining(TURN_TIME_LIMIT);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [match?.currentTurn, match?.status, playerId, matchId, skipTurnMutation, playSound]);

  // Handle match completion - update ratings
  useEffect(() => {
    if (match?.status === "finished" && match.winnerId && opponent) {
      const didWin = match.winnerId === playerId;

      // Update both players' ratings
      if (updateRatingMutation) {
        updateRatingMutation({
          playerId,
          won: didWin,
          opponentRating: opponent.rankedRating,
        });
      }

      // Clear matchmaking entries
      if (clearMatchmakingMutation) {
        clearMatchmakingMutation({ playerId });
      }
    }
  }, [
    match?.status,
    match?.winnerId,
    playerId,
    opponent,
    updateRatingMutation,
    clearMatchmakingMutation,
  ]);

  const handleKeyPress = useCallback(
    (key: string) => {
      if (!match || match.status !== "active") return;
      if (match.currentTurn !== playerId) return;
      if (currentGuess.length >= wordLength) return;

      playSound("letterPlaced");
      lastTypedIndex.current = currentGuess.length;

      const firstLetter = match.currentWord[0];

      if (currentGuess.length === 0 && key.toLowerCase() !== firstLetter.toLowerCase()) {
        setCurrentGuess(firstLetter + key);
      } else {
        setCurrentGuess((prev) => prev + key);
      }
    },
    [match, playerId, currentGuess, wordLength, playSound]
  );

  const handleBackspace = useCallback(() => {
    if (!match || match.status !== "active") return;
    if (match.currentTurn !== playerId) return;

    // Don't delete the first letter
    if (currentGuess.length > 1) {
      setCurrentGuess((prev) => prev.slice(0, -1));
    }
  }, [match, playerId, currentGuess]);

  const handleSubmit = useCallback(async () => {
    if (!match || match.status !== "active") return;
    if (match.currentTurn !== playerId) return;

    let guess = currentGuess;
    const firstLetter = match.currentWord[0];

    // Ensure guess starts with first letter
    if (!guess.startsWith(firstLetter.toLowerCase())) {
      guess = firstLetter + guess;
    }

    if (guess.length !== wordLength) {
      // Shake animation for incomplete guess
      triggerRowAnimation(match.guesses.length, "shake");
      playSound("wrong");
      return;
    }

    try {
      if (submitGuessMutation) {
        await submitGuessMutation({
          matchId,
          playerId,
          guess,
        });
      }

      // Reset guess for next turn
      setCurrentGuess(match.currentWord[0]);
    } catch (error) {
      console.error("Failed to submit guess:", error);
    }
  }, [match, playerId, currentGuess, wordLength, matchId, submitGuessMutation, triggerRowAnimation, playSound]);

  const forfeitMatch = useCallback(async () => {
    try {
      if (forfeitMatchMutation) {
        await forfeitMatchMutation({ matchId, playerId });
      }
    } catch (error) {
      console.error("Failed to forfeit:", error);
    }
  }, [forfeitMatchMutation, matchId, playerId]);

  // Computed state
  const state: MultiplayerState = {
    isMyTurn: match?.currentTurn === playerId,
    timeRemaining,
    opponentName: opponent?.name ?? "Pretinieks",
    opponentRating: opponent?.rankedRating ?? 1000,
    myHearts: isPlayer1 ? (match?.player1Hearts ?? 3) : (match?.player2Hearts ?? 3),
    opponentHearts: isPlayer1 ? (match?.player2Hearts ?? 3) : (match?.player1Hearts ?? 3),
    myScore: isPlayer1 ? (match?.player1Score ?? 0) : (match?.player2Score ?? 0),
    opponentScore: isPlayer1 ? (match?.player2Score ?? 0) : (match?.player1Score ?? 0),
    round: match?.currentRound ?? 1,
    matchOver: match?.status === "finished",
    winnerId: match?.winnerId ?? null,
    isWinner: match?.winnerId === playerId,
  };

  return {
    playerId,
    playerName,
    match,
    board,
    currentGuess: currentGuess || (match?.currentWord ? match.currentWord[0] : ""),
    wordLength,
    currentRow: match?.guesses.length ?? 0,
    state,
    handleKeyPress,
    handleBackspace,
    handleSubmit,
    forfeitMatch,
    rowAnimation,
    lastTypedIndex: lastTypedIndex.current,
  };
}
