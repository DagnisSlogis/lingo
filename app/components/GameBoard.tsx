import { useEffect, useRef } from "react";
import { Tile, type TileState } from "./Tile";

export interface BoardRow {
  letters: string[];
  states: TileState[];
  submitted: boolean;
}

interface GameBoardProps {
  board: BoardRow[];
  currentRow: number;
  currentGuess: string;
  wordLength: number;
  onKeyPress: (key: string) => void;
  onSubmit: () => void;
  onBackspace: () => void;
}

export function GameBoard({
  board,
  currentRow,
  currentGuess,
  wordLength,
  onKeyPress,
  onSubmit,
  onBackspace,
}: GameBoardProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [currentRow]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
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
  }, [onKeyPress, onSubmit, onBackspace]);

  return (
    <div className="game-board" onClick={() => inputRef.current?.focus()}>
      {/* Hidden input for mobile keyboard */}
      <input
        ref={inputRef}
        type="text"
        className="hidden-input"
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        value=""
        onChange={(e) => {
          const char = e.target.value.slice(-1);
          if (/^[a-zA-ZāčēģīķļņšūžĀČĒĢĪĶĻŅŠŪŽ]$/.test(char)) {
            onKeyPress(char.toLowerCase());
          }
        }}
      />

      <div className="board-grid">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="board-row">
            {Array.from({ length: wordLength }).map((_, colIndex) => {
              const isCurrentRow = rowIndex === currentRow;
              const letter = isCurrentRow && !row.submitted
                ? currentGuess[colIndex] || row.letters[colIndex] || ""
                : row.letters[colIndex] || "";
              const state = row.submitted ? row.states[colIndex] : "empty";
              const isRevealed = row.submitted || (isCurrentRow && colIndex === 0 && row.letters[0]);

              return (
                <Tile
                  key={colIndex}
                  letter={letter}
                  state={state}
                  isActive={isCurrentRow && colIndex === currentGuess.length && !row.submitted}
                  isRevealed={!!isRevealed}
                  delay={colIndex * 100}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
