interface MatchmakingScreenProps {
  playerName: string;
  queueCount: number;
  onCancel: () => void;
}

export function MatchmakingScreen({ playerName, queueCount, onCancel }: MatchmakingScreenProps) {
  return (
    <div className="matchmaking-screen">
      <div className="matchmaking-content">
        <div className="matchmaking-title">Ranžēts režīms</div>

        <div className="player-info-box">
          <div className="player-label">Tu spēlē kā:</div>
          <div className="player-name">{playerName}</div>
        </div>

        <div className="searching-box">
          <div className="searching-animation">
            <span className="dot">.</span>
            <span className="dot">.</span>
            <span className="dot">.</span>
          </div>
          <div className="searching-text">Meklē pretinieku...</div>
          <div className="queue-info">
            {queueCount > 0 && (
              <span>Rindā gaida: {queueCount} spēlētāj{queueCount === 1 ? "s" : "i"}</span>
            )}
          </div>
        </div>

        <button className="win95-button cancel-button" onClick={onCancel}>
          Atcelt
        </button>
      </div>
    </div>
  );
}
