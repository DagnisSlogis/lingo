interface PreMatchScreenProps {
  myName: string;
  myRating: number;
  opponentName: string;
  opponentRating: number;
  onReady: () => void;
}

export function PreMatchScreen({
  myName,
  myRating,
  opponentName,
  opponentRating,
  onReady,
}: PreMatchScreenProps) {
  return (
    <div className="pre-match-screen">
      <div className="pre-match-content">
        <div className="pre-match-title">Pretinieks atrasts!</div>

        <div className="match-players">
          <div className="match-player">
            <div className="player-avatar">👤</div>
            <div className="player-name">{myName}</div>
            <div className="player-rating">{myRating} pts</div>
          </div>

          <div className="vs-divider">VS</div>

          <div className="match-player opponent">
            <div className="player-avatar">👤</div>
            <div className="player-name">{opponentName}</div>
            <div className="player-rating">{opponentRating} pts</div>
          </div>
        </div>

        <button className="win95-button ready-button" onClick={onReady}>
          Sākt spēli
        </button>
      </div>
    </div>
  );
}
