import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

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

// Update both players' ratings after a match (idempotent - safe to call multiple times)
export const updateMatchRatings = mutation({
  args: {
    matchId: v.id("matches"),
  },
  handler: async (ctx, args) => {
    const match = await ctx.db.get(args.matchId);

    if (!match) {
      return { success: false, error: "Match not found" };
    }

    // Check if ratings already updated (idempotency check)
    if (match.ratingsUpdated) {
      return { success: true, alreadyUpdated: true };
    }

    if (match.status !== "finished") {
      return { success: false, error: "Match not finished" };
    }

    // Handle draw - no rating changes, just mark as processed
    if (match.isDraw) {
      await ctx.db.patch(args.matchId, {
        ratingsUpdated: true,
      });
      return { success: true, isDraw: true, player1Change: 0, player2Change: 0 };
    }

    // For non-draw matches, winnerId is required
    if (!match.winnerId) {
      return { success: false, error: "Match has no winner" };
    }

    // Get both players
    const player1 = await ctx.db
      .query("players")
      .withIndex("by_player_id", (q) => q.eq("playerId", match.player1Id))
      .first();

    const player2 = await ctx.db
      .query("players")
      .withIndex("by_player_id", (q) => q.eq("playerId", match.player2Id))
      .first();

    if (!player1 || !player2) {
      return { success: false, error: "Players not found" };
    }

    const player1Won = match.winnerId === match.player1Id;

    // Calculate ELO changes
    const K = 32;

    const player1Expected = 1 / (1 + Math.pow(10, (player2.rankedRating - player1.rankedRating) / 400));
    const player1Actual = player1Won ? 1 : 0;
    const player1Change = Math.round(K * (player1Actual - player1Expected));

    const player2Expected = 1 / (1 + Math.pow(10, (player1.rankedRating - player2.rankedRating) / 400));
    const player2Actual = player1Won ? 0 : 1;
    const player2Change = Math.round(K * (player2Actual - player2Expected));

    // Update both players
    await ctx.db.patch(player1._id, {
      rankedRating: Math.max(0, player1.rankedRating + player1Change),
      rankedWins: player1Won ? player1.rankedWins + 1 : player1.rankedWins,
      rankedLosses: player1Won ? player1.rankedLosses : player1.rankedLosses + 1,
    });

    await ctx.db.patch(player2._id, {
      rankedRating: Math.max(0, player2.rankedRating + player2Change),
      rankedWins: player1Won ? player2.rankedWins : player2.rankedWins + 1,
      rankedLosses: player1Won ? player2.rankedLosses + 1 : player2.rankedLosses,
    });

    // Mark ratings as updated (idempotency flag)
    await ctx.db.patch(args.matchId, {
      ratingsUpdated: true,
    });

    return {
      success: true,
      player1Change,
      player2Change,
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

// Helper function to get start of day in UTC
function getUtcDayStart(timestamp: number): number {
  const date = new Date(timestamp);
  date.setUTCHours(0, 0, 0, 0);
  return date.getTime();
}

// Record a game win and update streak
export const recordGameWin = mutation({
  args: {
    playerId: v.string(),
    playerName: v.string(),
    difficulty: v.string(),
  },
  handler: async (ctx, args) => {
    let player = await ctx.db
      .query("players")
      .withIndex("by_player_id", (q) => q.eq("playerId", args.playerId))
      .first();

    const now = Date.now();
    const todayStart = getUtcDayStart(now);

    if (!player) {
      // Create new player with initial streak
      const id = await ctx.db.insert("players", {
        playerId: args.playerId,
        name: args.playerName,
        rankedRating: 1000,
        rankedWins: 0,
        rankedLosses: 0,
        createdAt: now,
        dailyStreak: 1,
        lastPlayedAt: now,
        longestStreak: 1,
        totalGamesPlayed: 1,
        totalWins: 1,
        lastDifficulty: args.difficulty,
      });
      return await ctx.db.get(id);
    }

    const lastPlayedDayStart = player.lastPlayedAt
      ? getUtcDayStart(player.lastPlayedAt)
      : 0;

    let newStreak = player.dailyStreak ?? 0;
    const yesterdayStart = todayStart - 24 * 60 * 60 * 1000;

    // Calculate streak
    if (lastPlayedDayStart === todayStart) {
      // Already played today - streak stays the same
    } else if (lastPlayedDayStart === yesterdayStart) {
      // Played yesterday - increment streak
      newStreak++;
    } else {
      // Missed a day - reset streak to 1
      newStreak = 1;
    }

    const newLongestStreak = Math.max(player.longestStreak ?? 0, newStreak);

    await ctx.db.patch(player._id, {
      dailyStreak: newStreak,
      lastPlayedAt: now,
      longestStreak: newLongestStreak,
      totalGamesPlayed: (player.totalGamesPlayed ?? 0) + 1,
      totalWins: (player.totalWins ?? 0) + 1,
      lastDifficulty: args.difficulty,
    });

    return await ctx.db.get(player._id);
  },
});

// Update last played difficulty (for quick play)
export const updateLastDifficulty = mutation({
  args: {
    playerId: v.string(),
    difficulty: v.string(),
  },
  handler: async (ctx, args) => {
    const player = await ctx.db
      .query("players")
      .withIndex("by_player_id", (q) => q.eq("playerId", args.playerId))
      .first();

    if (player) {
      await ctx.db.patch(player._id, {
        lastDifficulty: args.difficulty,
      });
    }

    return { success: true };
  },
});

// Reset player solo stats (keeps ranked stats intact)
export const resetPlayerSoloStats = mutation({
  args: {
    playerId: v.string(),
  },
  handler: async (ctx, args) => {
    const player = await ctx.db
      .query("players")
      .withIndex("by_player_id", (q) => q.eq("playerId", args.playerId))
      .first();

    if (!player) {
      return { success: false, error: "Player not found" };
    }

    await ctx.db.patch(player._id, {
      totalGamesPlayed: 0,
      totalWins: 0,
      dailyStreak: 0,
      longestStreak: 0,
    });

    return { success: true };
  },
});

// Get player streak info
export const getPlayerStreak = query({
  args: {
    playerId: v.string(),
  },
  handler: async (ctx, args) => {
    const player = await ctx.db
      .query("players")
      .withIndex("by_player_id", (q) => q.eq("playerId", args.playerId))
      .first();

    if (!player) {
      return {
        dailyStreak: 0,
        longestStreak: 0,
        lastDifficulty: null,
      };
    }

    // Check if streak is still valid
    const now = Date.now();
    const todayStart = getUtcDayStart(now);
    const lastPlayedDayStart = player.lastPlayedAt
      ? getUtcDayStart(player.lastPlayedAt)
      : 0;
    const yesterdayStart = todayStart - 24 * 60 * 60 * 1000;

    let currentStreak = player.dailyStreak ?? 0;

    // If last played was before yesterday, streak is broken
    if (lastPlayedDayStart < yesterdayStart) {
      currentStreak = 0;
    }

    return {
      dailyStreak: currentStreak,
      longestStreak: player.longestStreak ?? 0,
      lastDifficulty: player.lastDifficulty ?? null,
    };
  },
});

