import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface LeaderboardModalProps {
  onClose: () => void;
}

type Mode = "solo" | "duel";
type Difficulty = "easy" | "medium" | "hard";

const difficultyLabels: Record<Difficulty, string> = {
  easy: "Viegls (4 burti)",
  medium: "Klasiskais (5 burti)",
  hard: "Grūts (6 burti)",
};

export function LeaderboardModal({ onClose }: LeaderboardModalProps) {
  const [mode, setMode] = useState<Mode>("solo");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");

  const soloLeaderboard = useQuery(
    api.leaderboard.getTop,
    mode === "solo" ? { difficulty, limit: 25 } : "skip"
  );
  const duelLeaderboard = useQuery(
    api.players.getRankedLeaderboard,
    mode === "duel" ? { limit: 25 } : "skip"
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="win95-window modal" onClick={(e) => e.stopPropagation()}>
        <div className="title-bar">
          <div className="title-bar-text">Līderu saraksts</div>
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
          {/* Mode toggle */}
          <div className="mode-tabs">
            <button
              className={`win95-button tab-button ${mode === "solo" ? "active" : ""}`}
              onClick={() => setMode("solo")}
            >
              Solo
            </button>
            <button
              className={`win95-button tab-button ${mode === "duel" ? "active" : ""}`}
              onClick={() => setMode("duel")}
            >
              Duelis
            </button>
          </div>

          {/* Solo difficulty tabs */}
          {mode === "solo" && (
            <div className="difficulty-tabs">
              {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  className={`win95-button tab-button ${difficulty === d ? "active" : ""}`}
                  onClick={() => setDifficulty(d)}
                >
                  {difficultyLabels[d]}
                </button>
              ))}
            </div>
          )}

          <div className="leaderboard-table-container">
            {mode === "solo" ? (
              <table className="leaderboard-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Vārds</th>
                    <th>Punkti</th>
                    <th>Uzvaras</th>
                  </tr>
                </thead>
                <tbody>
                  {soloLeaderboard === undefined ? (
                    <tr>
                      <td colSpan={4} className="loading">
                        Ielādē...
                      </td>
                    </tr>
                  ) : soloLeaderboard.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="empty">
                        Nav rezultātu
                      </td>
                    </tr>
                  ) : (
                    soloLeaderboard.map((entry, index) => (
                      <tr key={entry._id}>
                        <td>{index + 1}</td>
                        <td>{entry.playerName}</td>
                        <td>{entry.score}</td>
                        <td>{entry.gamesWon}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              <table className="leaderboard-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Vārds</th>
                    <th>Reitings</th>
                    <th>U/Z</th>
                    <th>%</th>
                  </tr>
                </thead>
                <tbody>
                  {duelLeaderboard === undefined ? (
                    <tr>
                      <td colSpan={5} className="loading">
                        Ielādē...
                      </td>
                    </tr>
                  ) : duelLeaderboard.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="empty">
                        Nav rezultātu
                      </td>
                    </tr>
                  ) : (
                    duelLeaderboard.map((entry, index) => {
                      const totalGames = entry.rankedWins + entry.rankedLosses;
                      const winRate = totalGames > 0
                        ? Math.round((entry.rankedWins / totalGames) * 100)
                        : 0;
                      return (
                        <tr key={entry._id}>
                          <td>{index + 1}</td>
                          <td>{entry.name}</td>
                          <td>{entry.rankedRating}</td>
                          <td>{entry.rankedWins}/{entry.rankedLosses}</td>
                          <td>{winRate}%</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>

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
