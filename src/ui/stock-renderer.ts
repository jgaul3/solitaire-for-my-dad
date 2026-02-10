import { GameState } from '../types';

let stockEl: HTMLElement | null = null;

export function initStock(container: HTMLElement): void {
  stockEl = document.createElement('div');
  stockEl.id = 'stock';
  stockEl.className = 'stock';
  container.appendChild(stockEl);
}

export function renderStock(state: GameState): void {
  if (!stockEl) return;
  stockEl.innerHTML = '';

  // Show stacked card backs for remaining stock piles
  for (let i = 0; i < state.stock.length; i++) {
    const pile = document.createElement('div');
    pile.className = 'stock__pile';
    pile.style.left = `${i * 3}px`;
    pile.dataset.action = 'deal';
    stockEl.appendChild(pile);
  }

  if (state.stock.length === 0) {
    stockEl.classList.add('stock--empty');
  } else {
    stockEl.classList.remove('stock--empty');
  }
}
