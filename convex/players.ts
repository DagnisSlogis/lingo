import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get or create a player
export const getOrCreatePlayer = mutation({
  args: {
    playerId: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("players")
      .withIndex("by_player_id", (q) => q.eq("playerId", args.playerId))
      .first();

    if (existing) {
      return existing;
    }

    // Create new player with starting rating of 1000
    const id = await ctx.db.insert("players", {
      playerId: args.playerId,
      name: args.name,
      rankedRating: 1000,
      rankedWins: 0,
      rankedLosses: 0,
      createdAt: Date.now(),
    });

    return await ctx.db.get(id);
  },
});

// Get player by ID
export const getPlayer = query({
  args: {
    playerId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("players")
      .withIndex("by_player_id", (q) => q.eq("playerId", args.playerId))
      .first();
  },
});

// Update player rating after a match
export const updateRating = mutation({
  args: {
    playerId: v.string(),
    won: v.boolean(),
    opponentRating: v.number(),
  },
  handler: async (ctx, args) => {
    const player = await ctx.db
      .query("players")
      .withIndex("by_player_id", (q) => q.eq("playerId", args.playerId))
      .first();

    if (!player) {
      return { success: false, error: "Player not found" };
    }

    // Simple ELO-like rating calculation
    const K = 32; // K-factor
    const expectedScore =
      1 / (1 + Math.pow(10, (args.opponentRating - player.rankedRating) / 400));
    const actualScore = args.won ? 1 : 0;
    const ratingChange = Math.round(K * (actualScore - expectedScore));

    const newRating = Math.max(0, player.rankedRating + ratingChange);

    await ctx.db.patch(player._id, {
      rankedRating: newRating,
      rankedWins: args.won ? player.rankedWins + 1 : player.rankedWins,
      rankedLosses: args.won ? player.rankedLosses : player.rankedLosses + 1,
    });

    return {
      success: true,
      oldRating: player.rankedRating,
      newRating,
      change: ratingChange,
    };
  },
});

// Get ranked leaderboard
export const getRankedLeaderboard = query({
  args: {
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    // Get all players and sort by rating
    const players = await ctx.db.query("players").collect();

    // Sort by rating descending
    players.sort((a, b) => b.rankedRating - a.rankedRating);

    return players.slice(0, args.limit);
  },
});

// Get player stats for display
export const getPlayerRankedStats = query({
  args: {
    playerId: v.string(),
  },
  handler: async (ctx, args) => {
    const player = await ctx.db
      .query("players")
      .withIndex("by_player_id", (q) => q.eq("playerId", args.playerId))
      .first();

    if (!player) {
      return null;
    }

    // Calculate win rate
    const totalGames = player.rankedWins + player.rankedLosses;
    const winRate =
      totalGames > 0
        ? Math.round((player.rankedWins / totalGames) * 100)
        : 0;

    // Get rank position
    const allPlayers = await ctx.db.query("players").collect();
    allPlayers.sort((a, b) => b.rankedRating - a.rankedRating);
    const rank = allPlayers.findIndex((p) => p.playerId === args.playerId) + 1;

    return {
      ...player,
      winRate,
      rank,
      totalGames,
    };
  },
});
