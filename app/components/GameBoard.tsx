import { useEffect, useRef, useState } from "react";
import { Tile, type TileState } from "./Tile";

export interface BoardRow {
  letters: string[];
  states: TileState[];
  submitted: boolean;
}

export type RowAnimation = "shake" | "bounce" | null;

interface GameBoardProps {
  board: BoardRow[];
  currentRow: number;
  currentGuess: string;
  wordLength: number;
  onKeyPress: (key: string) => void;
  onSubmit: () => void;
  onBackspace: () => void;
  rowAnimation?: { row: number; type: RowAnimation };
  disabled?: boolean;
  lastTypedIndex?: number;
}

export function GameBoard({
  board,
  currentRow,
  currentGuess,
  wordLength,
  onKeyPress,
  onSubmit,
  onBackspace,
  rowAnimation,
  disabled = false,
  lastTypedIndex = -1,
}: GameBoardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [popTile, setPopTile] = useState<{ row: number; col: number } | null>(null);

  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [currentRow, disabled]);

  // Trigger pop animation when typing
  useEffect(() => {
    if (lastTypedIndex >= 0 && currentGuess.length > 0) {
      setPopTile({ row: currentRow, col: currentGuess.length - 1 });
      const timer = setTimeout(() => setPopTile(null), 100);
      return () => clearTimeout(timer);
    }
  }, [currentGuess, currentRow, lastTypedIndex]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (disabled) return;

      if (e.key === "Enter") {
        e.preventDefault();
        onSubmit();
      } else if (e.key === "Backspace") {
        e.preventDefault();
        onBackspace();
      } else if (e.key.length === 1 && /^[a-zA-ZāčēģīķļņšūžĀČĒĢĪĶĻŅŠŪŽ]$/.test(e.key)) {
        e.preventDefault();
        onKeyPress(e.key.toLowerCase());
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onKeyPress, onSubmit, onBackspace, disabled]);

  return (
    <div className="game-board" onClick={() => !disabled && inputRef.current?.focus()}>
      {/* Hidden input for mobile keyboard */}
      <input
        ref={inputRef}
        type="text"
        className="hidden-input"
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        value=""
        disabled={disabled}
        onChange={(e) => {
          if (disabled) return;
          const char = e.target.value.slice(-1);
          if (/^[a-zA-ZāčēģīķļņšūžĀČĒĢĪĶĻŅŠŪŽ]$/.test(char)) {
            onKeyPress(char.toLowerCase());
          }
        }}
      />

      <div className="board-grid">
        {board.map((row, rowIndex) => {
          const animationClass = rowAnimation?.row === rowIndex && rowAnimation?.type
            ? rowAnimation.type
            : "";

          return (
            <div key={rowIndex} className={`board-row ${animationClass}`}>
              {Array.from({ length: wordLength }).map((_, colIndex) => {
                const isCurrentRow = rowIndex === currentRow;
                const letter = isCurrentRow && !row.submitted
                  ? currentGuess[colIndex] || row.letters[colIndex] || ""
                  : row.letters[colIndex] || "";
                const state = row.submitted ? row.states[colIndex] : "empty";
                const isRevealed = row.submitted || (isCurrentRow && colIndex === 0 && row.letters[0]);
                const isPop = popTile?.row === rowIndex && popTile?.col === colIndex;

                return (
                  <Tile
                    key={colIndex}
                    letter={letter}
                    state={state}
                    isActive={isCurrentRow && colIndex === currentGuess.length && !row.submitted}
                    isRevealed={!!isRevealed}
                    delay={colIndex * 100}
                    index={colIndex}
                    isPop={isPop}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
