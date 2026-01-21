import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Join the matchmaking queue
export const joinQueue = mutation({
  args: {
    playerId: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if player is already in queue
    const existing = await ctx.db
      .query("matchmaking")
      .withIndex("by_player", (q) => q.eq("playerId", args.playerId))
      .first();

    if (existing) {
      // If already matched, return the match info
      if (existing.status === "matched" && existing.matchId) {
        return { status: "matched", matchId: existing.matchId };
      }
      // Already searching
      return { status: "searching", queueId: existing._id };
    }

    // Look for another player waiting in queue
    const waitingPlayer = await ctx.db
      .query("matchmaking")
      .withIndex("by_status", (q) => q.eq("status", "searching"))
      .first();

    if (waitingPlayer && waitingPlayer.playerId !== args.playerId) {
      // Found a match! Create a new match
      const difficulties = ["easy", "medium", "hard"];
      const randomDifficulty =
        difficulties[Math.floor(Math.random() * difficulties.length)];

      // Get a random word for this match
      const words = await ctx.db
        .query("words")
        .withIndex("by_difficulty", (q) => q.eq("difficulty", randomDifficulty))
        .collect();

      // Fallback words by difficulty: easy=4, medium=5, hard=6 letters
      const fallbackWords: Record<string, string> = {
        easy: "māja",
        medium: "vārds",
        hard: "draugs",
      };
      let word = fallbackWords[randomDifficulty] || "vārds";
      if (words.length > 0) {
        word = words[Math.floor(Math.random() * words.length)].word;
      }

      // Randomly decide who goes first
      const player1GoesFirst = Math.random() < 0.5;
      const player1Id = waitingPlayer.playerId;
      const player2Id = args.playerId;

      const matchId = await ctx.db.insert("matches", {
        player1Id,
        player2Id,
        status: "active",
        currentWord: word,
        currentDifficulty: randomDifficulty,
        currentRound: 1,
        currentTurn: player1GoesFirst ? player1Id : player2Id,
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

      // Update waiting player's status
      await ctx.db.patch(waitingPlayer._id, {
        status: "matched",
        matchId: matchId,
      });

      // Add current player to matchmaking with matched status
      await ctx.db.insert("matchmaking", {
        playerId: args.playerId,
        status: "matched",
        matchId: matchId,
        createdAt: Date.now(),
      });

      return { status: "matched", matchId };
    }

    // No match found, add to queue
    const queueId = await ctx.db.insert("matchmaking", {
      playerId: args.playerId,
      status: "searching",
      createdAt: Date.now(),
    });

    return { status: "searching", queueId };
  },
});

// Leave the matchmaking queue
export const leaveQueue = mutation({
  args: {
    playerId: v.string(),
  },
  handler: async (ctx, args) => {
    const entry = await ctx.db
      .query("matchmaking")
      .withIndex("by_player", (q) => q.eq("playerId", args.playerId))
      .first();

    if (entry && entry.status === "searching") {
      await ctx.db.delete(entry._id);
      return { success: true };
    }

    return { success: false };
  },
});

// Get player's matchmaking status
export const getStatus = query({
  args: {
    playerId: v.string(),
  },
  handler: async (ctx, args) => {
    const entry = await ctx.db
      .query("matchmaking")
      .withIndex("by_player", (q) => q.eq("playerId", args.playerId))
      .first();

    if (!entry) {
      return { status: "none" };
    }

    return {
      status: entry.status,
      matchId: entry.matchId,
      queuedAt: entry.createdAt,
    };
  },
});

// Clear matchmaking entry after match is found (cleanup)
export const clearMatchmaking = mutation({
  args: {
    playerId: v.string(),
  },
  handler: async (ctx, args) => {
    const entries = await ctx.db
      .query("matchmaking")
      .withIndex("by_player", (q) => q.eq("playerId", args.playerId))
      .collect();

    for (const entry of entries) {
      await ctx.db.delete(entry._id);
    }

    return { success: true };
  },
});

// Get queue count (for display)
export const getQueueCount = query({
  args: {},
  handler: async (ctx) => {
    const entries = await ctx.db
      .query("matchmaking")
      .withIndex("by_status", (q) => q.eq("status", "searching"))
      .collect();

    return entries.length;
  },
});
