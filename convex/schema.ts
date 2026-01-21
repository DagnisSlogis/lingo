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
    player1Hearts: v.number(),
    player2Hearts: v.number(),
    player1Score: v.number(),
    player2Score: v.number(),
    winnerId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
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
