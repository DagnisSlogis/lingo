interface HeartsProps {
  hearts: number;
  maxHearts?: number;
}

export function Hearts({ hearts, maxHearts = 3 }: HeartsProps) {
  return (
    <div className="hearts-display">
      {Array.from({ length: maxHearts }).map((_, i) => (
        <span
          key={i}
          className={`heart ${i < hearts ? "full" : "empty"}`}
        >
          {i < hearts ? "❤️" : "🖤"}
        </span>
      ))}
    </div>
  );
}
