import { PixelIcon } from "./PixelIcon";

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
          <PixelIcon name={i < hearts ? "heart" : "heart-empty"} size={24} />
        </span>
      ))}
    </div>
  );
}
