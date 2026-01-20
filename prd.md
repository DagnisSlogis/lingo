 # Lingo - Latvian Word Game Implementation Plan

  ## Overview

  Build a Windows 95 retro-styled Latvian word guessing game (Lingo TV show clone) with:
  - **Solo Arcade Mode**: Classic 3-hearts survival with leaderboards
  - **Ranked Multiplayer**: Head-to-head battles on shared board

  **Note:** This plan significantly deviates from the original PRD based on user interview.

  ---

  ## Key Changes from Original PRD

  | Aspect | Original PRD | Revised (from interview) |
  |--------|--------------|--------------------------|
  | Game mode | Daily word (Wordle-style) | Arcade mode (unlimited play) |
  | Lives | 6 attempts | 3 hearts, 6 rows per game |
  | Visual style | Modern/minimalist | Windows 95 retro exact replica |
  | First letter | Hidden | Revealed |
  | On-screen keyboard | Yes, Latvian layout | No, use device keyboard |
  | Stats storage | localStorage | Convex only |
  | Leaderboard | Future feature | MVP requirement |
  | Sound | Not specified | Retro 8-bit sounds |

  ---

  ## Visual Design - Windows 95 Style

  **CRITICAL: Consistent Win95 aesthetic throughout entire app**

  Based on reference image: Classic Lingo TV show interface

  Every element must match Windows 95 style:
  - Buttons: 3D beveled, gray with black/white edges
  - Inputs: Sunken inset borders
  - Modals: Classic dialog boxes with title bars
  - Fonts: System fonts (MS Sans Serif style, or modern equivalent like "Pixelated MS Sans
  Serif")
  - Colors: Classic Windows gray (#C0C0C0), with accent colors only in game tiles
  - Dropdowns: Classic dropdown menus with hover highlight
  - Scrollbars: Classic scrollbar style (if needed)
  - Focus states: Dotted outline rectangles

  ### Window Chrome
  - Title bar with "Lingo" title
  - Min/Max/Close buttons (decorative only, no function)
  - Beveled edges, 3D button effects
  - Gray system color palette for chrome

  ### UI Language: All Latvian
  - Spēle (Game)
  - Jauna spēle (New Game)
  - Līderu saraksts (Leaderboard)
  - Palīgs (Help)
  - Par programmu (About)

  ### Game Area
  - Bright green background (#00FF00 or similar)
  - Grid tiles with beveled inset effect
  - Colors: Green (correct), Yellow (present), Red/Gray (wrong)

  ### Menu Bar
  - **Spēle**: Jauna spēle, Ranžēts režīms, Līderu saraksts
  - **Palīgs**: Par programmu

  *(Ranžēts režīms = Ranked mode)*

  ---

  ## Game Modes

  ### Solo Arcade Mode
  - Classic single-player survival
  - 3 hearts, 6 guesses per word
  - Cumulative score until game over
  - Leaderboard entry on game over

  ### Ranked Multiplayer Mode
  - Head-to-head competitive matches
  - Random matchmaking (indefinite queue)
  - First to lose 3 hearts loses the match

  ---

  ## Multiplayer Mechanics

  ### Shared Board System
  - Both players guess on the SAME board
  - 6 total rows shared (3 guesses per player max)
  - Players alternate turns (one guess each)
  - Who goes first alternates each round
  - Both players see and build on revealed letters

  ### Turn Flow
  1. Player A guesses → colors revealed
  2. Player B guesses (using info from Player A) → colors revealed
  3. Continue alternating until word solved or 6 rows used

  ### Round Outcomes
  | Outcome | Result |
  |---------|--------|
  | Player guesses correctly | Round ends, loser loses 1 heart, winner gets points |
  | All 6 rows used, not solved | Both players lose 1 heart, new round |

  ### Match End
  - First player to lose all 3 hearts loses the match
  - Winner gains ranking points, loser loses points

  ### Time Limit
  - **30 seconds per guess** (strict)
  - Auto-skip if time runs out (counts as wasted guess)

  ### Difficulty
  - Random difficulty per round (5, 7, or 9 letters)
  - Adds variety and tests adaptability

  ### Disconnect Handling
  - Wait 30 seconds for reconnect
  - If no reconnect, remaining player wins

  ### Pre-Match Display
  - Show opponent's auto-generated name
  - Show opponent's rank/rating
  - Show opponent's stats (wins, losses)

  ---

  ## Game Mechanics (Solo Mode)

  ### Core Loop
  1. Player selects difficulty (5/7/9 letters)
  2. Word is randomly selected, first letter revealed
  3. Player has 6 rows to guess
  4. Win: Points added based on attempts (fewer = more)
  5. Lose: Lose 1 heart
  6. 3 hearts lost = Game Over, score to leaderboard

  ### Scoring (Exponential)
  | Attempt | Points |
  |---------|--------|
  | 1st try | 500 |
  | 2nd try | 200 |
  | 3rd try | 100 |
  | 4th try | 50 |
  | 5th try | 25 |
  | 6th try | 10 |

  - Cumulative total until game over

  ### Input
  - Physical keyboard + mobile virtual keyboard
  - Permissive (any letter combo accepted)
  - Hidden input field, letters appear in tiles
  - First letter pre-displayed (not locked)

  ### Duplicate Letters
  - Standard Wordle rules (only mark as many as exist in answer)

  ---

  ## Tech Stack

  - **Frontend**: TanStack Start (React)
  - **Backend**: Convex (serverless, real-time)
  - **Deployment**: Vercel
  - **Styling**: CSS (Windows 95 aesthetic - possibly 98.css library)

  ### Convex Real-Time Strategy

  **Live Subscription Queries** (critical for multiplayer):
  - `useQuery` for match state - auto-updates when opponent makes a guess
  - `useQuery` for matchmaking queue - detects when matched
  - `useQuery` for player stats - live ranking updates

  **Key Subscriptions:**
  ```typescript
  // Match state - both players subscribe
  const match = useQuery(api.matches.getMatch, { matchId });

  // Matchmaking queue status
  const queueStatus = useQuery(api.matchmaking.getStatus, { playerId });

  // Leaderboard (updates when new scores posted)
  const leaderboard = useQuery(api.leaderboard.getTop, { difficulty, limit: 25 });
  ```

  **Benefits:**
  - No polling needed - instant updates
  - Both players see guesses in real-time
  - Turn changes reflected immediately
  - Timer sync across clients

  ---

  ## Data Model (Convex)

  ### `words` table
  ```typescript
  {
  _id: Id<"words">,
  word: string,        // Latvian word (lowercase)
  length: number,      // 5, 7, or 9
  difficulty: string,  // "easy" | "medium" | "hard"
  }
  ```

  ### `leaderboard` table
  ```typescript
  {
  _id: Id<"leaderboard">,
  playerId: string,       // Random UUID
  playerName: string,     // Auto-generated funny name
  score: number,
  difficulty: string,     // "easy" | "medium" | "hard"
  gamesWon: number,
  createdAt: number,      // timestamp
  }
  ```

  ### `players` table
  ```typescript
  {
  _id: Id<"players">,
  odlayerId: string,      // Random UUID
  name: string,           // Auto-generated funny name
  rankedRating: number,   // Points-based rating (starts at 1000)
  rankedWins: number,
  rankedLosses: number,
  createdAt: number,
  }
  ```

  ### `matches` table (multiplayer)
  ```typescript
  {
  _id: Id<"matches">,
  player1Id: string,
  player2Id: string,
  status: string,         // "waiting" | "active" | "finished"
  currentWord: string,
  currentDifficulty: string,
  currentRound: number,
  currentTurn: string,    // playerId whose turn it is
  guesses: string[],      // All guesses made this round
  player1Hearts: number,
  player2Hearts: number,
  player1Score: number,
  player2Score: number,
  winnerId: string | null,
  createdAt: number,
  updatedAt: number,
  }
  ```

  ### `matchmaking` table
  ```typescript
  {
  _id: Id<"matchmaking">,
  playerId: string,
  status: string,         // "searching" | "matched"
  matchId: string | null,
  createdAt: number,
  }
  ```

  **Removed:** `dailyWords`, `gameStats` tables

  ---

  ## Project Structure

  ```
  lingo/
  ├── app/
  │   ├── routes/
  │   │   ├── __root.tsx              # Root layout with Win95 window
  │   │   ├── index.tsx               # Mode selection (Solo/Ranked)
  │   │   ├── solo/
  │   │   │   ├── index.tsx           # Solo difficulty selection
  │   │   │   └── $difficulty.tsx     # Solo game screen
  │   │   └── ranked/
  │   │       ├── index.tsx           # Matchmaking queue screen
  │   │       └── match.$matchId.tsx  # Multiplayer game screen
  │   ├── components/
  │   │   ├── Window.tsx              # Win95 window frame
  │   │   ├── MenuBar.tsx             # Dropdown menus
  │   │   ├── GameBoard.tsx           # Grid of tiles (shared for MP)
  │   │   ├── Tile.tsx                # Individual letter tile
  │   │   ├── Hearts.tsx              # Lives display
  │   │   ├── ScoreDisplay.tsx        # Current score
  │   │   ├── Timer.tsx               # 30-second countdown (MP)
  │   │   ├── TurnIndicator.tsx       # Whose turn (MP)
  │   │   ├── OpponentInfo.tsx        # Opponent name/rank (MP)
  │   │   ├── MatchmakingScreen.tsx   # Queue waiting UI
  │   │   ├── PreMatchScreen.tsx      # Show opponent before start
  │   │   ├── LeaderboardModal.tsx    # High scores
  │   │   └── AboutModal.tsx          # About dialog
  │   ├── hooks/
  │   │   ├── useGame.ts              # Solo game state & logic
  │   │   ├── useMultiplayer.ts       # MP game state & Convex sync
  │   │   ├── useMatchmaking.ts       # Queue management
  │   │   ├── useSound.ts             # Sound effects
  │   │   └── usePlayer.ts            # Player identity & stats
  │   ├── lib/
  │   │   ├── wordValidator.ts        # Word matching logic
  │   │   ├── nameGenerator.ts        # Funny name generator
  │   │   └── sounds.ts               # Sound file refs
  │   └── styles/
  │       └── win95.css               # Windows 95 styling
  ├── convex/
  │   ├── schema.ts
  │   ├── words.ts                    # Word queries
  │   ├── players.ts                  # Player management
  │   ├── leaderboard.ts              # Solo leaderboard
  │   ├── matchmaking.ts              # Queue management
  │   └── matches.ts                  # Multiplayer game logic
  ├── public/
  │   └── sounds/                     # 8-bit sound files
  ├── app.config.ts
  ├── package.json
  └── tsconfig.json
  ```

  ---

  ## Implementation Phases

  ### Phase 1: Project Setup
  1. Initialize TanStack Start project
  2. Install dependencies (convex, 98.css or custom)
  3. Configure Convex with full schema
  4. Create basic Win95 window component

  ### Phase 2: Core Game UI
  1. Build GameBoard (6xN grid)
  2. Build Tile component with animations
  3. Implement hidden input + keyboard handling
  4. Add Hearts and Score displays

  ### Phase 3: Solo Game Logic
  1. Implement useGame hook
  2. Random word selection from Convex
  3. Letter validation (green/yellow/gray)
  4. Win/lose detection
  5. Score calculation

  ### Phase 4: Menu & Solo Leaderboard
  1. Build MenuBar with dropdowns
  2. Implement solo leaderboard modal
  3. Auto-generated name system
  4. About modal

  ### Phase 5: Multiplayer Backend
  1. Implement matchmaking queue (Convex)
  2. Create match management mutations
  3. Real-time game state sync
  4. Turn management logic
  5. Disconnect handling

  ### Phase 6: Multiplayer UI
  1. Matchmaking queue screen
  2. Pre-match opponent display
  3. Timer component (30 second countdown)
  4. Turn indicator
  5. Shared board state updates

  ### Phase 7: Ranking System
  1. Points-based rating calculations
  2. Ranked leaderboard (separate from solo)
  3. Player stats display

  ### Phase 8: Sound & Polish
  1. Add retro sound effects
  2. Full animations (flip, pop, shake, bounce)
  3. Error handling with retry feedback
  4. MP-specific sounds (opponent guess, your turn, etc.)

  ### Phase 9: Data Seeding & Launch
  1. Process Tezaurs word list
  2. Seed Convex with 100+ words per difficulty
  3. Deploy to Vercel

  ---

  ## Animations (Required)

  - **Flip**: 3D rotation when revealing letter status
  - **Pop**: Scale bounce when letter is typed
  - **Shake**: Horizontal shake for failed guess
  - **Bounce**: Winning row celebration

  ---

  ## Sound Effects (Required)

  - Key press
  - Letter placed
  - Correct guess
  - Wrong guess
  - Win fanfare
  - Lose/game over
  - Menu click

  ---

  ## Files to Create

  ### Configuration
  - `package.json`
  - `app.config.ts`
  - `tsconfig.json`
  - `.gitignore`
  - `.env.local`

  ### Convex
  - `convex/schema.ts`
  - `convex/words.ts`
  - `convex/leaderboard.ts`

  ### Components (15+)
  - All components listed in project structure

  ### Styles
  - `app/styles/win95.css` (or use 98.css library)

  ### Utilities
  - `app/lib/wordValidator.ts`
  - `app/lib/nameGenerator.ts`

  ---

  ## Verification Checklist

  ### Core UI
  - [ ] Win95 window displays correctly
  - [ ] Menu bar dropdowns work (Spēle, Palīgs)
  - [ ] All UI text in Latvian
  - [ ] Latvian characters (ā, č, ē, ģ, ī, ķ, ļ, ņ, š, ū, ž) display correctly
  - [ ] Mobile keyboard works
  - [ ] All animations play (flip, pop, shake, bounce)
  - [ ] All sound effects play

  ### Solo Mode
  - [ ] Difficulty selection works
  - [ ] First letter is revealed
  - [ ] Keyboard input places letters in tiles
  - [ ] Color feedback is accurate (green/yellow/gray)
  - [ ] Duplicate letter handling follows Wordle rules
  - [ ] Hearts decrease on failed games
  - [ ] Game over at 0 hearts
  - [ ] Exponential score calculates correctly
  - [ ] Solo leaderboard saves and displays top 25
  - [ ] Auto-generated names appear

  ### Multiplayer Mode
  - [ ] Matchmaking queue works (indefinite wait)
  - [ ] Players get matched and redirected to match
  - [ ] Pre-match screen shows opponent info
  - [ ] Shared board updates in real-time (Convex subscriptions)
  - [ ] Turn alternation works correctly
  - [ ] 30-second timer counts down
  - [ ] Timer expiry skips turn
  - [ ] Round ends when word guessed (loser loses heart)
  - [ ] Both lose heart when 6 rows exhausted
  - [ ] Match ends at 0 hearts
  - [ ] Disconnect handling (30s reconnect window)
  - [ ] Winner/loser rating updates correctly
  - [ ] Ranked leaderboard displays correctly

  ---

  ## Open Questions Resolved

  | Question | Answer |
  |----------|--------|
  | Word validation | Permissive (any letters) |
  | Replay completed game | Allow replay, no stats impact (N/A - arcade mode) |
  | Diacritics input | Device keyboard handles it |
  | Offline support | Not needed |
  | Stats storage | Convex only |
  | Timezone | Latvia (for any future time features) |
  | Error handling | Retry with toast notification |

  ---

  ## Dependencies

  ```json
  {
  "dependencies": {
  "@tanstack/react-router": "^1.x",
  "@tanstack/start": "^1.x",
  "convex": "^1.x",
  "react": "^18.x",
  "98.css": "^0.1.x"  // or custom Win95 CSS
  }
  }
  ```
