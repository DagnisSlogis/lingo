import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/ranked/")({
  component: RankedQueue,
});

function RankedQueue() {
  return (
    <div className="ranked-screen">
      <h2>Ranžēts režīms</h2>
      <p className="coming-soon">Drīzumā...</p>
      <p className="description">
        Spēlē pret citiem spēlētājiem un cīnies par vietu līderu sarakstā!
      </p>

      <Link to="/" className="win95-button back-button">
        ← Atpakaļ
      </Link>
    </div>
  );
}
