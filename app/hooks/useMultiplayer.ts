import { useState, useCallback, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { BoardRow, RowAnimation } from "~/components/GameBoard";
import type { TileState } from "~/components/Tile";
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

interface RoundOverInfo {
  word: string;
  roundNumber: number;
  roundWinner: "me" | "opponent" | "draw";
}

interface Match {
  _id: string;
  player1Id: string;
  player2Id: string;
  status: string;
  // Word is hidden from client - only get length and first letter
  wordLength: number;
  firstLetter: string;
  currentDifficulty: string;
  currentRound: number;
  currentTurn: string;
  guesses: string[];
  // Server-calculated tile states for each guess
  guessResults?: string[][];
  // Previous round's word (revealed after round ends)
  previousRoundWord?: string;
  player1Hearts: number;
  player2Hearts: number;
  player1Score: number;
  player2Score: number;
  winnerId?: string;
  // Rematch fields
  player1WantsRematch?: boolean;
  player2WantsRematch?: boolean;
  rematchMatchId?: string;
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
  const [roundOverInfo, setRoundOverInfo] = useState<RoundOverInfo | null>(null);
  const lastTypedIndex = useRef(-1);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const previousTurnRef = useRef<string | null>(null);
  const previousRoundRef = useRef<number | null>(null);
  const previousHeartsRef = useRef<{ p1: number; p2: number } | null>(null);
  const ratingUpdatedRef = useRef(false);

  // Reset rating updated flag when matchId changes (e.g., rematch)
  useEffect(() => {
    ratingUpdatedRef.current = false;
  }, [matchId]);

  // Real-time match subscription - use type assertion for new API
  // Skip query if matchId is empty to avoid validation errors
  const match = useQuery(
    (api as any).matches?.getMatch,
    matchId ? { matchId } : "skip"
  ) as Match | undefined | null;

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

  // Build board from match guesses - use server-provided word length
  const wordLength = match?.wordLength ?? 5;
  const [board, setBoard] = useState<BoardRow[]>(() =>
    createEmptyBoard(wordLength)
  );

  // Update board when match data changes
  const matchWordLength = match?.wordLength;
  const matchGuesses = match?.guesses;
  const matchGuessResults = match?.guessResults;
  const matchFirstLetter = match?.firstLetter;

  useEffect(() => {
    if (!matchWordLength || !matchGuesses || !matchFirstLetter) return;

    const newBoard = createEmptyBoard(matchWordLength);

    // Fill in guesses using server-provided tile states
    matchGuesses.forEach((guess: string, index: number) => {
      // Get server-calculated tile states for this guess
      const serverStates = matchGuessResults?.[index];

      if (guess === "") {
        // Skipped turn - show empty row
        newBoard[index] = {
          letters: Array(matchWordLength).fill(""),
          states: serverStates as TileState[] || Array(matchWordLength).fill("absent") as TileState[],
          submitted: true,
        };
      } else {
        // Use server-provided states instead of calculating client-side
        newBoard[index] = {
          letters: guess.split(""),
          states: serverStates as TileState[] || Array(matchWordLength).fill("absent") as TileState[],
          submitted: true,
        };
      }
    });

    // Show first letter in current row if it's available
    const currentRowIndex = matchGuesses.length;
    if (currentRowIndex < MAX_ROWS && matchFirstLetter) {
      newBoard[currentRowIndex] = {
        ...newBoard[currentRowIndex],
        letters: [matchFirstLetter, ...Array(matchWordLength - 1).fill("")],
      };
    }

    setBoard(newBoard);

    // Reset guess when new guesses are added
    if (matchGuesses.length !== lastProcessedGuessCount) {
      setLastProcessedGuessCount(matchGuesses.length);
      setCurrentGuess(matchFirstLetter);
    }
  }, [matchWordLength, matchGuesses, matchGuessResults, matchFirstLetter, lastProcessedGuessCount]);

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
        // Use server-provided states to check for win
        const states = match.guessResults?.[lastGuessRow];
        const isWin = states?.every((state) => state === "correct") ?? false;

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
  }, [match?.guesses.length, lastProcessedGuessCount, match?.guessResults, playSound, triggerRowAnimation, match?.guesses, playerId]);

  // Store refs for timer callback to avoid stale closures
  const matchIdRef = useRef(matchId);
  const playerIdRef = useRef(playerId);
  const skipTurnMutationRef = useRef(skipTurnMutation);

  useEffect(() => {
    matchIdRef.current = matchId;
    playerIdRef.current = playerId;
    skipTurnMutationRef.current = skipTurnMutation;
  }, [matchId, playerId, skipTurnMutation]);

  // Timer management
  const currentTurn = match?.currentTurn;
  const matchStatus = match?.status;

  useEffect(() => {
    if (!matchStatus || matchStatus !== "active") return;

    const isMyTurn = currentTurn === playerId;

    // Play sound when it becomes your turn
    if (isMyTurn && previousTurnRef.current !== null && previousTurnRef.current !== playerId) {
      playSound("yourTurn");
    }
    previousTurnRef.current = currentTurn ?? null;

    // Reset timer when it becomes your turn
    if (isMyTurn) {
      setTimeRemaining(TURN_TIME_LIMIT);

      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Time's up - skip turn
            if (timerRef.current) clearInterval(timerRef.current);
            if (skipTurnMutationRef.current) {
              skipTurnMutationRef.current({
                matchId: matchIdRef.current,
                playerId: playerIdRef.current
              });
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
  }, [currentTurn, matchStatus, playerId, playSound]);

  // Track round transitions and show word reveal
  const matchCurrentRound = match?.currentRound;
  const matchPreviousRoundWord = match?.previousRoundWord;
  const matchPlayer1Hearts = match?.player1Hearts;
  const matchPlayer2Hearts = match?.player2Hearts;

  useEffect(() => {
    if (matchCurrentRound === undefined || matchPlayer1Hearts === undefined || matchPlayer2Hearts === undefined) return;

    const currentRound = matchCurrentRound;
    const currentP1Hearts = matchPlayer1Hearts;
    const currentP2Hearts = matchPlayer2Hearts;

    // Initialize refs on first load
    if (previousRoundRef.current === null) {
      previousRoundRef.current = currentRound;
      previousHeartsRef.current = { p1: currentP1Hearts, p2: currentP2Hearts };
      return;
    }

    // Detect round change
    if (currentRound > previousRoundRef.current) {
      const prevP1Hearts = previousHeartsRef.current?.p1 ?? 3;
      const prevP2Hearts = previousHeartsRef.current?.p2 ?? 3;

      // Determine who won the round based on heart changes
      let roundWinner: "me" | "opponent" | "draw";
      const p1LostHeart = currentP1Hearts < prevP1Hearts;
      const p2LostHeart = currentP2Hearts < prevP2Hearts;

      if (p1LostHeart && p2LostHeart) {
        // Both lost a heart - it's a draw (no one guessed correctly)
        roundWinner = "draw";
      } else if (p1LostHeart) {
        // Player 1 lost a heart - player 2 won
        roundWinner = isPlayer1 ? "opponent" : "me";
      } else if (p2LostHeart) {
        // Player 2 lost a heart - player 1 won
        roundWinner = isPlayer1 ? "me" : "opponent";
      } else {
        // No hearts lost (shouldn't happen normally)
        roundWinner = "draw";
      }

      // Show round over modal - word is revealed via previousRoundWord from server
      setRoundOverInfo({
        word: matchPreviousRoundWord || "???",
        roundNumber: previousRoundRef.current,
        roundWinner,
      });

      // Auto-dismiss after 3 seconds
      setTimeout(() => {
        setRoundOverInfo(null);
      }, 3000);
    }

    // Update refs
    previousRoundRef.current = currentRound;
    previousHeartsRef.current = { p1: currentP1Hearts, p2: currentP2Hearts };
  }, [matchCurrentRound, matchPreviousRoundWord, matchPlayer1Hearts, matchPlayer2Hearts, isPlayer1]);

  // Handle match completion - update ratings (only once)
  const opponentRating = opponent?.rankedRating;
  useEffect(() => {
    if (match?.status === "finished" && match.winnerId && opponentRating !== undefined && !ratingUpdatedRef.current) {
      ratingUpdatedRef.current = true;
      const didWin = match.winnerId === playerId;

      // Update both players' ratings
      if (updateRatingMutation) {
        updateRatingMutation({
          playerId,
          won: didWin,
          opponentRating,
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
    opponentRating,
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

      const firstLetter = match.firstLetter;

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
    const firstLetter = match.firstLetter;

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
      setCurrentGuess(match.firstLetter);
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
    currentGuess: currentGuess || (match?.firstLetter || ""),
    wordLength,
    currentRow: match?.guesses.length ?? 0,
    state,
    handleKeyPress,
    handleBackspace,
    handleSubmit,
    forfeitMatch,
    rowAnimation,
    lastTypedIndex: lastTypedIndex.current,
    roundOverInfo,
  };
}
