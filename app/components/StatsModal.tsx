import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface StatsModalProps {
  onClose: () => void;
  playerId: string;
}

export function StatsModal({ onClose, playerId }: StatsModalProps) {
  const [activeTab, setActiveTab] = useState<"solo" | "ranked" | "global">("solo");

  const soloStats = useQuery(api.leaderboard.getPlayerStats, { playerId });
  const rankedStats = useQuery(api.players.getPlayerRankedStats, { playerId });
  const playerData = useQuery(api.players.getPlayer, { playerId });

  // Calculate solo stats
  const totalSoloGames = soloStats?.reduce((acc, s) => acc + s.gamesWon, 0) ?? 0;
  const totalSoloScore = soloStats?.reduce((acc, s) => acc + s.score, 0) ?? 0;

  // Find most played difficulty
  const difficultyLabels: Record<string, string> = {
    easy: "Viegls",
    medium: "Klasiskais",
    hard: "Grūts"
  };

  const mostPlayedDifficulty = soloStats?.reduce((max, s) =>
    !max || s.gamesWon > max.gamesWon ? s : max,
    null as (typeof soloStats)[number] | null
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="win95-window modal stats-modal" onClick={(e) => e.stopPropagation()}>
        <div className="title-bar">
          <div className="title-bar-text">Statistika</div>
          <div className="title-bar-controls">
            <button
              aria-label="Close"
              className="title-bar-button close-button"
              onClick={onClose}
            >
              <span className="close-icon">×</span>
            </button>
          </div>
        </div>
        <div className="window-body modal-body">
          <div className="difficulty-tabs">
            <button
              className={`win95-button tab-button ${activeTab === "solo" ? "active" : ""}`}
              onClick={() => setActiveTab("solo")}
            >
              Solo
            </button>
            <button
              className={`win95-button tab-button ${activeTab === "ranked" ? "active" : ""}`}
              onClick={() => setActiveTab("ranked")}
            >
              Duelis
            </button>
            <button
              className={`win95-button tab-button ${activeTab === "global" ? "active" : ""}`}
              onClick={() => setActiveTab("global")}
            >
              Kopējais
            </button>
          </div>

          {activeTab === "solo" && (
            <div className="stats-content">
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Kopā spēles</span>
                  <span className="stat-value">{totalSoloGames}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Kopā punkti</span>
                  <span className="stat-value">{totalSoloScore}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Iecienītākais līmenis</span>
                  <span className="stat-value">
                    {mostPlayedDifficulty
                      ? difficultyLabels[mostPlayedDifficulty.difficulty] || mostPlayedDifficulty.difficulty
                      : "-"}
                  </span>
                </div>
              </div>

              {soloStats && soloStats.length > 0 && (
                <div className="stats-breakdown">
                  <h4>Pa grūtības līmeņiem:</h4>
                  {soloStats.map((stat) => (
                    <div key={stat.difficulty} className="breakdown-row">
                      <span>{difficultyLabels[stat.difficulty] || stat.difficulty}</span>
                      <span>{stat.gamesWon} spēles, {stat.score} punkti</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "ranked" && (
            <div className="stats-content">
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Kopā mači</span>
                  <span className="stat-value">{rankedStats?.totalGames ?? 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Uzvaras %</span>
                  <span className="stat-value">{rankedStats?.winRate ?? 0}%</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Reitings</span>
                  <span className="stat-value">{rankedStats?.rankedRating ?? 1000}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Vieta</span>
                  <span className="stat-value">#{rankedStats?.rank ?? "-"}</span>
                </div>
              </div>

              <div className="stats-breakdown">
                <div className="breakdown-row">
                  <span>Uzvaras</span>
                  <span>{rankedStats?.rankedWins ?? 0}</span>
                </div>
                <div className="breakdown-row">
                  <span>Zaudējumi</span>
                  <span>{rankedStats?.rankedLosses ?? 0}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "global" && (
            <div className="stats-content">
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Dienas sērija</span>
                  <span className="stat-value streak-display">
                    {playerData?.dailyStreak ?? 0}
                    {(playerData?.dailyStreak ?? 0) > 0 && (
                      <img src="/img/flame.svg" alt="streak" className="streak-icon" />
                    )}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Labākā sērija</span>
                  <span className="stat-value">{playerData?.longestStreak ?? 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Kopējās dienas</span>
                  <span className="stat-value">{playerData?.totalGamesPlayed ?? 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Kopējās uzvaras</span>
                  <span className="stat-value">{playerData?.totalWins ?? 0}</span>
                </div>
              </div>
            </div>
          )}

          <div className="modal-actions">
            <button className="win95-button" onClick={onClose}>
              Aizvērt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
