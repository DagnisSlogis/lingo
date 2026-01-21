import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { generatePlayerName, generatePlayerId } from "~/lib/nameGenerator";

export function useMatchmaking() {
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

  const [isSearching, setIsSearching] = useState(false);
  const [matchId, setMatchId] = useState<string | null>(null);

  // Queries
  const queueStatus = useQuery(api.matchmaking.getStatus, { playerId });
  const queueCount = useQuery(api.matchmaking.getQueueCount);

  // Mutations
  const joinQueueMutation = useMutation(api.matchmaking.joinQueue);
  const leaveQueueMutation = useMutation(api.matchmaking.leaveQueue);
  const clearMatchmakingMutation = useMutation(api.matchmaking.clearMatchmaking);
  const getOrCreatePlayerMutation = useMutation(api.players.getOrCreatePlayer);

  // Handle queue status changes from real-time subscription
  useEffect(() => {
    if (queueStatus?.status === "matched" && queueStatus.matchId) {
      setMatchId(queueStatus.matchId as string);
      setIsSearching(false);
    } else if (queueStatus?.status === "searching") {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
  }, [queueStatus]);

  const joinQueue = useCallback(async () => {
    try {
      // Ensure player exists in players table
      await getOrCreatePlayerMutation({ playerId, name: playerName });

      // Join the matchmaking queue
      const result = await joinQueueMutation({ playerId });

      if (result.status === "matched" && result.matchId) {
        setMatchId(result.matchId as string);
        return { matched: true, matchId: result.matchId };
      }

      setIsSearching(true);
      return { matched: false };
    } catch (error) {
      console.error("Failed to join queue:", error);
      return { matched: false, error };
    }
  }, [joinQueueMutation, getOrCreatePlayerMutation, playerId, playerName]);

  const leaveQueue = useCallback(async () => {
    try {
      await leaveQueueMutation({ playerId });
      setIsSearching(false);
      setMatchId(null);
    } catch (error) {
      console.error("Failed to leave queue:", error);
    }
  }, [leaveQueueMutation, playerId]);

  const clearMatchmaking = useCallback(async () => {
    try {
      await clearMatchmakingMutation({ playerId });
      setIsSearching(false);
      setMatchId(null);
    } catch (error) {
      console.error("Failed to clear matchmaking:", error);
    }
  }, [clearMatchmakingMutation, playerId]);

  return {
    playerId,
    playerName,
    isSearching,
    matchId,
    queueCount: queueCount ?? 0,
    joinQueue,
    leaveQueue,
    clearMatchmaking,
  };
}
