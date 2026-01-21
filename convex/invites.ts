import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Generate a random 5-digit invite code
function generateInviteCode(): string {
  return Math.floor(10000 + Math.random() * 90000).toString();
}

// Create a new invite
export const createInvite = mutation({
  args: {
    playerId: v.string(),
    playerName: v.string(),
    difficulty: v.string(),
  },
  handler: async (ctx, args) => {
    // Cancel any existing waiting invites from this host
    const existingInvites = await ctx.db
      .query("invites")
      .withIndex("by_host", (q) => q.eq("hostPlayerId", args.playerId))
      .filter((q) => q.eq(q.field("status"), "waiting"))
      .collect();

    for (const invite of existingInvites) {
      await ctx.db.patch(invite._id, { status: "cancelled" });
    }

    // Generate a unique invite code
    let inviteCode = generateInviteCode();
    let attempts = 0;

    // Ensure code is unique among active invites
    while (attempts < 10) {
      const existing = await ctx.db
        .query("invites")
        .withIndex("by_code", (q) => q.eq("inviteCode", inviteCode))
        .filter((q) => q.eq(q.field("status"), "waiting"))
        .first();

      if (!existing) break;
      inviteCode = generateInviteCode();
      attempts++;
    }

    // Create the invite
    const inviteId = await ctx.db.insert("invites", {
      inviteCode,
      hostPlayerId: args.playerId,
      hostPlayerName: args.playerName,
      status: "waiting",
      difficulty: args.difficulty,
      createdAt: Date.now(),
    });

    return {
      inviteId,
      inviteCode,
    };
  },
});

// Get invite by code
export const getInvite = query({
  args: {
    inviteCode: v.string(),
  },
  handler: async (ctx, args) => {
    const invite = await ctx.db
      .query("invites")
      .withIndex("by_code", (q) => q.eq("inviteCode", args.inviteCode))
      .filter((q) => q.eq(q.field("status"), "waiting"))
      .first();

    return invite;
  },
});

// Get invite by host player ID (for checking status)
export const getInviteByHost = query({
  args: {
    hostPlayerId: v.string(),
  },
  handler: async (ctx, args) => {
    const invite = await ctx.db
      .query("invites")
      .withIndex("by_host", (q) => q.eq("hostPlayerId", args.hostPlayerId))
      .order("desc")
      .first();

    return invite;
  },
});

// Join an invite and create a match
export const joinInvite = mutation({
  args: {
    inviteCode: v.string(),
    playerId: v.string(),
    playerName: v.string(),
  },
  handler: async (ctx, args) => {
    // Find the invite
    const invite = await ctx.db
      .query("invites")
      .withIndex("by_code", (q) => q.eq("inviteCode", args.inviteCode))
      .filter((q) => q.eq(q.field("status"), "waiting"))
      .first();

    if (!invite) {
      return { success: false, error: "Invite not found or expired" };
    }

    // Prevent joining own invite
    if (invite.hostPlayerId === args.playerId) {
      return { success: false, error: "Cannot join your own invite" };
    }

    // Get a random word for this match
    const words = await ctx.db
      .query("words")
      .withIndex("by_difficulty", (q) => q.eq("difficulty", invite.difficulty))
      .collect();

    let word = "vārds"; // Fallback
    if (words.length > 0) {
      word = words[Math.floor(Math.random() * words.length)].word;
    }

    // Randomly decide who goes first
    const hostGoesFirst = Math.random() < 0.5;

    // Create the match
    const matchId = await ctx.db.insert("matches", {
      player1Id: invite.hostPlayerId,
      player2Id: args.playerId,
      status: "active",
      currentWord: word,
      currentDifficulty: invite.difficulty,
      currentRound: 1,
      currentTurn: hostGoesFirst ? invite.hostPlayerId : args.playerId,
      guesses: [],
      player1Hearts: 3,
      player2Hearts: 3,
      player1Score: 0,
      player2Score: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Update invite status
    await ctx.db.patch(invite._id, {
      status: "matched",
      matchId,
    });

    return {
      success: true,
      matchId,
    };
  },
});

// Cancel an invite (called when host leaves the screen)
export const cancelInvite = mutation({
  args: {
    inviteCode: v.string(),
    playerId: v.string(),
  },
  handler: async (ctx, args) => {
    const invite = await ctx.db
      .query("invites")
      .withIndex("by_code", (q) => q.eq("inviteCode", args.inviteCode))
      .filter((q) => q.eq(q.field("status"), "waiting"))
      .first();

    if (!invite) {
      return { success: false, error: "Invite not found" };
    }

    // Only the host can cancel
    if (invite.hostPlayerId !== args.playerId) {
      return { success: false, error: "Not authorized" };
    }

    await ctx.db.patch(invite._id, {
      status: "cancelled",
    });

    return { success: true };
  },
});

// Cancel all waiting invites for a host (cleanup)
export const cancelAllInvites = mutation({
  args: {
    playerId: v.string(),
  },
  handler: async (ctx, args) => {
    const invites = await ctx.db
      .query("invites")
      .withIndex("by_host", (q) => q.eq("hostPlayerId", args.playerId))
      .filter((q) => q.eq(q.field("status"), "waiting"))
      .collect();

    for (const invite of invites) {
      await ctx.db.patch(invite._id, { status: "cancelled" });
    }

    return { cancelled: invites.length };
  },
});
