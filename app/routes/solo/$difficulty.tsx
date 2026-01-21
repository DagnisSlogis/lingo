import { createFileRoute, Link } from "@tanstack/react-router";
import { GameBoard } from "~/components/GameBoard";
import { Hearts } from "~/components/Hearts";
import { ScoreDisplay } from "~/components/ScoreDisplay";
import { useGame } from "~/hooks/useGame";
import { GameOverModal } from "~/components/GameOverModal";

export const Route = createFileRoute("/solo/$difficulty")({
  component: SoloGame,
});

function SoloGame() {
  const { difficulty } = Route.useParams();
  const validDifficulty = ["easy", "medium", "hard"].includes(difficulty)
    ? (difficulty as "easy" | "medium" | "hard")
    : "easy";

  const {
    board,
    currentRow,
    currentGuess,
    hearts,
    score,
    gameOver,
    won,
    wordLength,
    targetWord,
    handleKeyPress,
    handleSubmit,
    handleBackspace,
    startNewGame,
    rowAnimation,
    lastTypedIndex,
  } = useGame(validDifficulty);

  return (
    <div className="solo-game">
      <div className="game-header">
        <Hearts hearts={hearts} />
        <ScoreDisplay score={score} />
      </div>

      <GameBoard
        board={board}
        currentRow={currentRow}
        currentGuess={currentGuess}
        wordLength={wordLength}
        onKeyPress={handleKeyPress}
        onSubmit={handleSubmit}
        onBackspace={handleBackspace}
        rowAnimation={rowAnimation}
        disabled={gameOver}
        lastTypedIndex={lastTypedIndex}
        gameOver={gameOver}
        won={won}
        targetWord={targetWord}
      />

      <div className="game-controls">
        <Link to="/solo" className="win95-button">
          ← Atpakaļ
        </Link>
      </div>

      {gameOver && (
        <GameOverModal
          won={won}
          score={score}
          targetWord={targetWord}
          onNewGame={startNewGame}
          hearts={hearts}
        />
      )}
    </div>
  );
}
