import { useState, useRef, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { LeaderboardModal } from "./LeaderboardModal";
import { AboutModal } from "./AboutModal";

export function MenuBar() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMenuClick = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const handleNewGame = () => {
    setOpenMenu(null);
    navigate({ to: "/solo" });
  };

  const handleRankedMode = () => {
    setOpenMenu(null);
    navigate({ to: "/ranked" });
  };

  const handleLeaderboard = () => {
    setOpenMenu(null);
    setShowLeaderboard(true);
  };

  const handleAbout = () => {
    setOpenMenu(null);
    setShowAbout(true);
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
                Ranžēts režīms
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
    </>
  );
}
