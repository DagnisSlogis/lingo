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
  gameOver?: boolean;
  won?: boolean;
  targetWord?: string;
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
  gameOver = false,
  won = false,
  targetWord = "",
}: GameBoardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [popTile, setPopTile] = useState<{ row: number; col: number } | null>(null);
  const isComposingRef = useRef(false);

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

      // Skip if the event is from the hidden input (it handles its own keys)
      if (e.target === inputRef.current) return;

      // Only handle Enter and Backspace globally (when input not focused)
      if (e.key === "Enter") {
        e.preventDefault();
        onSubmit();
      } else if (e.key === "Backspace") {
        e.preventDefault();
        onBackspace();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onSubmit, onBackspace, disabled]);

  const processInput = (input: HTMLInputElement) => {
    const value = input.value;
    if (value.length > 0) {
      // Process all characters in the input
      for (const char of value) {
        if (/^[a-zA-ZāčēģīķļņšūžĀČĒĢĪĶĻŅŠŪŽ]$/.test(char)) {
          onKeyPress(char.toLowerCase());
        }
      }
      input.value = "";
    }
  };

  const handleFocus = () => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  };

  return (
    <div
      className="game-board"
      onClick={handleFocus}
      onTouchStart={handleFocus}
    >
      {/* Hidden input for keyboard input including composed characters (e.g., Latvian diacritics) */}
      <input
        ref={inputRef}
        type="text"
        className="hidden-input"
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="done"
        inputMode="text"
        disabled={disabled}
        onCompositionStart={() => {
          isComposingRef.current = true;
        }}
        onCompositionEnd={(e) => {
          isComposingRef.current = false;
          const input = e.target as HTMLInputElement;
          processInput(input);
        }}
        onInput={(e) => {
          if (disabled) return;
          // Don't process during composition (dead keys)
          if (isComposingRef.current) return;
          const input = e.target as HTMLInputElement;
          processInput(input);
        }}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === "Enter") {
            e.preventDefault();
            onSubmit();
          } else if (e.key === "Backspace") {
            e.preventDefault();
            onBackspace();
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

        {/* Answer row - shown when game is over and player lost */}
        {gameOver && !won && targetWord && (
          <div className="board-row answer-row">
            {targetWord.split("").map((letter, colIndex) => (
              <Tile
                key={colIndex}
                letter={letter}
                state="correct"
                isActive={false}
                isRevealed={true}
                delay={colIndex * 100}
                index={colIndex}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
