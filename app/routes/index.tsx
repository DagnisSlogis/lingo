import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { PixelIcon } from "~/components/PixelIcon";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const navigate = useNavigate();

  const [playerId] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("lingo_player_id") || "";
    }
    return "";
  });

  const streakInfo = useQuery(
    api.players.getPlayerStreak,
    playerId ? { playerId } : "skip"
  );

  const handleQuickPlay = () => {
    const difficulty = streakInfo?.lastDifficulty || "medium";
    navigate({ to: `/solo/${difficulty}` });
  };

  return (
    <div className="home-screen">
      <h1 className="game-title">LINGO</h1>
      <p className="subtitle">Latviešu vārdu spēle</p>

      {streakInfo && streakInfo.dailyStreak > 0 && (
        <div className="streak-widget">
          <span className="streak-text">
            <span className="streak-fire">🔥</span> {streakInfo.dailyStreak} dienu sērija!
          </span>
        </div>
      )}

      {streakInfo?.lastDifficulty && (
        <div className="quick-play">
          <button className="win95-button quick-play-button" onClick={handleQuickPlay}>
            <PixelIcon name="gamepad" size={16} /> Ātrā spēle
          </button>
          <div className="quick-play-info">
            (Pēdējais līmenis: {streakInfo.lastDifficulty === "easy" ? "Viegls" :
              streakInfo.lastDifficulty === "medium" ? "Klasiskais" : "Grūts"})
          </div>
        </div>
      )}

      <div className="mode-selection">
        <Link to="/solo" className="win95-button mode-button">
          <span className="button-icon">
            <PixelIcon name="gamepad" size={32} />
          </span>
          <span className="button-text">
            <strong>Solo Arcade</strong>
            <small>Klasiskais režīms</small>
          </span>
        </Link>

        <Link to="/ranked" className="win95-button mode-button">
          <span className="button-icon">
            <PixelIcon name="swords" size={32} />
          </span>
          <span className="button-text">
            <strong>Ranžēts režīms</strong>
            <small>Spēlē pret citiem</small>
          </span>
        </Link>
      </div>
    </div>
  );
}
