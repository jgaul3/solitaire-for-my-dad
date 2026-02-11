import { GameState } from '../types';
import { TABLEAU_COLS } from '../constants';
import { createCardElement } from './card-renderer';
import { canPickUp } from '../game/rules';

let tableauEl: HTMLElement | null = null;
const columnEls: HTMLElement[] = [];

export function initTableau(container: HTMLElement): void {
  tableauEl = document.createElement('div');
  tableauEl.id = 'tableau';
  tableauEl.className = 'tableau';

  for (let i = 0; i < TABLEAU_COLS; i++) {
    const col = document.createElement('div');
    col.className = 'column';
    col.dataset.col = String(i);
    columnEls.push(col);
    tableauEl.appendChild(col);
  }

  container.appendChild(tableauEl);
}

export function renderColumns(state: GameState, changedCols?: number[]): void {
  const cols = changedCols ?? Array.from({ length: TABLEAU_COLS }, (_, i) => i);

  for (const colIdx of cols) {
    renderColumn(state, colIdx);
  }

  recalcOverlap();
}

function renderColumn(state: GameState, colIdx: number): void {
  const colEl = columnEls[colIdx];
  colEl.innerHTML = '';

  const cards = state.tableau[colIdx];

  if (cards.length === 0) {
    colEl.classList.add('column--empty');
    return;
  }

  colEl.classList.remove('column--empty');

  for (let i = 0; i < cards.length; i++) {
    const cardEl = createCardElement(cards[i], colIdx, i);
    if (cards[i].faceUp && !canPickUp(state, colIdx, i)) {
      cardEl.classList.add('card--locked');
    }
    colEl.appendChild(cardEl);
  }
}

/**
 * Recalculate card overlap so all cards fit within the available height.
 * Uses CSS custom properties on each column.
 */
export function recalcOverlap(): void {
  if (!tableauEl) return;

  const tableauRect = tableauEl.getBoundingClientRect();
  const availableHeight = tableauRect.height;
  const cardHeight = getCardHeight();

  for (let i = 0; i < TABLEAU_COLS; i++) {
    const colEl = columnEls[i];
    const cards = Array.from(colEl.children) as HTMLElement[];
    if (cards.length <= 1) {
      if (cards.length === 1) cards[0].style.top = '0px';
      continue;
    }

    // Count face-down and face-up cards (excluding the last card which sits on top)
    // Each face-down gap counts as 0.5 units, each face-up gap counts as 1 unit
    let totalUnits = 0;
    for (let j = 0; j < cards.length - 1; j++) {
      totalUnits += cards[j].classList.contains('card--facedown') ? 0.5 : 1;
    }

    const maxOverlap = 28;
    const minOverlap = 10;
    let faceUpOverlap = Math.min(maxOverlap, (availableHeight - cardHeight) / totalUnits);
    faceUpOverlap = Math.max(minOverlap, Math.floor(faceUpOverlap));

    let top = 0;
    for (let j = 0; j < cards.length; j++) {
      cards[j].style.top = `${top}px`;
      if (j < cards.length - 1) {
        top += cards[j].classList.contains('card--facedown')
          ? Math.floor(faceUpOverlap / 2)
          : faceUpOverlap;
      }
    }
  }
}

function getCardHeight(): number {
  // Measure from first visible card or use default
  const card = document.querySelector('.card') as HTMLElement | null;
  if (card) return card.offsetHeight;
  return 80; // fallback
}

export function setSelectedCards(col: number, startIndex: number): void {
  clearSelection();
  const colEl = columnEls[col];
  for (let i = startIndex; i < colEl.children.length; i++) {
    colEl.children[i].classList.add('card--selected');
  }
}

export function clearSelection(): void {
  document.querySelectorAll('.card--selected').forEach(el => el.classList.remove('card--selected'));
}

export function highlightValidTargets(cols: number[]): void {
  clearHighlights();
  for (const col of cols) {
    columnEls[col].classList.add('column--highlight');
  }
}

export function clearHighlights(): void {
  columnEls.forEach(col => col.classList.remove('column--highlight'));
}
