import { Card, GameState } from '../types';
import { SEQUENCE_LENGTH } from '../constants';

/**
 * Can the player pick up cards from `col` starting at `startIndex`?
 * The sub-stack must be a descending same-suit sequence of face-up cards.
 */
export function canPickUp(state: GameState, col: number, startIndex: number): boolean {
  const column = state.tableau[col];
  if (startIndex < 0 || startIndex >= column.length) return false;

  for (let i = startIndex; i < column.length; i++) {
    if (!column[i].faceUp) return false;
    if (i > startIndex) {
      // Must be same suit, descending by 1
      if (column[i].suit !== column[i - 1].suit) return false;
      if (column[i].rank !== column[i - 1].rank - 1) return false;
    }
  }
  return true;
}

/**
 * Can the picked-up cards be placed on `targetCol`?
 * Either the column is empty (any card can go), or the bottom card of the
 * moved group must be exactly 1 rank below the top card of the target column.
 */
export function canPlace(state: GameState, sourceCol: number, startIndex: number, targetCol: number): boolean {
  if (sourceCol === targetCol) return false;

  const targetColumn = state.tableau[targetCol];
  const movingCard = state.tableau[sourceCol][startIndex];

  // Empty column: anything goes
  if (targetColumn.length === 0) return true;

  const topCard = targetColumn[targetColumn.length - 1];
  return topCard.rank === movingCard.rank + 1;
}

/**
 * Check if the top 13 cards of a column form a complete K-A same-suit sequence.
 * Returns the starting index of the sequence, or -1 if none found.
 */
export function findCompleteSequence(column: Card[]): number {
  if (column.length < SEQUENCE_LENGTH) return -1;

  const startIdx = column.length - SEQUENCE_LENGTH;

  // Check that all 13 cards are face-up, same suit, descending K(13) to A(1)
  const suit = column[startIdx].suit;
  for (let i = 0; i < SEQUENCE_LENGTH; i++) {
    const card = column[startIdx + i];
    if (!card.faceUp) return -1;
    if (card.suit !== suit) return -1;
    if (card.rank !== (SEQUENCE_LENGTH - i) as Card['rank']) return -1;
  }

  return startIdx;
}

/** Check if the game is won (8 completed suits). */
export function isWon(state: GameState): boolean {
  return state.completedSuits >= 8;
}

/**
 * Can the player deal from the stock?
 * Requires: stock has piles left AND no empty tableau columns.
 */
export function canDeal(state: GameState): boolean {
  if (state.stock.length === 0) return false;
  return state.tableau.every(col => col.length > 0);
}
