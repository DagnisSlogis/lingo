import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Helper function to validate a guess against the target word
// Returns tile states: "correct" | "present" | "absent"
function validateGuess(guess: string, target: string): string[] {
  const guessArray = guess.toLowerCase().split("");
  const targetArray = target.toLowerCase().split("");
  const result: string[] = new Array(guessArray.length).fill("absent");

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

// Get match by ID - returns sanitized match data without the actual word
export const getMatch = query({
  args: {
    matchId: v.id("matches"),
  },
  handler: async (ctx, args) => {
    const match = await ctx.db.get(args.matchId);
    if (!match) return null;

    // Return match data without exposing the current word
    // Only expose the first letter and word length
    const { currentWord, ...safeMatch } = match;
    return {
      ...safeMatch,
      wordLength: currentWord.length,
      firstLetter: currentWord[0],
    };
  },
});

// Get active match for a player
export const getActiveMatch = query({
  args: {
    playerId: v.string(),
  },
  handler: async (ctx, args) => {
    // Check as player1
    const asPlayer1 = await ctx.db
      .query("matches")
      .withIndex("by_player", (q) => q.eq("player1Id", args.playerId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (asPlayer1) return asPlayer1;

    // Check as player2
    const asPlayer2 = await ctx.db
      .query("matches")
      .withIndex("by_player2", (q) => q.eq("player2Id", args.playerId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    return asPlayer2;
  },
});

// Submit a guess in a match
export const submitGuess = mutation({
  args: {
    matchId: v.id("matches"),
    playerId: v.string(),
    guess: v.string(),
  },
  handler: async (ctx, args) => {
    const match = await ctx.db.get(args.matchId);

    if (!match) {
      return { success: false, error: "Match not found" };
    }

    if (match.status !== "active") {
      return { success: false, error: "Match is not active" };
    }

    if (match.currentTurn !== args.playerId) {
      return { success: false, error: "Not your turn" };
    }

    const isPlayer1 = match.player1Id === args.playerId;
    const opponentId = isPlayer1 ? match.player2Id : match.player1Id;

    // Add guess to the list
    const guessLower = args.guess.toLowerCase();
    const newGuesses = [...match.guesses, guessLower];

    // Calculate tile states for this guess
    const tileStates = validateGuess(guessLower, match.currentWord);
    const newGuessResults = [...(match.guessResults || []), tileStates];

    const isCorrect = guessLower === match.currentWord.toLowerCase();

    // Calculate points based on attempt number (1-6)
    const attemptNumber = newGuesses.length;
    const pointsTable: Record<number, number> = {
      1: 500,
      2: 200,
      3: 100,
      4: 50,
      5: 25,
      6: 10,
    };

    if (isCorrect) {
      // Player guessed correctly - they win the round
      const points = pointsTable[attemptNumber] || 10;

      // Loser loses a heart
      const newPlayer1Hearts = isPlayer1
        ? match.player1Hearts
        : match.player1Hearts - 1;
      const newPlayer2Hearts = isPlayer1
        ? match.player2Hearts - 1
        : match.player2Hearts;

      // Winner gets points
      const newPlayer1Score = isPlayer1
        ? match.player1Score + points
        : match.player1Score;
      const newPlayer2Score = isPlayer1
        ? match.player2Score
        : match.player2Score + points;

      // Check if match is over
      if (newPlayer1Hearts <= 0 || newPlayer2Hearts <= 0) {
        const winnerId = newPlayer1Hearts <= 0 ? match.player2Id : match.player1Id;

        await ctx.db.patch(args.matchId, {
          guesses: newGuesses,
          guessResults: newGuessResults,
          player1Hearts: newPlayer1Hearts,
          player2Hearts: newPlayer2Hearts,
          player1Score: newPlayer1Score,
          player2Score: newPlayer2Score,
          status: "finished",
          winnerId,
          updatedAt: Date.now(),
          player1CurrentGuess: undefined,
          player2CurrentGuess: undefined,
        });

        return {
          success: true,
          correct: true,
          matchOver: true,
          winnerId,
        };
      }

      // Start new round
      const difficulties = ["easy", "medium", "hard"];
      const randomDifficulty =
        difficulties[Math.floor(Math.random() * difficulties.length)];

      const words = await ctx.db
        .query("words")
        .withIndex("by_difficulty", (q) => q.eq("difficulty", randomDifficulty))
        .collect();

      let newWord = "mājas";
      if (words.length > 0) {
        newWord = words[Math.floor(Math.random() * words.length)].word;
      }

      // Alternate who goes first each round
      const roundStarter =
        match.currentRound % 2 === 0 ? match.player2Id : match.player1Id;

      await ctx.db.patch(args.matchId, {
        guesses: [],
        guessResults: [],
        previousRoundWord: match.currentWord,
        currentWord: newWord,
        currentDifficulty: randomDifficulty,
        currentRound: match.currentRound + 1,
        currentTurn: roundStarter,
        turnStartedAt: Date.now(),
        player1Hearts: newPlayer1Hearts,
        player2Hearts: newPlayer2Hearts,
        player1Score: newPlayer1Score,
        player2Score: newPlayer2Score,
        updatedAt: Date.now(),
        player1CurrentGuess: undefined,
        player2CurrentGuess: undefined,
      });

      return {
        success: true,
        correct: true,
        newRound: true,
        points,
      };
    }

    // Incorrect guess
    if (newGuesses.length >= 6) {
      // Both players lose a heart when all 6 rows are used
      const newPlayer1Hearts = match.player1Hearts - 1;
      const newPlayer2Hearts = match.player2Hearts - 1;

      // Check if match is over
      if (newPlayer1Hearts <= 0 || newPlayer2Hearts <= 0) {
        let winnerId: string | undefined;
        if (newPlayer1Hearts <= 0 && newPlayer2Hearts <= 0) {
          // Both at 0 - whoever had more score wins, else it's a draw (player1 wins ties)
          winnerId =
            match.player1Score >= match.player2Score
              ? match.player1Id
              : match.player2Id;
        } else if (newPlayer1Hearts <= 0) {
          winnerId = match.player2Id;
        } else {
          winnerId = match.player1Id;
        }

        await ctx.db.patch(args.matchId, {
          guesses: newGuesses,
          guessResults: newGuessResults,
          player1Hearts: newPlayer1Hearts,
          player2Hearts: newPlayer2Hearts,
          status: "finished",
          winnerId,
          updatedAt: Date.now(),
          player1CurrentGuess: undefined,
          player2CurrentGuess: undefined,
        });

        return {
          success: true,
          correct: false,
          matchOver: true,
          winnerId,
          bothLoseHeart: true,
        };
      }

      // Start new round - both lost a heart
      const difficulties = ["easy", "medium", "hard"];
      const randomDifficulty =
        difficulties[Math.floor(Math.random() * difficulties.length)];

      const words = await ctx.db
        .query("words")
        .withIndex("by_difficulty", (q) => q.eq("difficulty", randomDifficulty))
        .collect();

      let newWord = "mājas";
      if (words.length > 0) {
        newWord = words[Math.floor(Math.random() * words.length)].word;
      }

      const roundStarter =
        match.currentRound % 2 === 0 ? match.player2Id : match.player1Id;

      await ctx.db.patch(args.matchId, {
        guesses: [],
        guessResults: [],
        previousRoundWord: match.currentWord,
        currentWord: newWord,
        currentDifficulty: randomDifficulty,
        currentRound: match.currentRound + 1,
        currentTurn: roundStarter,
        turnStartedAt: Date.now(),
        player1Hearts: newPlayer1Hearts,
        player2Hearts: newPlayer2Hearts,
        updatedAt: Date.now(),
        player1CurrentGuess: undefined,
        player2CurrentGuess: undefined,
      });

      return {
        success: true,
        correct: false,
        newRound: true,
        bothLoseHeart: true,
      };
    }

    // Continue game - switch turns
    // Clear current player's typing since they just submitted
    const clearTypingField = isPlayer1 ? "player1CurrentGuess" : "player2CurrentGuess";
    await ctx.db.patch(args.matchId, {
      guesses: newGuesses,
      guessResults: newGuessResults,
      currentTurn: opponentId,
      turnStartedAt: Date.now(),
      updatedAt: Date.now(),
      [clearTypingField]: undefined,
    });

    return {
      success: true,
      correct: false,
    };
  },
});

// Skip turn (called when timer expires)
// Timer running out = empty guess + player loses a heart
export const skipTurn = mutation({
  args: {
    matchId: v.id("matches"),
    playerId: v.string(),
  },
  handler: async (ctx, args) => {
    const match = await ctx.db.get(args.matchId);

    if (!match || match.status !== "active") {
      return { success: false, error: "Invalid match" };
    }

    if (match.currentTurn !== args.playerId) {
      return { success: false, error: "Not your turn" };
    }

    const isPlayer1 = match.player1Id === args.playerId;
    const opponentId = isPlayer1 ? match.player2Id : match.player1Id;

    // Count as a wasted guess - empty string with all absent states
    const newGuesses = [...match.guesses, ""];
    const wordLength = match.currentWord.length;
    const emptyTileStates = new Array(wordLength).fill("absent");
    const newGuessResults = [...(match.guessResults || []), emptyTileStates];

    // Timer running out costs the player a heart
    const newPlayer1Hearts = isPlayer1
      ? match.player1Hearts - 1
      : match.player1Hearts;
    const newPlayer2Hearts = isPlayer1
      ? match.player2Hearts
      : match.player2Hearts - 1;

    // Check if match is over (player who timed out lost their last heart)
    if (newPlayer1Hearts <= 0 || newPlayer2Hearts <= 0) {
      const winnerId = newPlayer1Hearts <= 0 ? match.player2Id : match.player1Id;

      await ctx.db.patch(args.matchId, {
        guesses: newGuesses,
        guessResults: newGuessResults,
        player1Hearts: newPlayer1Hearts,
        player2Hearts: newPlayer2Hearts,
        status: "finished",
        winnerId,
        updatedAt: Date.now(),
        player1CurrentGuess: undefined,
        player2CurrentGuess: undefined,
      });

      return { success: true, matchOver: true, winnerId, timedOut: true };
    }

    // If 6 guesses reached, start new round (hearts already deducted above)
    if (newGuesses.length >= 6) {
      const difficulties = ["easy", "medium", "hard"];
      const randomDifficulty =
        difficulties[Math.floor(Math.random() * difficulties.length)];

      const words = await ctx.db
        .query("words")
        .withIndex("by_difficulty", (q) => q.eq("difficulty", randomDifficulty))
        .collect();

      let newWord = "mājas";
      if (words.length > 0) {
        newWord = words[Math.floor(Math.random() * words.length)].word;
      }

      const roundStarter =
        match.currentRound % 2 === 0 ? match.player2Id : match.player1Id;

      await ctx.db.patch(args.matchId, {
        guesses: [],
        guessResults: [],
        previousRoundWord: match.currentWord,
        currentWord: newWord,
        currentDifficulty: randomDifficulty,
        currentRound: match.currentRound + 1,
        currentTurn: roundStarter,
        turnStartedAt: Date.now(),
        player1Hearts: newPlayer1Hearts,
        player2Hearts: newPlayer2Hearts,
        updatedAt: Date.now(),
        player1CurrentGuess: undefined,
        player2CurrentGuess: undefined,
      });

      return { success: true, newRound: true, timedOut: true };
    }

    // Continue game - switch turns (heart already deducted)
    // Clear current player's typing since their turn ended
    const clearTypingField = isPlayer1 ? "player1CurrentGuess" : "player2CurrentGuess";
    await ctx.db.patch(args.matchId, {
      guesses: newGuesses,
      guessResults: newGuessResults,
      player1Hearts: newPlayer1Hearts,
      player2Hearts: newPlayer2Hearts,
      currentTurn: opponentId,
      turnStartedAt: Date.now(),
      updatedAt: Date.now(),
      [clearTypingField]: undefined,
    });

    return { success: true, timedOut: true };
  },
});

// Forfeit match (disconnect or manual)
export const forfeitMatch = mutation({
  args: {
    matchId: v.id("matches"),
    playerId: v.string(),
  },
  handler: async (ctx, args) => {
    const match = await ctx.db.get(args.matchId);

    if (!match || match.status !== "active") {
      return { success: false, error: "Invalid match" };
    }

    const isPlayer1 = match.player1Id === args.playerId;
    const winnerId = isPlayer1 ? match.player2Id : match.player1Id;

    await ctx.db.patch(args.matchId, {
      status: "finished",
      winnerId,
      updatedAt: Date.now(),
    });

    return { success: true, winnerId };
  },
});

// Request a rematch
export const requestRematch = mutation({
  args: {
    matchId: v.id("matches"),
    playerId: v.string(),
  },
  handler: async (ctx, args) => {
    const match = await ctx.db.get(args.matchId);

    if (!match) {
      return { success: false, error: "Match not found" };
    }

    if (match.status !== "finished") {
      return { success: false, error: "Match is not finished" };
    }

    // Already has a rematch match created
    if (match.rematchMatchId) {
      return { success: true, rematchMatchId: match.rematchMatchId };
    }

    const isPlayer1 = match.player1Id === args.playerId;
    const isPlayer2 = match.player2Id === args.playerId;

    if (!isPlayer1 && !isPlayer2) {
      return { success: false, error: "Not a player in this match" };
    }

    // Update rematch request
    if (isPlayer1) {
      await ctx.db.patch(args.matchId, { player1WantsRematch: true });
    } else {
      await ctx.db.patch(args.matchId, { player2WantsRematch: true });
    }

    // Check if both players want rematch
    const updatedMatch = await ctx.db.get(args.matchId);
    const p1Wants = isPlayer1 ? true : updatedMatch?.player1WantsRematch;
    const p2Wants = isPlayer2 ? true : updatedMatch?.player2WantsRematch;

    if (p1Wants && p2Wants) {
      // Both want rematch - create new match
      const words = await ctx.db
        .query("words")
        .withIndex("by_difficulty", (q) => q.eq("difficulty", match.currentDifficulty))
        .collect();

      const fallbackWords: Record<string, string> = {
        easy: "māja",
        medium: "vārds",
        hard: "draugs",
      };
      let word = fallbackWords[match.currentDifficulty] || "vārds";
      if (words.length > 0) {
        word = words[Math.floor(Math.random() * words.length)].word;
      }

      // Swap who goes first (opposite of original match)
      const hostGoesFirst = Math.random() < 0.5;

      const newMatchId = await ctx.db.insert("matches", {
        player1Id: match.player1Id,
        player2Id: match.player2Id,
        status: "active",
        currentWord: word,
        currentDifficulty: match.currentDifficulty,
        currentRound: 1,
        currentTurn: hostGoesFirst ? match.player1Id : match.player2Id,
        turnStartedAt: Date.now(),
        guesses: [],
        guessResults: [],
        player1Hearts: 3,
        player2Hearts: 3,
        player1Score: 0,
        player2Score: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Update original match with rematch ID
      await ctx.db.patch(args.matchId, { rematchMatchId: newMatchId });

      return { success: true, rematchMatchId: newMatchId, rematchStarted: true };
    }

    return { success: true, waiting: true };
  },
});

// Cancel rematch request
export const cancelRematch = mutation({
  args: {
    matchId: v.id("matches"),
    playerId: v.string(),
  },
  handler: async (ctx, args) => {
    const match = await ctx.db.get(args.matchId);

    if (!match) {
      return { success: false, error: "Match not found" };
    }

    const isPlayer1 = match.player1Id === args.playerId;
    const isPlayer2 = match.player2Id === args.playerId;

    if (!isPlayer1 && !isPlayer2) {
      return { success: false, error: "Not a player in this match" };
    }

    if (isPlayer1) {
      await ctx.db.patch(args.matchId, { player1WantsRematch: false });
    } else {
      await ctx.db.patch(args.matchId, { player2WantsRematch: false });
    }

    return { success: true };
  },
});

// Leave match (player exits after match is finished)
export const leaveMatch = mutation({
  args: {
    matchId: v.id("matches"),
    playerId: v.string(),
  },
  handler: async (ctx, args) => {
    const match = await ctx.db.get(args.matchId);

    if (!match) {
      return { success: false, error: "Match not found" };
    }

    if (match.status !== "finished") {
      return { success: false, error: "Match is not finished" };
    }

    const isPlayer1 = match.player1Id === args.playerId;
    const isPlayer2 = match.player2Id === args.playerId;

    if (!isPlayer1 && !isPlayer2) {
      return { success: false, error: "Not a player in this match" };
    }

    // Mark player as having left
    if (isPlayer1) {
      await ctx.db.patch(args.matchId, { player1Left: true });
    } else {
      await ctx.db.patch(args.matchId, { player2Left: true });
    }

    return { success: true };
  },
});

// Update typing status (for live typing indicator)
export const updateTypingStatus = mutation({
  args: {
    matchId: v.id("matches"),
    playerId: v.string(),
    currentGuess: v.string(),
  },
  handler: async (ctx, args) => {
    const match = await ctx.db.get(args.matchId);
    if (!match || match.status !== "active") return;

    const isPlayer1 = match.player1Id === args.playerId;

    await ctx.db.patch(args.matchId, {
      [isPlayer1 ? "player1CurrentGuess" : "player2CurrentGuess"]: args.currentGuess,
    });
  },
});

// Get recent matches for a player
export const getPlayerMatches = query({
  args: {
    playerId: v.string(),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    const asPlayer1 = await ctx.db
      .query("matches")
      .withIndex("by_player", (q) => q.eq("player1Id", args.playerId))
      .filter((q) => q.eq(q.field("status"), "finished"))
      .order("desc")
      .take(args.limit);

    const asPlayer2 = await ctx.db
      .query("matches")
      .withIndex("by_player2", (q) => q.eq("player2Id", args.playerId))
      .filter((q) => q.eq(q.field("status"), "finished"))
      .order("desc")
      .take(args.limit);

    // Combine and sort by createdAt
    const allMatches = [...asPlayer1, ...asPlayer2];
    allMatches.sort((a, b) => b.createdAt - a.createdAt);

    return allMatches.slice(0, args.limit);
  },
});
