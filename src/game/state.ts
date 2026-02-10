import { Card, Difficulty, GameState, UndoAction } from '../types';
import { dealInitial } from './dealer';
import { canPickUp, canPlace, canDeal, findCompleteSequence } from './rules';
import { TABLEAU_COLS } from '../constants';

let groupCounter = 0;
function nextGroupId(): string {
  return `g${++groupCounter}`;
}

export function createNewGame(difficulty: Difficulty): GameState {
  const { tableau, stock } = dealInitial(difficulty);
  return {
    tableau,
    stock,
    completedSuits: 0,
    moves: 0,
    startTime: Date.now(),
    elapsed: 0,
    difficulty,
    undoStack: [],
    won: false,
  };
}

export interface MoveResult {
  success: boolean;
  completedSequence: boolean; // did this move trigger a sequence completion?
  changedCols: number[]; // columns that need re-rendering
}

/**
 * Move cards from one column to another.
 * Returns which columns changed so the renderer can update selectively.
 */
export function moveCards(
  state: GameState,
  fromCol: number,
  startIndex: number,
  toCol: number
): MoveResult {
  if (!canPickUp(state, fromCol, startIndex)) {
    return { success: false, completedSequence: false, changedCols: [] };
  }
  if (!canPlace(state, fromCol, startIndex, toCol)) {
    return { success: false, completedSequence: false, changedCols: [] };
  }

  const groupId = nextGroupId();
  const count = state.tableau[fromCol].length - startIndex;
  const cards = state.tableau[fromCol].splice(startIndex, count);
  state.tableau[toCol].push(...cards);

  // Flip the new top card of source column if needed
  const srcCol = state.tableau[fromCol];
  let flippedCard = false;
  if (srcCol.length > 0 && !srcCol[srcCol.length - 1].faceUp) {
    srcCol[srcCol.length - 1].faceUp = true;
    flippedCard = true;
  }

  state.undoStack.push({
    type: 'move',
    groupId,
    fromCol,
    toCol,
    count,
    flippedCard,
  });

  state.moves++;
  const changedCols = [fromCol, toCol];

  // Check for completed sequence in destination column
  let completedSequence = false;
  const seqStart = findCompleteSequence(state.tableau[toCol]);
  if (seqStart !== -1) {
    completedSequence = true;
    const removedCards = state.tableau[toCol].splice(seqStart, 13);
    state.completedSuits++;

    // Flip new top card if needed
    const destCol = state.tableau[toCol];
    let flippedAfter = false;
    if (destCol.length > 0 && !destCol[destCol.length - 1].faceUp) {
      destCol[destCol.length - 1].faceUp = true;
      flippedAfter = true;
    }

    state.undoStack.push({
      type: 'complete-sequence',
      groupId, // same group as the move
      col: toCol,
      cards: removedCards,
      flippedCardAfter: flippedAfter,
    });
  }

  return { success: true, completedSequence, changedCols };
}

/**
 * Deal one row of cards from stock (one card per column).
 */
export function dealStock(state: GameState): { success: boolean; changedCols: number[] } {
  if (!canDeal(state)) {
    return { success: false, changedCols: [] };
  }

  const pile = state.stock.pop()!;
  const groupId = nextGroupId();
  const dealtCards: { col: number; card: Card }[] = [];

  for (let col = 0; col < TABLEAU_COLS && col < pile.length; col++) {
    const card = pile[col];
    card.faceUp = true;
    state.tableau[col].push(card);
    dealtCards.push({ col, card: { ...card } });
  }

  state.undoStack.push({
    type: 'deal',
    groupId,
    dealtCards,
  });

  state.moves++;

  // Check for completed sequences in all columns after dealing
  const changedCols = Array.from({ length: TABLEAU_COLS }, (_, i) => i);
  for (let col = 0; col < TABLEAU_COLS; col++) {
    const seqStart = findCompleteSequence(state.tableau[col]);
    if (seqStart !== -1) {
      const removedCards = state.tableau[col].splice(seqStart, 13);
      state.completedSuits++;

      const destCol = state.tableau[col];
      let flippedAfter = false;
      if (destCol.length > 0 && !destCol[destCol.length - 1].faceUp) {
        destCol[destCol.length - 1].faceUp = true;
        flippedAfter = true;
      }

      state.undoStack.push({
        type: 'complete-sequence',
        groupId,
        col,
        cards: removedCards,
        flippedCardAfter: flippedAfter,
      });
    }
  }

  return { success: true, changedCols };
}

/**
 * Undo the last action (or group of actions).
 * Returns which columns were affected.
 */
export function undoLastAction(state: GameState): { success: boolean; changedCols: number[] } {
  if (state.undoStack.length === 0) {
    return { success: false, changedCols: [] };
  }

  // Find the groupId of the last action, undo all actions in that group
  const lastGroupId = state.undoStack[state.undoStack.length - 1].groupId;
  const changedCols = new Set<number>();

  while (
    state.undoStack.length > 0 &&
    state.undoStack[state.undoStack.length - 1].groupId === lastGroupId
  ) {
    const action = state.undoStack.pop()!;
    undoSingleAction(state, action, changedCols);
  }

  state.moves++;

  return { success: true, changedCols: Array.from(changedCols) };
}

function undoSingleAction(state: GameState, action: UndoAction, changedCols: Set<number>): void {
  switch (action.type) {
    case 'move': {
      const { fromCol, toCol, count, flippedCard } = action;
      // Unflip the card we flipped in source column
      if (flippedCard && state.tableau[fromCol!].length > 0) {
        state.tableau[fromCol!][state.tableau[fromCol!].length - 1].faceUp = false;
      }
      // Move cards back
      const cards = state.tableau[toCol!].splice(state.tableau[toCol!].length - count!, count!);
      state.tableau[fromCol!].push(...cards);
      changedCols.add(fromCol!);
      changedCols.add(toCol!);
      break;
    }
    case 'deal': {
      // Remove dealt cards from each column (they were appended last)
      for (let i = action.dealtCards!.length - 1; i >= 0; i--) {
        const { col } = action.dealtCards![i];
        state.tableau[col].pop();
        changedCols.add(col);
      }
      // Reconstruct the stock pile
      const pile = action.dealtCards!.map(d => {
        const card = { ...d.card };
        card.faceUp = false;
        return card;
      });
      state.stock.push(pile);
      break;
    }
    case 'complete-sequence': {
      const { col, cards, flippedCardAfter } = action;
      // Unflip card if we flipped one after completing
      if (flippedCardAfter && state.tableau[col!].length > 0) {
        state.tableau[col!][state.tableau[col!].length - 1].faceUp = false;
      }
      // Put the 13 cards back
      state.tableau[col!].push(...cards!);
      state.completedSuits--;
      changedCols.add(col!);
      break;
    }
  }
}
