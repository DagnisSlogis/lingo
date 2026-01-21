export type TileState = "empty" | "correct" | "present" | "absent";

interface TileProps {
  letter: string;
  state: TileState;
  isActive: boolean;
  isRevealed: boolean;
  delay?: number;
  index?: number;
  isPop?: boolean;
  isOpponent?: boolean;
}

export function Tile({ letter, state, isActive, isRevealed, delay = 0, index = 0, isPop = false, isOpponent = false }: TileProps) {
  const stateClass = isRevealed ? state : "empty";

  return (
    <div
      className={`tile ${stateClass} ${isActive ? "active" : ""} ${letter ? "filled" : ""} ${isRevealed ? "revealed" : ""} ${isPop ? "pop" : ""} ${isOpponent ? "opponent" : ""}`}
      style={{
        "--delay": `${delay}ms`,
        "--tile-index": index,
        animationDelay: `${delay}ms`
      } as React.CSSProperties}
    >
      <span className="tile-letter">{letter.toUpperCase()}</span>
    </div>
  );
}
