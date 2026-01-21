import { PixelIcon } from "./PixelIcon";

interface MatchOverModalProps {
  isWinner: boolean;
  isDraw: boolean;
  myScore: number;
  opponentScore: number;
  myName: string;
  opponentName: string;
  lastWord?: string;
  onPlayAgain: () => void;
  onExit: () => void;
  onFindNewMatch?: () => void;
  // Rematch state
  rematchState?: "idle" | "waiting" | "opponent_waiting" | "starting" | "opponent_left";
  onCancelRematch?: () => void;
}

export function MatchOverModal({
  isWinner,
  isDraw,
  myScore,
  opponentScore,
  myName,
  opponentName,
  lastWord,
  onPlayAgain,
  onExit,
  onFindNewMatch,
  rematchState = "idle",
  onCancelRematch,
}: MatchOverModalProps) {
  const getRematchButtonText = () => {
    switch (rematchState) {
      case "waiting":
        return "Gaida pretinieku...";
      case "opponent_waiting":
        return "Pieņemt revanšu!";
      case "starting":
        return "Sākas...";
      case "opponent_left":
        return "Meklēt jaunu pretinieku";
      default:
        return "Spēlēt vēlreiz";
    }
  };

  const isRematchDisabled = rematchState === "waiting" || rematchState === "starting";
  const showFindNewMatch = rematchState === "opponent_left";

  const getTitle = () => {
    if (isDraw) return "Neizšķirts!";
    return isWinner ? "Uzvara!" : "Zaudējums";
  };

  const getResultText = () => {
    if (isDraw) return "Neizšķirts!";
    return isWinner ? "Tu uzvarēji!" : "Tu zaudēji!";
  };

  return (
    <div className="modal-overlay">
      <div className="modal win95-window match-over-modal">
        <div className="title-bar">
          <div className="title-bar-text">
            {getTitle()}
          </div>
        </div>
        <div className="window-body">
          <div className="match-result-icon">
            {isWinner && !isDraw && (
              <img src="/img/trophy.svg" alt="duel" width={48} height={48} />
            )}
          </div>

          <div className="match-result-title">
            {getResultText()}
          </div>

          {lastWord && (
            <div className="match-last-word">
              <span className="last-word-label">Vārds:</span>
              <span className="last-word-value">{lastWord.toUpperCase()}</span>
            </div>
          )}

          <div className="match-scores">
            <div className={`score-row ${isWinner && !isDraw ? "winner" : ""}`}>
              <span className="score-name">{myName}</span>
              <span className="score-value">{myScore}</span>
            </div>
            <div className={`score-row ${!isWinner && !isDraw ? "winner" : ""}`}>
              <span className="score-name">{opponentName}</span>
              <span className="score-value">{opponentScore}</span>
            </div>
          </div>

          {rematchState === "opponent_waiting" && (
            <div className="rematch-notice">
              {opponentName} vēlas revanšu!
            </div>
          )}

          {rematchState === "opponent_left" && (
            <div className="rematch-notice opponent-left">
              {opponentName} aizgāja
            </div>
          )}

          {rematchState === "waiting" && (
            <div className="rematch-waiting">
              <span className="waiting-dots">...</span>
            </div>
          )}

          <div className="modal-buttons">
            {showFindNewMatch ? (
              <button
                className="win95-button"
                onClick={onFindNewMatch}
              >
                {getRematchButtonText()}
              </button>
            ) : (
              <button
                className={`win95-button ${rematchState === "opponent_waiting" ? "rematch-accept" : ""}`}
                onClick={onPlayAgain}
                disabled={isRematchDisabled}
              >
                {getRematchButtonText()}
              </button>
            )}
            {rematchState === "waiting" && onCancelRematch ? (
              <button className="win95-button" onClick={onCancelRematch}>
                Atcelt
              </button>
            ) : (
              <button className="win95-button" onClick={onExit}>
                Iziet
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
