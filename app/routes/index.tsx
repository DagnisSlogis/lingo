import { createFileRoute, Link } from "@tanstack/react-router";
import { PixelIcon } from "~/components/PixelIcon";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div className="home-screen">
      <h1 className="game-title">LINGO</h1>
      <p className="subtitle">Latviešu vārdu spēle</p>

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
