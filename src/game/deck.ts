import { Card, Difficulty, Suit } from '../types';
import { ALL_RANKS, ALL_SUITS } from '../constants';

/** Create a deck of cards for the given difficulty. Spider uses 104 cards (8 suits worth). */
export function createDeck(difficulty: Difficulty): Card[] {
  const suits = getSuitsForDifficulty(difficulty);
  const cards: Card[] = [];

  // We need 8 full suits (104 cards). Repeat the chosen suits to fill 8 slots.
  for (let copy = 0; copy < 8; copy++) {
    const suit = suits[copy % suits.length];
    for (const rank of ALL_RANKS) {
      cards.push({
        suit,
        rank,
        faceUp: false,
        id: `${suit[0]}-${rank}-${copy}`,
      });
    }
  }

  return cards;
}

function getSuitsForDifficulty(difficulty: Difficulty): Suit[] {
  switch (difficulty) {
    case 'easy':
      return [ALL_SUITS[0]]; // spades only
    case 'medium':
      return [ALL_SUITS[0], ALL_SUITS[1]]; // spades + hearts
    case 'hard':
      return ALL_SUITS; // all 4
  }
}

/** Fisher-Yates shuffle (in-place). */
export function shuffle<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
