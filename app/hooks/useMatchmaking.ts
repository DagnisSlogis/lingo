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

  // Queries - use type assertion for new API endpoints
  const queueStatus = useQuery((api as any).matchmaking?.getStatus, { playerId });
  const queueCount = useQuery((api as any).matchmaking?.getQueueCount);

  // Mutations - use type assertion for new API endpoints
  const joinQueueMutation = useMutation((api as any).matchmaking?.joinQueue);
  const leaveQueueMutation = useMutation((api as any).matchmaking?.leaveQueue);
  const clearMatchmakingMutation = useMutation((api as any).matchmaking?.clearMatchmaking);
  const getOrCreatePlayerMutation = useMutation((api as any).players?.getOrCreatePlayer);

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
      if (getOrCreatePlayerMutation) {
        await getOrCreatePlayerMutation({ playerId, name: playerName });
      }

      // Join the matchmaking queue
      if (joinQueueMutation) {
        const result = await joinQueueMutation({ playerId });

        if (result.status === "matched" && result.matchId) {
          setMatchId(result.matchId as string);
          return { matched: true, matchId: result.matchId };
        }
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
      if (leaveQueueMutation) {
        await leaveQueueMutation({ playerId });
      }
      setIsSearching(false);
      setMatchId(null);
    } catch (error) {
      console.error("Failed to leave queue:", error);
    }
  }, [leaveQueueMutation, playerId]);

  const clearMatchmaking = useCallback(async () => {
    try {
      if (clearMatchmakingMutation) {
        await clearMatchmakingMutation({ playerId });
      }
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
