import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useSound } from "~/hooks/useSound";

export const Route = createFileRoute("/ranked/join/$inviteCode")({
  component: JoinInviteScreen,
});

function JoinInviteScreen() {
  const { inviteCode } = Route.useParams();
  const navigate = useNavigate();
  const { play: playSound } = useSound();

  const [playerId] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("lingo_player_id") || "";
    }
    return "";
  });

  const [playerName] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("lingo_player_name") || "";
    }
    return "";
  });

  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const invite = useQuery(api.invites.getInvite, { inviteCode });
  const joinInvite = useMutation(api.invites.joinInvite);

  const difficultyLabels: Record<string, string> = {
    easy: "Viegls (4 burti)",
    medium: "Klasiskais (5 burti)",
    hard: "Grūts (6 burti)",
  };

  const handleJoin = async () => {
    if (!playerId || !playerName || !invite) return;

    setIsJoining(true);
    setError(null);

    try {
      const result = await joinInvite({
        inviteCode,
        playerId,
        playerName,
      });

      if (result.success && result.matchId) {
        playSound("yourTurn");
        navigate({ to: `/ranked/match/${result.matchId}` });
      } else {
        setError(result.error || "Neizdevās pievienoties");
        playSound("wrong");
      }
    } catch (err) {
      setError("Neizdevās pievienoties");
      playSound("wrong");
    }

    setIsJoining(false);
  };

  // Auto-join if invite is valid
  useEffect(() => {
    if (invite && !isJoining && !error) {
      // Small delay to show the UI first
      const timer = setTimeout(() => {
        handleJoin();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [invite]);

  // Invite not found or expired
  if (invite === null) {
    return (
      <div className="join-screen">
        <h2>Uzaicinājums nav atrasts</h2>

        <div className="ranked-info" style={{ textAlign: "center" }}>
          <p>Šis uzaicinājums vairs nav derīgs vai ir beidzies.</p>
          <p>Iespējams, saimnieks ir atcēlis uzaicinājumu vai spēle jau ir sākusies.</p>
        </div>

        <div className="invite-buttons">
          <Link to="/ranked" className="win95-button">
            Ranžēts režīms
          </Link>
          <Link to="/" className="win95-button back-button">
            ← Uz sākumu
          </Link>
        </div>
      </div>
    );
  }

  // Loading
  if (invite === undefined) {
    return (
      <div className="join-screen">
        <h2>Ielādē...</h2>
        <div className="searching-box">
          <div className="searching-animation">
            <span className="dot">.</span>
            <span className="dot">.</span>
            <span className="dot">.</span>
          </div>
        </div>
      </div>
    );
  }

  // Invite found - show join screen
  return (
    <div className="join-screen">
      <h2>Pievienoties spēlei</h2>

      <div className="host-info-box">
        <div className="host-label">Saimnieks:</div>
        <div className="host-name">{invite.hostPlayerName}</div>
        <div className="difficulty-label">
          Grūtība: {difficultyLabels[invite.difficulty] || invite.difficulty}
        </div>
      </div>

      {error && (
        <div className="ranked-info" style={{ background: "#ffcccc", textAlign: "center" }}>
          <p>{error}</p>
        </div>
      )}

      <div className="invite-buttons">
        <button
          className="win95-button start-button"
          onClick={handleJoin}
          disabled={isJoining}
        >
          {isJoining ? "Pievienojas..." : "Pievienoties"}
        </button>

        <Link to="/" className="win95-button back-button">
          ← Atpakaļ
        </Link>
      </div>
    </div>
  );
}
