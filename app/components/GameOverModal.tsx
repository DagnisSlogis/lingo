import { PixelIcon } from "./PixelIcon";

interface GameOverModalProps {
  won: boolean;
  score: number;
  targetWord: string;
  hearts: number;
  onNewGame: () => void;
}

export function GameOverModal({
  won,
  score,
  targetWord,
  hearts,
  onNewGame,
}: GameOverModalProps) {
  const isGameOver = hearts === 0;

  return (
    <div className="modal-overlay">
      <div className="win95-window modal game-over-modal">
        <div className="title-bar">
          <div className="title-bar-text">
            {isGameOver ? "Spēle beigusies!" : won ? "Pareizi!" : "Nepareizi!"}
          </div>
        </div>
        <div className="window-body modal-body">
          {isGameOver ? (
            <>
              <h2>Spēle beigusies!</h2>
              <p className="final-word">
                Vārds bija: <strong>{targetWord.toUpperCase()}</strong>
              </p>
              <p className="final-score">
                Tavs rezultāts: <strong>{score}</strong> punkti
              </p>

              {score > 0 && (
                <p className="submitted-message">Rezultāts saglabāts!</p>
              )}
            </>
          ) : won ? (
            <>
              <h2>Apsveicam!</h2>
              <p style={{ textAlign: "center" }}>Tu uzminēji vārdu!</p>
              <p className="score-gained">
                +{getScoreForAttempt(6 - getCurrentRowFromScore(score))} punkti
              </p>
            </>
          ) : (
            <>
              <h2>Nepareizi!</h2>
              <p className="final-word">
                Vārds bija: <strong>{targetWord.toUpperCase()}</strong>
              </p>
              <p className="hearts-lost">-1 <PixelIcon name="heart" size={16} /></p>
            </>
          )}

          <div className="modal-actions">
            <button className="win95-button" onClick={onNewGame}>
              {isGameOver ? "Jauna spēle" : "Nākamais vārds"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function getScoreForAttempt(attempt: number): number {
  const scores = [500, 200, 100, 50, 25, 10];
  return scores[attempt - 1] || 0;
}

function getCurrentRowFromScore(score: number): number {
  // This is a rough estimate - the actual row is tracked in the game state
  return 0;
}
