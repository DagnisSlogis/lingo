interface ScoreDisplayProps {
  score: number;
  label?: string;
}

export function ScoreDisplay({ score, label = "Punkti" }: ScoreDisplayProps) {
  return (
    <div className="score-display">
      <span className="score-label">{label}:</span>
      <span className="score-value">{score}</span>
    </div>
  );
}
