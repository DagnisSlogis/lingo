import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface LeaderboardModalProps {
  onClose: () => void;
}

type Difficulty = "easy" | "medium" | "hard";

const difficultyLabels: Record<Difficulty, string> = {
  easy: "Viegls (4 burti)",
  medium: "Klasiskais (5 burti)",
  hard: "Grūts (6 burti)",
};

export function LeaderboardModal({ onClose }: LeaderboardModalProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const leaderboard = useQuery(api.leaderboard.getTop, { difficulty, limit: 25 });

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

          <div className="leaderboard-table-container">
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
                {leaderboard === undefined ? (
                  <tr>
                    <td colSpan={4} className="loading">
                      Ielādē...
                    </td>
                  </tr>
                ) : leaderboard.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="empty">
                      Nav rezultātu
                    </td>
                  </tr>
                ) : (
                  leaderboard.map((entry, index) => (
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
