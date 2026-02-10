export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';
export type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Card {
  suit: Suit;
  rank: Rank;
  faceUp: boolean;
  id: string; // unique identifier e.g. "s-1-0" (suit-rank-deckCopy)
}

export interface GameState {
  tableau: Card[][]; // 10 columns
  stock: Card[][]; // groups of 10 cards to deal
  completedSuits: number;
  moves: number;
  startTime: number; // Date.now() when game started
  elapsed: number; // accumulated ms (paused time excluded)
  difficulty: Difficulty;
  undoStack: UndoAction[];
  won: boolean;
}

export interface UndoAction {
  type: 'move' | 'deal' | 'complete-sequence';
  groupId: string; // links related actions (e.g. move + auto-complete)
  // For 'move':
  fromCol?: number;
  toCol?: number;
  count?: number; // number of cards moved
  flippedCard?: boolean; // did we flip a card in the source column?
  // For 'deal':
  dealtCards?: { col: number; card: Card }[];
  // For 'complete-sequence':
  col?: number;
  cards?: Card[]; // the 13 cards removed
  flippedCardAfter?: boolean; // did we flip a card after removal?
}

export interface Selection {
  col: number;
  startIndex: number; // index within the column
}

export interface Stats {
  gamesWon: number;
  gamesLost: number;
  totalTime: number; // total time of won games in ms
  fastestWin: number | null; // ms
  minimumMoves: number | null;
}

export interface AllStats {
  easy: Stats;
  medium: Stats;
  hard: Stats;
}
