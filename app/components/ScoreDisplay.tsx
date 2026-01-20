interface ScoreDisplayProps {
  score: number;
}

export function ScoreDisplay({ score }: ScoreDisplayProps) {
  return (
    <div className="score-display">
      <span className="score-label">Punkti:</span>
      <span className="score-value">{score}</span>
    </div>
  );
}
