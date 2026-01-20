import { createFileRoute } from "@tanstack/react-router";
import { useMultiplayer } from "~/hooks/useMultiplayer";
import { GameBoard } from "~/components/GameBoard";
import { Hearts } from "~/components/Hearts";
import { ScoreDisplay } from "~/components/ScoreDisplay";
import { Timer } from "~/components/Timer";
import { TurnIndicator } from "~/components/TurnIndicator";
import { OpponentInfo } from "~/components/OpponentInfo";
import { MatchOverModal } from "~/components/MatchOverModal";

export const Route = createFileRoute("/ranked/match/$matchId")({
  component: MatchGame,
});

function MatchGame() {
  const { matchId } = Route.useParams();

  const {
    playerName,
    match,
    board,
    currentGuess,
    wordLength,
    currentRow,
    state,
    handleKeyPress,
    handleBackspace,
    handleSubmit,
    forfeitMatch,
  } = useMultiplayer(matchId);

  const handlePlayAgain = () => {
    window.location.href = "/ranked";
  };

  const handleExit = () => {
    window.location.href = "/";
  };

  const handleForfeit = () => {
    if (confirm("Vai tiešām vēlies padoties? Tu zaudēsi maču.")) {
      forfeitMatch();
    }
  };

  if (!match) {
    return (
      <div className="loading-screen">
        <div className="loading-text">Ielādē maču...</div>
      </div>
    );
  }

  return (
    <div className="match-screen">
      <div className="match-header">
        <div className="match-round">Raunds {state.round}</div>
        <Timer seconds={state.timeRemaining} isActive={state.isMyTurn} />
      </div>

      <div className="match-players-row">
        <div className="my-info">
          <div className="my-name">{playerName}</div>
          <Hearts hearts={state.myHearts} />
          <ScoreDisplay score={state.myScore} label="Punkti" />
        </div>

        <TurnIndicator
          isMyTurn={state.isMyTurn}
          myName={playerName}
          opponentName={state.opponentName}
        />

        <OpponentInfo
          name={state.opponentName}
          rating={state.opponentRating}
          hearts={state.opponentHearts}
          score={state.opponentScore}
        />
      </div>

      <div className="match-game-area">
        <GameBoard
          board={board}
          currentRow={currentRow}
          currentGuess={currentGuess}
          wordLength={wordLength}
          onKeyPress={handleKeyPress}
          onSubmit={handleSubmit}
          onBackspace={handleBackspace}
        />

        {!state.isMyTurn && !state.matchOver && (
          <div className="waiting-overlay">
            <div className="waiting-text">Gaidi pretinieka gājienu...</div>
          </div>
        )}
      </div>

      <div className="match-actions">
        <button className="win95-button forfeit-button" onClick={handleForfeit}>
          Padoties
        </button>
      </div>

      {state.matchOver && (
        <MatchOverModal
          isWinner={state.isWinner}
          myScore={state.myScore}
          opponentScore={state.opponentScore}
          myName={playerName}
          opponentName={state.opponentName}
          onPlayAgain={handlePlayAgain}
          onExit={handleExit}
        />
      )}
    </div>
  );
}
