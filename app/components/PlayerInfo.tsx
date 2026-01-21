interface PlayerInfoProps {
  name: string;
  rating: number;
  hearts: number;
  isMe?: boolean;
}

export function PlayerInfo({ name, rating, hearts, isMe = false }: PlayerInfoProps) {
  return (
    <div className={`player-info-compact ${isMe ? "me" : "opponent"}`}>
      <div className="player-name-rating">
        <span className="player-name-compact">{name}</span>
        <span className="player-rating-compact">{rating}</span>
      </div>
      <div className="player-hearts-compact">
        {Array.from({ length: 3 }).map((_, i) => (
          <span key={i} className={`heart ${i < hearts ? "full" : "empty"}`}>
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
    </div>
  );
}
