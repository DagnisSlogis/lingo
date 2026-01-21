import { PixelIcon } from "./PixelIcon";

interface OpponentInfoProps {
  name: string;
  rating: number;
  hearts: number;
  score: number;
  currentGuess?: string;
  wordLength?: number;
}

export function OpponentInfo({ name, rating, hearts, score, currentGuess, wordLength }: OpponentInfoProps) {
  // Create display tiles for opponent's typing
  const renderTypingIndicator = () => {
    if (!currentGuess || !wordLength) return null;

    const letters = currentGuess.split("");
    const tiles = Array.from({ length: wordLength }, (_, i) => letters[i] || "");

    return (
      <div className="opponent-typing">
        <span className="typing-label">Raksta:</span>
        <div className="typing-tiles">
          {tiles.map((letter, i) => (
            <span key={i} className={`typing-tile ${letter ? "has-letter" : ""}`}>
              {letter.toUpperCase()}
            </span>
          ))}
        </div>
      </div>
    );
  };

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
          <span className="stat-value opponent-hearts">
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i} className={i < hearts ? "heart-full" : "heart-empty"}>
                <PixelIcon name={i < hearts ? "heart" : "heart-empty"} size={16} />
              </span>
            ))}
          </span>
        </div>
        <div className="opponent-stat">
          <span className="stat-label">Punkti:</span>
          <span className="stat-value">{score}</span>
        </div>
      </div>
      {renderTypingIndicator()}
    </div>
  );
}
