import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { LeaderboardModal } from "./LeaderboardModal";
import { AboutModal } from "./AboutModal";
import { StatsModal } from "./StatsModal";
import { useSound } from "~/hooks/useSound";

export function MenuBar() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("lingo_animations_enabled");
      return stored !== "false";
    }
    return true;
  });
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { play: playSound, enabled: soundEnabled, toggle: toggleSound } = useSound();

  const [playerId] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("lingo_player_id") || "";
    }
    return "";
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Apply animations class to body
  useEffect(() => {
    if (typeof document !== "undefined") {
      if (animationsEnabled) {
        document.body.classList.remove("animations-disabled");
      } else {
        document.body.classList.add("animations-disabled");
      }
    }
  }, [animationsEnabled]);

  const toggleAnimations = useCallback(() => {
    playSound("menuClick");
    setAnimationsEnabled((prev) => {
      const newValue = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("lingo_animations_enabled", String(newValue));
      }
      return newValue;
    });
  }, [playSound]);

  const handleMenuClick = (menu: string) => {
    playSound("menuClick");
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const handleNewGame = () => {
    playSound("menuClick");
    setOpenMenu(null);
    navigate({ to: "/solo" });
  };

  const handleRankedMode = () => {
    playSound("menuClick");
    setOpenMenu(null);
    navigate({ to: "/ranked" });
  };

  const handleLeaderboard = () => {
    playSound("menuClick");
    setOpenMenu(null);
    setShowLeaderboard(true);
  };

  const handleAbout = () => {
    playSound("menuClick");
    setOpenMenu(null);
    setShowAbout(true);
  };

  const handleToggleSound = () => {
    toggleSound();
    playSound("menuClick");
  };

  const handleStats = () => {
    playSound("menuClick");
    setOpenMenu(null);
    setShowStats(true);
  };

  return (
    <>
      <div className="menu-bar" ref={menuRef}>
        <div className="menu-item">
          <button
            className={`menu-button ${openMenu === "game" ? "active" : ""}`}
            onClick={() => handleMenuClick("game")}
          >
            Spēle
          </button>
          {openMenu === "game" && (
            <div className="menu-dropdown">
              <button className="menu-dropdown-item" onClick={handleNewGame}>
                Jauna spēle
              </button>
              <button className="menu-dropdown-item" onClick={handleRankedMode}>
                Duelis
              </button>
              <div className="menu-separator" />
              <button
                className="menu-dropdown-item"
                onClick={handleLeaderboard}
              >
                Līderu saraksts
              </button>
            </div>
          )}
        </div>

        <div className="menu-item">
          <button
            className={`menu-button ${openMenu === "options" ? "active" : ""}`}
            onClick={() => handleMenuClick("options")}
          >
            Opcijas
          </button>
          {openMenu === "options" && (
            <div className="menu-dropdown">
              <button
                className="menu-dropdown-item checkbox"
                onClick={handleToggleSound}
              >
                <span className={`menu-checkbox ${soundEnabled ? "checked" : ""}`}></span>
                Skaņas
              </button>
              <button
                className="menu-dropdown-item checkbox"
                onClick={toggleAnimations}
              >
                <span className={`menu-checkbox ${animationsEnabled ? "checked" : ""}`}></span>
                Animācijas
              </button>
              <div className="menu-separator" />
              <button className="menu-dropdown-item" onClick={handleStats}>
                Statistika
              </button>
            </div>
          )}
        </div>

        <div className="menu-item">
          <button
            className={`menu-button ${openMenu === "help" ? "active" : ""}`}
            onClick={() => handleMenuClick("help")}
          >
            Palīgs
          </button>
          {openMenu === "help" && (
            <div className="menu-dropdown">
              <button className="menu-dropdown-item" onClick={handleAbout}>
                Par programmu
              </button>
            </div>
          )}
        </div>
      </div>

      {showLeaderboard && (
        <LeaderboardModal onClose={() => setShowLeaderboard(false)} />
      )}
      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
      {showStats && playerId && (
        <StatsModal onClose={() => setShowStats(false)} playerId={playerId} />
      )}
    </>
  );
}
