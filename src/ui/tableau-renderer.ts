import { GameState } from '../types';
import { TABLEAU_COLS } from '../constants';
import { createCardElement } from './card-renderer';

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
    const cardCount = colEl.children.length;
    if (cardCount <= 1) {
      colEl.style.setProperty('--card-overlap', '20px');
      continue;
    }

    // We need: (cardCount - 1) * overlap + cardHeight <= availableHeight
    const maxOverlap = 28; // px, comfortable default
    const minOverlap = 10; // px, minimum readability
    let overlap = Math.min(maxOverlap, (availableHeight - cardHeight) / (cardCount - 1));
    overlap = Math.max(minOverlap, Math.floor(overlap));

    colEl.style.setProperty('--card-overlap', `${overlap}px`);
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
