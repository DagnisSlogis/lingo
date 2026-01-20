interface OpponentInfoProps {
  name: string;
  rating: number;
  hearts: number;
  score: number;
}

export function OpponentInfo({ name, rating, hearts, score }: OpponentInfoProps) {
  return (
    <div className="opponent-info">
      <div className="opponent-header">
        <span className="opponent-label">Pretinieks</span>
      </div>
      <div className="opponent-name">{name}</div>
      <div className="opponent-stats">
        <div className="opponent-stat">
          <span className="stat-label">Reitings:</span>
          <span className="stat-value">{rating}</span>
        </div>
        <div className="opponent-stat">
          <span className="stat-label">Dzīvības:</span>
          <span className="stat-value">
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i} className={i < hearts ? "heart-full" : "heart-empty"}>
                {i < hearts ? "❤️" : "🖤"}
              </span>
            ))}
          </span>
        </div>
        <div className="opponent-stat">
          <span className="stat-label">Punkti:</span>
          <span className="stat-value">{score}</span>
        </div>
      </div>
    </div>
  );
}
