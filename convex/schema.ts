import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  words: defineTable({
    word: v.string(),
    length: v.number(),
    difficulty: v.string(), // "easy" | "medium" | "hard"
  })
    .index("by_difficulty", ["difficulty"])
    .index("by_length", ["length"])
    .index("by_difficulty_word", ["difficulty", "word"]),

  leaderboard: defineTable({
    playerId: v.string(),
    playerName: v.string(),
    score: v.number(),
    difficulty: v.string(),
    gamesWon: v.number(),
    createdAt: v.number(),
  })
    .index("by_difficulty_score", ["difficulty", "score"])
    .index("by_player", ["playerId"]),

  players: defineTable({
    playerId: v.string(),
    name: v.string(),
    rankedRating: v.number(),
    rankedWins: v.number(),
    rankedLosses: v.number(),
    createdAt: v.number(),
    // Streak and engagement fields
    dailyStreak: v.optional(v.number()),
    lastPlayedAt: v.optional(v.number()),
    longestStreak: v.optional(v.number()),
    totalGamesPlayed: v.optional(v.number()),
    totalWins: v.optional(v.number()),
    // Quick play - remembers last difficulty
    lastDifficulty: v.optional(v.string()),
  }).index("by_player_id", ["playerId"]),

  matches: defineTable({
    player1Id: v.string(),
    player2Id: v.string(),
    status: v.string(), // "waiting" | "active" | "finished"
    currentWord: v.string(),
    currentDifficulty: v.string(),
    currentRound: v.number(),
    currentTurn: v.string(),
    guesses: v.array(v.string()),
    // Store tile states for each guess (array of arrays: ["correct", "present", "absent", ...])
    guessResults: v.optional(v.array(v.array(v.string()))),
    // Previous round's word (revealed after round ends for display)
    previousRoundWord: v.optional(v.string()),
    player1Hearts: v.number(),
    player2Hearts: v.number(),
    player1Score: v.number(),
    player2Score: v.number(),
    winnerId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    // Rematch tracking
    player1WantsRematch: v.optional(v.boolean()),
    player2WantsRematch: v.optional(v.boolean()),
    rematchMatchId: v.optional(v.id("matches")),
    // Track if ratings have been updated (prevents duplicate updates)
    ratingsUpdated: v.optional(v.boolean()),
    // Live typing - shows what opponent is currently typing
    player1CurrentGuess: v.optional(v.string()),
    player2CurrentGuess: v.optional(v.string()),
    // Timer sync - timestamp when current turn started
    turnStartedAt: v.optional(v.number()),
    // Track if player left the match (for rematch flow)
    player1Left: v.optional(v.boolean()),
    player2Left: v.optional(v.boolean()),
  })
    .index("by_status", ["status"])
    .index("by_player", ["player1Id"])
    .index("by_player2", ["player2Id"]),

  matchmaking: defineTable({
    playerId: v.string(),
    status: v.string(), // "searching" | "matched"
    matchId: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_player", ["playerId"]),

  invites: defineTable({
    inviteCode: v.string(),      // 5 digits (e.g., "48271")
    hostPlayerId: v.string(),
    hostPlayerName: v.string(),
    status: v.string(),          // "waiting" | "matched" | "cancelled"
    matchId: v.optional(v.id("matches")),
    difficulty: v.string(),      // Host chooses difficulty
    createdAt: v.number(),
  })
    .index("by_code", ["inviteCode"])
    .index("by_host", ["hostPlayerId"])
    .index("by_status", ["status"]),
});
