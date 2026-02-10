import { Card, Difficulty } from '../types';
import { TABLEAU_COLS, STOCK_DEAL_SIZE } from '../constants';
import { createDeck, shuffle } from './deck';

export interface DealResult {
  tableau: Card[][];
  stock: Card[][];
}

/**
 * Deal initial game layout.
 * 54 cards go to tableau (first 4 columns get 6 cards, last 6 get 5 cards).
 * Remaining 50 cards split into 5 stock piles of 10.
 * Only the top card of each tableau column is face-up.
 */
export function dealInitial(difficulty: Difficulty): DealResult {
  const deck = shuffle(createDeck(difficulty));

  const tableau: Card[][] = [];
  let cardIndex = 0;

  for (let col = 0; col < TABLEAU_COLS; col++) {
    const count = col < 4 ? 6 : 5;
    const column: Card[] = [];
    for (let i = 0; i < count; i++) {
      const card = { ...deck[cardIndex++] };
      card.faceUp = i === count - 1; // only last card face up
      column.push(card);
    }
    tableau.push(column);
  }

  // Remaining cards split into stock piles of 10
  const stock: Card[][] = [];
  while (cardIndex < deck.length) {
    const pile: Card[] = [];
    for (let i = 0; i < STOCK_DEAL_SIZE && cardIndex < deck.length; i++) {
      pile.push({ ...deck[cardIndex++] });
    }
    stock.push(pile);
  }

  return { tableau, stock };
}
