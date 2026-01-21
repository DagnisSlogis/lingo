import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getTop = query({
  args: {
    difficulty: v.string(),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    const entries = await ctx.db
      .query("leaderboard")
      .withIndex("by_difficulty_score", (q) => q.eq("difficulty", args.difficulty))
      .order("desc")
      .take(args.limit);

    return entries;
  },
});

export const submitScore = mutation({
  args: {
    playerId: v.string(),
    playerName: v.string(),
    score: v.number(),
    difficulty: v.string(),
    gamesWon: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if player already has an entry for this difficulty
    const existing = await ctx.db
      .query("leaderboard")
      .withIndex("by_player", (q) => q.eq("playerId", args.playerId))
      .filter((q) => q.eq(q.field("difficulty"), args.difficulty))
      .first();

    if (existing) {
      // Only update if new score is higher
      if (args.score > existing.score) {
        await ctx.db.patch(existing._id, {
          score: args.score,
          gamesWon: existing.gamesWon + args.gamesWon,
          createdAt: Date.now(),
        });
      } else {
        // Just increment games won
        await ctx.db.patch(existing._id, {
          gamesWon: existing.gamesWon + args.gamesWon,
        });
      }
      return existing._id;
    }

    // Create new entry
    return await ctx.db.insert("leaderboard", {
      playerId: args.playerId,
      playerName: args.playerName,
      score: args.score,
      difficulty: args.difficulty,
      gamesWon: args.gamesWon,
      createdAt: Date.now(),
    });
  },
});

export const getPlayerStats = query({
  args: {
    playerId: v.string(),
  },
  handler: async (ctx, args) => {
    const entries = await ctx.db
      .query("leaderboard")
      .withIndex("by_player", (q) => q.eq("playerId", args.playerId))
      .collect();

    return entries;
  },
});

// Clear all leaderboard data (for migration to new difficulties)
export const clearAllLeaderboard = mutation({
  args: {},
  handler: async (ctx) => {
    const allEntries = await ctx.db.query("leaderboard").collect();

    for (const entry of allEntries) {
      await ctx.db.delete(entry._id);
    }

    return { deleted: allEntries.length };
  },
});
