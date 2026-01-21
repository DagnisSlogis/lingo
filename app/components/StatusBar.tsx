import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function StatusBar() {
  const [playerId] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("lingo_player_id") || "";
    }
    return "";
  });

  const [playerName] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("lingo_player_name") || "Spēlētājs";
    }
    return "Spēlētājs";
  });

  const streakInfo = useQuery(
    api.players.getPlayerStreak,
    playerId ? { playerId } : "skip"
  );

  const rankedStats = useQuery(
    api.players.getPlayerRankedStats,
    playerId ? { playerId } : "skip"
  );

  return (
    <div className="status-bar">
      <div className="status-panel status-name">
        {playerName}
      </div>
      <div className="status-panel status-streak">
        <img src="/img/flame.svg" alt="streak" width={20} height={20} className="status-icon" />
        {streakInfo?.dailyStreak ?? 0}
      </div>
      <div className="status-panel status-rank">
        #{rankedStats?.rank ?? "—"}
      </div>
    </div>
  );
}
