export type TileState = "empty" | "correct" | "present" | "absent";

interface TileProps {
  letter: string;
  state: TileState;
  isActive: boolean;
  isRevealed: boolean;
  delay?: number;
}

export function Tile({ letter, state, isActive, isRevealed, delay = 0 }: TileProps) {
  const stateClass = isRevealed ? state : "empty";

  return (
    <div
      className={`tile ${stateClass} ${isActive ? "active" : ""} ${letter ? "filled" : ""} ${isRevealed ? "revealed" : ""}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className="tile-letter">{letter.toUpperCase()}</span>
    </div>
  );
}
