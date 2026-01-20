# Lingo v2 - PRD Update Plan

## Overview

Update the existing Lingo game with:
1. New difficulty levels (4/5/6 letters instead of 5/7/9)
2. Invite link system for private multiplayer (5-digit codes)
3. Visual refinements to match reference image exactly
4. Social share preview images (Open Graph)
5. User engagement/retention features (streaks + stats)

**Target Platform:** Mobile first (desktop secondary)

**Reference Image:** `/Users/dagnisslogis/Downloads/download (1).png`

---

## Changes from Current Implementation

| Aspect | Current | New |
|--------|---------|-----|
| Easy difficulty | 5 letters | 4 letters |
| Classic/Medium | 7 letters | 5 letters |
| Hard | 9 letters | 6 letters |
| Multiplayer join | Random matchmaking only | Random + Invite links |
| Menu bar | Spēle, Palīgs | Spēle, Opcijas, Palīgs |
| Title bar | Blue | Yellow (Win95 classic) |
| Social preview | None | Custom OG image |
| Leaderboard | Existing data | **Fresh start - delete old data** |

---

## 1. Difficulty Changes

### Files to Modify
- `app/hooks/useGame.ts` - Update WORD_LENGTHS constant
- `app/routes/solo/index.tsx` - Update difficulty labels
- `convex/words.ts` - Update word seeding logic
- `convex/matchmaking.ts` - Update random difficulty selection

### Implementation
```typescript
// New difficulty mapping
const WORD_LENGTHS = {
  easy: 4,    // Was 5
  medium: 5,  // Was 7 (display as "Klasiskais")
  hard: 6,    // Was 9
};
```

### Migration
- Re-seed word database with 4, 5, 6 letter Latvian words (use existing common words system)
- **Delete existing leaderboard data** - old scores not comparable with new difficulties

---

## 2. Invite Link System

### New Routes
- `/ranked/invite` - Create invite screen (host waiting screen)
- `/ranked/join/$inviteCode` - Join via invite link

### New Convex Tables
```typescript
// Add to schema.ts
invites: defineTable({
  inviteCode: v.string(),      // 5 digits (e.g., "48271")
  hostPlayerId: v.string(),
  hostPlayerName: v.string(),
  status: v.string(),          // "waiting" | "matched" | "cancelled"
  matchId: v.optional(v.id("matches")),
  difficulty: v.string(),      // Host chooses difficulty
  createdAt: v.number(),
}).index("by_code", ["inviteCode"])
  .index("by_host", ["hostPlayerId"])
  .index("by_status", ["status"])
```

### Invite Code Rules
- **5 numeric digits** (e.g., "48271", "00123")
- Easy to read/type on phone
- **Valid indefinitely** while host is on waiting screen
- Invalid when:
  - Host leaves the invite screen (cancelled)
  - Match starts (status → matched)
  - Someone joins (immediately starts match)

### New Functions (convex/invites.ts)
- `createInvite(playerId, playerName, difficulty)` - Generate 5-digit code
- `getInvite(inviteCode)` - Get invite details (returns null if invalid/cancelled)
- `joinInvite(inviteCode, playerId, playerName)` - Join and create match immediately
- `cancelInvite(inviteCode, playerId)` - Called when host leaves screen

### UI Flow
1. **Host:** Ranked → "Uzaicināt draugu" → Select difficulty → **Dedicated waiting screen** with:
   - Large invite code display
   - Shareable link (copy button + native share)
   - "Gaida draugu..." message
   - Cancel button to go back
2. **Guest:** Opens link → Sees host info → Auto-joins (or click "Pievienoties")
3. **Both:** Redirected to match immediately

### Join Method
- **Link only** - no manual code entry field
- Format: `https://[domain]/ranked/join/48271`

### Share Features
- Copy link button
- Native share API on mobile

### Host Behavior
- **Can freely cancel and create new invites** (no cooldown)
- New invite = new code

---

## 3. Visual Refinements (Match Reference Image)

### Reference
See: `/Users/dagnisslogis/Downloads/download (1).png`

