import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useMatchmaking } from "~/hooks/useMatchmaking";
import { MatchmakingScreen } from "~/components/MatchmakingScreen";

export const Route = createFileRoute("/ranked/")({
  component: RankedQueue,
});

function RankedQueue() {
  const {
    playerName,
    isSearching,
    matchId,
    queueCount,
    joinQueue,
    leaveQueue,
  } = useMatchmaking();

  // Navigate to match when matched
  useEffect(() => {
    if (matchId) {
      // Use window.location for navigation to dynamic routes
      window.location.href = `/ranked/match/${matchId}`;
    }
  }, [matchId]);

  const handleStartSearch = async () => {
    const result = await joinQueue();
    if (result.matched && result.matchId) {
      window.location.href = `/ranked/match/${result.matchId}`;
    }
  };

  const handleCancelSearch = () => {
    leaveQueue();
  };

  if (isSearching) {
    return (
      <MatchmakingScreen
        playerName={playerName}
        queueCount={queueCount}
        onCancel={handleCancelSearch}
      />
    );
  }

  return (
    <div className="ranked-screen">
      <h2>Ranžēts režīms</h2>
      <p className="description">
        Spēlē pret citiem spēlētājiem un cīnies par vietu līderu sarakstā!
      </p>

      <div className="ranked-info">
        <div className="info-item">
          <span className="info-icon">⚔️</span>
          <span className="info-text">Divi spēlētāji min vārdu uz vienas galdiņa</span>
        </div>
        <div className="info-item">
          <span className="info-icon">⏱️</span>
          <span className="info-text">30 sekundes katram gājienam</span>
        </div>
        <div className="info-item">
          <span className="info-icon">❤️</span>
          <span className="info-text">3 dzīvības - pirmais, kas zaudē visas, zaudē maču</span>
        </div>
        <div className="info-item">
          <span className="info-icon">📊</span>
          <span className="info-text">Uzvaras un zaudējumi ietekmē tavu reitingu</span>
        </div>
      </div>

      <div className="player-box">
        <div className="player-label">Tu spēlēsi kā:</div>
        <div className="player-name">{playerName}</div>
      </div>

      <div className="ranked-buttons">
        <button className="win95-button start-button" onClick={handleStartSearch}>
          Meklēt pretinieku
        </button>

        <Link to="/ranked/invite" className="win95-button start-button">
          Uzaicināt draugu
        </Link>

        <Link to="/" className="win95-button back-button">
          ← Atpakaļ
        </Link>
      </div>
    </div>
  );
}
