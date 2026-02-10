# Spider Solitaire — Design Document

A mobile-first Spider Solitaire game built with vanilla TypeScript and Vite. Designed for easy phone use (target user: my dad).

## Game Rules

Standard Spider Solitaire with three difficulty levels:

| Difficulty | Suits | Description |
|------------|-------|-------------|
| Easy       | 1     | Spades only |
| Medium     | 2     | Spades + Hearts |
| Hard       | 4     | All suits |

- **Tableau:** 10 columns. Cards can be stacked down regardless of suit, but only same-suit descending sequences can be moved as a group.
- **Foundation:** A complete King-to-Ace same-suit sequence auto-removes from the tableau.
- **Stock:** 5 stock deals of 10 cards each. Can only deal when all columns have at least one card.
- **Win:** All 8 suits completed.

## UI Layout

```
┌─────────────────────────────────────┐
│ [New Game]  ♠ 0/8  Moves: 0  0:00 ⚙│  ← Header
├─────────────────────────────────────┤
│                                     │
│   10 tableau columns with cards     │  ← Main area
│   overlapping vertically            │
│                                     │
│ [stock]                             │
├─────────────────────────────────────┤
│ [Deal (5)]                   [Undo] │  ← Footer (landscape only)
└─────────────────────────────────────┘
```

**Portrait mode:** Footer is hidden; Deal and Undo buttons appear in the header.

## Interaction

- **Click-to-select, click-to-place.** Tap a face-up card to select it and all cards below in a valid same-suit sequence. Tap a target column to place.
- **Undo:** Unlimited. Each undo counts as a move. Grouped so a move + auto-complete undoes as one action.
- **Timer:** Pauses when the phone is locked or app is backgrounded.

## Tech Stack

- **Vanilla TypeScript** — direct DOM manipulation, no framework
- **Vite** — dev server and build tool
- **Plain CSS** with custom properties
- **vite-plugin-pwa** — offline support and installability
- **GitHub Pages** — deployment

## Data Persistence

- Game state auto-saves to `localStorage` after every move
- Per-difficulty statistics tracked (wins, losses, times, min moves)
- Import/export: JSON → base64 → reverse → char-shift obfuscation

## Architecture

All game logic is pure functions (no side effects) in `src/game/`.
UI rendering in `src/ui/` uses retained DOM with selective updates — only re-render columns that changed.
Single event listener on `#app` via event delegation.
