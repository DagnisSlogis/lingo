import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/solo/")({
  component: SoloDifficultySelect,
});

function SoloDifficultySelect() {
  return (
    <div className="difficulty-screen">
      <h2>Izvēlies grūtības līmeni</h2>

      <div className="difficulty-options">
        <Link
          to="/solo/$difficulty"
          params={{ difficulty: "easy" }}
          className="win95-button difficulty-button"
        >
          <strong>Viegls</strong>
          <small>5 burti</small>
        </Link>

        <Link
          to="/solo/$difficulty"
          params={{ difficulty: "medium" }}
          className="win95-button difficulty-button"
        >
          <strong>Vidējs</strong>
          <small>7 burti</small>
        </Link>

        <Link
          to="/solo/$difficulty"
          params={{ difficulty: "hard" }}
          className="win95-button difficulty-button"
        >
          <strong>Grūts</strong>
          <small>9 burti</small>
        </Link>
      </div>

      <Link to="/" className="win95-button back-button">
        ← Atpakaļ
      </Link>
    </div>
  );
}
