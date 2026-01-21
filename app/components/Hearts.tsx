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
          <img
            src="/img/live.svg"
            alt="life"
            width={24}
            height={24}
            style={{ opacity: i < hearts ? 1 : 0.3 }}
          />
        </span>
      ))}
    </div>
  );
}
