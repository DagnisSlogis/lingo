interface TurnIndicatorProps {
  isMyTurn: boolean;
  myName: string;
  opponentName: string;
}

export function TurnIndicator({ isMyTurn, myName, opponentName }: TurnIndicatorProps) {
  return (
    <div className={`turn-indicator ${isMyTurn ? "my-turn" : "opponent-turn"}`}>
      <div className="turn-label">
        {isMyTurn ? "Tavs gājiens" : "Pretinieka gājiens"}
      </div>
      <div className="turn-name">
        {isMyTurn ? myName : opponentName}
      </div>
    </div>
  );
}
