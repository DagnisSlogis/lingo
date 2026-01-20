import { PixelIcon } from "./PixelIcon";

interface RoundOverModalProps {
  word: string;
  roundWinner: "me" | "opponent" | "draw";
  winnerName: string;
  roundNumber: number;
}

export function RoundOverModal({
  word,
  roundWinner,
  winnerName,
  roundNumber,
}: RoundOverModalProps) {
  const getIcon = () => {
    if (roundWinner === "me") return <PixelIcon name="check" size={32} />;
    if (roundWinner === "opponent") return <PixelIcon name="cross" size={32} />;
    return "−";
  };

  const getMessage = () => {
    if (roundWinner === "me") return "Tu uzminēji!";
    if (roundWinner === "opponent") return `${winnerName} uzminēja!`;
    return "Neviens neuzminēja!";
  };

  return (
    <div className="modal-overlay">
      <div className="modal win95-window round-over-modal">
        <div className="title-bar">
          <div className="title-bar-text">Raunds {roundNumber} beidzās</div>
        </div>
        <div className="window-body">
          <div className={`round-result-icon ${roundWinner}`}>{getIcon()}</div>

          <div className="round-result-message">{getMessage()}</div>

          <div className="word-reveal">
            <div className="word-reveal-label">Vārds bija:</div>
            <div className="word-reveal-word">{word.toUpperCase()}</div>
          </div>

          <div className="next-round-text">Nākamais raunds sākas...</div>
        </div>
      </div>
    </div>
  );
}