### Title Bar
- Change from blue (#000080) to **Win95 classic yellow/gold gradient**
- Keep classic buttons but adjust styling to match

### Menu Bar
- Add "Opcijas" (Options) menu between Spēle and Palīgs
- **Opcijas menu items (3 total):**
  1. Skaņas (Sounds) - toggle checkbox
  2. Animācijas (Animations) - toggle checkbox
  3. Statistika - opens stats modal

### Animations Toggle
- When OFF: **Disables ALL CSS animations** (flip, shake, bounce, pop, etc.)
- Respects `prefers-reduced-motion` by default

### Game Board
- Cyan/teal background (#00BFBF or per reference)
- Tile colors (from reference):
  - **Correct:** Bright green (#00FF00)
  - **Present:** Yellow (#FFFF00)
  - **Wrong/Absent:** Red (#FF0000) with darker shade
  - **Empty:** Gray (#C0C0C0)
- 3D beveled tile effect (Win95 style borders)

### Hearts & Score
- Hearts on left (3 red hearts in a row): ❤️❤️❤️
- Score "0" on right
- Same row, classic Win95 inset panel style

### CSS Updates (public/styles/win95.css)
- Title bar color → yellow gradient
- Fine-tune tile colors to match reference exactly
- Ensure exact Windows 95 button/panel aesthetics

---

## 4. Social Share Preview

### Open Graph Meta Tags (index.html)
```html
<meta property="og:title" content="Lingo - Latviešu vārdu spēle">
<meta property="og:description" content="Uzmini vārdu 6 mēģinājumos! Retro Windows 95 stila vārdu spēle latviešu valodā.">
<meta property="og:image" content="https://[DOMAIN]/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
```

**Note:** Domain TBD - will be provided later

### OG Image
- **User will provide custom image**
- Expected size: 1200x630px
- Place in `public/og-image.png`

### Dynamic OG for Invites
- **Deferred to V2** (requires SSR)
- For now: static OG image for all pages

---

## 5. Engagement & Retention Features

### Daily Streak System
```typescript
// Add to players table
dailyStreak: v.number(),
lastPlayedAt: v.number(),
longestStreak: v.number(),
totalGamesPlayed: v.number(),
totalWins: v.number(),
```

**Streak Rules:**
- **Must WIN at least one game** to count as played day
- Streak resets at **midnight UTC**
- Track consecutive days with wins
- Show streak flame icon on home screen
- Display: "Sērija: 5 dienas 🔥"

### Stats Dashboard (Opcijas → Statistika)

**Separate stats for Solo and Ranked:**

**Solo Stats:**
- Kopā spēles (Total games)
- Uzvaras % (Win rate)
- Vidējie mēģinājumi (Average guesses per win)
- Iecienītākais līmenis (Most played difficulty)

**Ranked Stats:**
- Kopā mači (Total matches)
- Uzvaras % (Win rate)
- Reitings (Current rating)
- Labākais reitings (Peak rating)

**Global:**
- Labākā sērija (Longest daily streak)
- Kopējās dienas (Total days played)

### Quick Play Button (MVP - Required)
- "Turpināt" (Continue) button on home screen
- Remembers last played difficulty
- One-tap to start new game in that mode
- Shows last difficulty: "Turpināt (Klasiskais)"

---

## 6. Ranked Match Rules

### Disconnect Handling
- **Auto-loss for disconnected player**
- No reconnect window
- Opponent wins immediately

---

## Files to Create

### New Files
1. `convex/invites.ts` - Invite system functions
2. `app/routes/ranked/invite.tsx` - Create invite page (host waiting screen)
3. `app/routes/ranked/join.$inviteCode.tsx` - Join invite page
4. `app/components/InviteScreen.tsx` - Invite creation/sharing UI
5. `app/components/StreakDisplay.tsx` - Daily streak widget
6. `app/components/StatsModal.tsx` - Player statistics modal
7. `public/og-image.png` - Social share image (user provided)

### Files to Modify
1. `convex/schema.ts` - Add invites table, streak fields to players
2. `app/hooks/useGame.ts` - Update WORD_LENGTHS (4/5/6)
3. `app/routes/solo/index.tsx` - Update difficulty labels
4. `app/routes/index.tsx` - Add streak display, quick play button
5. `app/components/MenuBar.tsx` - Add "Opcijas" menu with Statistika, Skaņas, Animācijas
6. `public/styles/win95.css` - Yellow title bar, tile colors per reference
7. `index.html` - Add OG meta tags
8. `convex/words.ts` - Support 4/5/6 letter words
9. `convex/players.ts` - Add streak tracking functions
10. `convex/matchmaking.ts` - Update difficulty selection
11. `convex/leaderboard.ts` - Clear old data, update for new difficulties

---

## Implementation Order

### Phase 1: Core Changes
1. Update difficulty constants (4/5/6 letters)
2. Update/re-seed word database for new lengths
3. Update UI labels (Viegls 4 burti, Klasiskais 5 burti, Grūts 6 burti)
4. Delete old leaderboard data

### Phase 2: Visual Polish
1. Title bar color → Win95 yellow
2. Add Opcijas menu (Skaņas, Animācijas, Statistika)
3. Fine-tune tile/board colors per reference image
4. Verify Win95 aesthetic matches reference exactly

### Phase 3: Invite System
1. Create invites table & Convex functions
2. Build host invite/waiting screen
3. Build guest join page
4. Add share functionality (copy + native share)
5. Handle invite lifecycle (create, join, cancel)

### Phase 4: Social & Engagement
1. Add OG meta tags (static for now)
2. Place OG image when provided
3. Implement streak tracking (win-based, UTC midnight reset)
4. Add stats dashboard modal (separate Solo/Ranked)
5. Add Quick Play button on home screen

---

## Verification Checklist

### Difficulty Changes
- [ ] 4-letter easy mode works with seeded words
- [ ] 5-letter classic mode works
- [ ] 6-letter hard mode works
- [ ] Old leaderboard data deleted
- [ ] New leaderboards work for new difficulties

### Invite System
- [ ] Host can create invite and select difficulty
- [ ] Invite code is 5 numeric digits
- [ ] Host sees dedicated waiting screen with large code
- [ ] Copy link button works
- [ ] Native share works on mobile
- [ ] Guest can open link and join
- [ ] Match starts immediately on join
- [ ] Match uses host-selected difficulty
- [ ] Invite cancelled when host leaves screen
- [ ] Host can create new invite after cancelling (no cooldown)

### Visual
- [ ] Title bar is Win95 yellow per reference image
- [ ] "Opcijas" menu appears between Spēle and Palīgs
- [ ] Opcijas has: Skaņas, Animācijas, Statistika
- [ ] Skaņas toggle works
- [ ] Animācijas toggle disables ALL animations
- [ ] Statistika opens stats modal
- [ ] Tile colors match reference (green/yellow/red)
- [ ] Game board has cyan background

### Ranked
- [ ] Disconnect = auto-loss for disconnected player

### Social & Engagement
- [ ] OG meta tags render preview on share
- [ ] Streak increments when winning on consecutive days
- [ ] Streak resets after missing a day (UTC midnight)
- [ ] Stats modal shows Solo and Ranked separately
- [ ] Quick Play button appears on home screen
- [ ] Quick Play remembers last difficulty
