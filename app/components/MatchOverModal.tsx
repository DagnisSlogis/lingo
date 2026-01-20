import { PixelIcon } from "./PixelIcon";

interface MatchOverModalProps {
  isWinner: boolean;
  myScore: number;
  opponentScore: number;
  myName: string;
  opponentName: string;
  onPlayAgain: () => void;
  onExit: () => void;
}

export function MatchOverModal({
  isWinner,
  myScore,
  opponentScore,
  myName,
  opponentName,
  onPlayAgain,
  onExit,
}: MatchOverModalProps) {
  return (
    <div className="modal-overlay">
      <div className="modal win95-window match-over-modal">
        <div className="title-bar">
          <div className="title-bar-text">
            {isWinner ? "Uzvara!" : "Zaudējums"}
          </div>
        </div>
        <div className="window-body">
          <div className="match-result-icon">
            <PixelIcon name={isWinner ? "trophy" : "sad"} size={48} />
          </div>

          <div className="match-result-title">
            {isWinner ? "Tu uzvarēji!" : "Tu zaudēji!"}
          </div>

          <div className="match-scores">
            <div className={`score-row ${isWinner ? "winner" : ""}`}>
              <span className="score-name">{myName}</span>
              <span className="score-value">{myScore}</span>
            </div>
            <div className={`score-row ${!isWinner ? "winner" : ""}`}>
              <span className="score-name">{opponentName}</span>
              <span className="score-value">{opponentScore}</span>
            </div>
          </div>

          <div className="modal-buttons">
            <button className="win95-button" onClick={onPlayAgain}>
              Spēlēt vēlreiz
            </button>
            <button className="win95-button" onClick={onExit}>
              Iziet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
