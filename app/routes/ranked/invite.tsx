import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useSound } from "~/hooks/useSound";

export const Route = createFileRoute("/ranked/invite")({
  component: InviteScreen,
});

function InviteScreen() {
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

  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("medium");
  const [inviteCode, setInviteCode] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const [copied, setCopied] = useState(false);

  const createInvite = useMutation(api.invites.createInvite);
  const cancelAllInvites = useMutation(api.invites.cancelAllInvites);
  const invite = useQuery(api.invites.getInviteByHost, { hostPlayerId: playerId });

  // Create invite when difficulty is selected
  const handleCreateInvite = async () => {
    if (!playerId || !playerName) return;

    setIsCreating(true);
    try {
      const result = await createInvite({
        playerId,
        playerName,
        difficulty: selectedDifficulty,
      });
      setInviteCode(result.inviteCode);
      playSound("correct");
    } catch (error) {
      console.error("Failed to create invite:", error);
    }
    setIsCreating(false);
  };

  // Check if invite has been matched (only if we created one in this session)
  useEffect(() => {
    if (inviteCode && invite?.status === "matched" && invite.matchId) {
      playSound("yourTurn");
      navigate({ to: `/ranked/match/${invite.matchId}` });
    }
  }, [invite, inviteCode, navigate, playSound]);

  // Cancel invite on unmount
  useEffect(() => {
    return () => {
      if (playerId) {
        cancelAllInvites({ playerId });
      }
    };
  }, [playerId, cancelAllInvites]);

  const getInviteLink = () => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/ranked/join/${inviteCode}`;
    }
    return "";
  };

  const handleCopyLink = async () => {
    const link = getInviteLink();
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      playSound("correct");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleShare = async () => {
    const link = getInviteLink();
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Lingo - Uzaicini draugu!",
          text: `Spēlē Lingo ar mani! Kods: ${inviteCode}`,
          url: link,
        });
        playSound("correct");
      } catch (error) {
        // User cancelled share or error
        console.log("Share cancelled");
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCancel = () => {
    playSound("menuClick");
    navigate({ to: "/ranked" });
  };

  const difficultyLabels: Record<string, string> = {
    easy: "Viegls (4 burti)",
    medium: "Klasiskais (5 burti)",
    hard: "Grūts (6 burti)",
  };

  // Not yet created an invite - show difficulty selection
  if (!inviteCode) {
    return (
      <div className="invite-screen">
        <h2>Uzaicināt draugu</h2>

        <div className="ranked-info">
          <p style={{ marginBottom: "15px" }}>Izvēlies grūtības līmeni:</p>
          <div className="difficulty-options" style={{ margin: "0 auto 20px" }}>
            {(["easy", "medium", "hard"] as const).map((diff) => (
              <button
                key={diff}
                className={`win95-button difficulty-button ${selectedDifficulty === diff ? "active" : ""}`}
                onClick={() => {
                  playSound("menuClick");
                  setSelectedDifficulty(diff);
                }}
                style={{
                  background: selectedDifficulty === diff ? "#aaffaa" : undefined,
                }}
              >
                <strong>{difficultyLabels[diff].split(" (")[0]}</strong>
                <small>{difficultyLabels[diff].match(/\((.+)\)/)?.[1]}</small>
              </button>
            ))}
          </div>
        </div>

        <div className="invite-buttons">
          <button
            className="win95-button start-button"
            onClick={handleCreateInvite}
            disabled={isCreating}
          >
            {isCreating ? "Veido..." : "Izveidot uzaicinājumu"}
          </button>

          <Link to="/ranked" className="win95-button back-button">
            ← Atpakaļ
          </Link>
        </div>
      </div>
    );
  }

  // Invite created - show waiting screen
  return (
    <div className="invite-screen">
      <h2>Gaida draugu...</h2>

      <div className="invite-code-box">
        <div className="invite-code-label">Uzaicinājuma kods:</div>
        <div className="invite-code">{inviteCode}</div>
      </div>

      <div className="invite-link-box">
        {getInviteLink()}
      </div>

      <div className="ranked-info" style={{ textAlign: "center", marginBottom: "20px" }}>
        <p>Grūtība: <strong>{difficultyLabels[selectedDifficulty]}</strong></p>
      </div>

      <div className="invite-share-buttons">
        <button className="win95-button" onClick={handleCopyLink}>
          {copied ? "Nokopēts!" : "Kopēt saiti"}
        </button>
        {"share" in navigator && (
          <button className="win95-button" onClick={handleShare}>
            Dalīties
          </button>
        )}
      </div>

      <div className="waiting-message">
        Gaida, kad draugs pievienosies
        <span className="waiting-dots">...</span>
      </div>

      <div className="invite-buttons">
        <button className="win95-button cancel-button" onClick={handleCancel}>
          Atcelt
        </button>
      </div>
    </div>
  );
}
