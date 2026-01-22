import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useMultiplayer } from "~/hooks/useMultiplayer";
import { GameBoard } from "~/components/GameBoard";
import { Timer } from "~/components/Timer";
import { PlayerInfo } from "~/components/PlayerInfo";
import { MatchOverModal } from "~/components/MatchOverModal";
import { RoundOverModal } from "~/components/RoundOverModal";
import { useSound } from "~/hooks/useSound";

export const Route = createFileRoute("/ranked/match/$matchId")({
  component: MatchGame,
});

function MatchGame() {
  const { matchId } = Route.useParams();
  const navigate = useNavigate();
  const { play: playSound } = useSound();

  const {
    playerId,
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
    rowAnimation,
    lastTypedIndex,
    roundOverInfo,
    opponentCurrentGuess,
  } = useMultiplayer(matchId);

  const [rematchRequested, setRematchRequested] = useState(false);

  const requestRematchMutation = useMutation(api.matches.requestRematch);
  const cancelRematchMutation = useMutation(api.matches.cancelRematch);
  const leaveMatchMutation = useMutation(api.matches.leaveMatch);

  // Determine rematch state from match data
  const isPlayer1 = match?.player1Id === playerId;
  const myRematchWant = isPlayer1 ? match?.player1WantsRematch : match?.player2WantsRematch;
  const opponentRematchWant = isPlayer1 ? match?.player2WantsRematch : match?.player1WantsRematch;
  const opponentLeft = isPlayer1 ? match?.player2Left : match?.player1Left;

  const getRematchState = (): "idle" | "waiting" | "opponent_waiting" | "starting" | "opponent_left" => {
    if (match?.rematchMatchId) return "starting";
    if (opponentLeft) return "opponent_left";
    if (myRematchWant && opponentRematchWant) return "starting";
    if (myRematchWant) return "waiting";
    if (opponentRematchWant) return "opponent_waiting";
    return "idle";
  };

  const rematchState = getRematchState();

  // Navigate to new match when rematch is created
  // This handles both players - the one who receives rematchMatchId from subscription
  const rematchMatchId = match?.rematchMatchId;
  useEffect(() => {
    if (rematchMatchId) {
      playSound("yourTurn");
      // Use window.location for reliable navigation (Tanstack Router can be flaky)
      window.location.href = `/ranked/match/${rematchMatchId}`;
    }
  }, [rematchMatchId, playSound]);

  const handlePlayAgain = async () => {
    if (!matchId || !playerId || !requestRematchMutation) return;

    // If rematch already exists (from subscription), navigate directly
    if (rematchMatchId) {
      playSound("yourTurn");
      // Use window.location for reliable navigation (Tanstack Router can be flaky)
      window.location.href = `/ranked/match/${rematchMatchId}`;
      return;
    }

    try {
      setRematchRequested(true);
      const result = await requestRematchMutation({
        matchId: matchId as Id<"matches">,
        playerId,
      });

      if (result.rematchMatchId) {
        playSound("yourTurn");
        // Use window.location for reliable navigation (Tanstack Router can be flaky)
        window.location.href = `/ranked/match/${result.rematchMatchId}`;
      } else if (result.waiting) {
        playSound("correct");
      }
    } catch (error) {
      console.error("Failed to request rematch:", error);
      setRematchRequested(false);
    }
  };

  const handleCancelRematch = async () => {
    if (!matchId || !playerId || !cancelRematchMutation) return;

    try {
      await cancelRematchMutation({
        matchId: matchId as Id<"matches">,
        playerId,
      });
      setRematchRequested(false);
    } catch (error) {
      console.error("Failed to cancel rematch:", error);
    }
  };

  const handleExit = async () => {
    // Mark player as having left the match
    if (matchId && playerId && state.matchOver) {
      try {
        await leaveMatchMutation({ matchId: matchId as Id<"matches">, playerId });
      } catch (error) {
        console.error("Failed to mark as left:", error);
      }
    }
    window.location.href = "/";
  };

  const handleFindNewMatch = async () => {
    // Mark player as having left the match, then navigate to matchmaking
    if (matchId && playerId) {
      try {
        await leaveMatchMutation({ matchId: matchId as Id<"matches">, playerId });
      } catch (error) {
        console.error("Failed to mark as left:", error);
      }
    }
    navigate({ to: "/ranked" });
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
      <div className="match-header-compact">
        <PlayerInfo
          name="Es"
          rating={state.myRating}
          hearts={state.myHearts}
          isMe={true}
        />

        <div className="round-timer-center">
          <div className="match-round">Raunds {state.round}</div>
          <Timer seconds={state.timeRemaining} isActive={state.isMyTurn} />
        </div>

        <PlayerInfo
          name={state.opponentName}
          rating={state.opponentRating}
          hearts={state.opponentHearts}
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
          rowAnimation={rowAnimation}
          disabled={!state.isMyTurn || state.matchOver}
          lastTypedIndex={lastTypedIndex}
          gameOver={!!roundOverInfo || state.matchOver}
          won={roundOverInfo?.roundWinner === "me"}
          targetWord={roundOverInfo?.word}
          opponentGuess={opponentCurrentGuess}
          showOpponentGuess={!state.isMyTurn && !state.matchOver}
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
          isDraw={state.isDraw}
          myScore={state.myScore}
          opponentScore={state.opponentScore}
          myName={playerName}
          opponentName={state.opponentName}
          lastWord={match?.revealedWord}
          onPlayAgain={handlePlayAgain}
          onExit={handleExit}
          onFindNewMatch={handleFindNewMatch}
          rematchState={rematchState}
          onCancelRematch={handleCancelRematch}
          myRatingChange={state.myRatingChange}
          opponentRatingChange={state.opponentRatingChange}
        />
      )}

      {roundOverInfo && !state.matchOver && (
        <RoundOverModal
          word={roundOverInfo.word}
          roundWinner={roundOverInfo.roundWinner}
          winnerName={roundOverInfo.roundWinner === "me" ? playerName : state.opponentName}
          roundNumber={roundOverInfo.roundNumber}
        />
      )}
    </div>
  );
}
