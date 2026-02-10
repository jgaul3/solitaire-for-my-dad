import { Card } from '../types';
import { SUIT_SYMBOLS, SUIT_COLORS, RANK_DISPLAY } from '../constants';

export function createCardElement(card: Card, colIndex: number, cardIndex: number): HTMLElement {
  const el = document.createElement('div');
  el.className = 'card';
  el.dataset.col = String(colIndex);
  el.dataset.index = String(cardIndex);
  el.dataset.id = card.id;

  if (!card.faceUp) {
    el.classList.add('card--facedown');
    el.innerHTML = '<div class="card__back"></div>';
    return el;
  }

  const color = SUIT_COLORS[card.suit];
  el.classList.add(`card--${color}`);
  el.dataset.pickable = 'true';

  const rankStr = RANK_DISPLAY[card.rank];
  const suitStr = SUIT_SYMBOLS[card.suit];

  el.innerHTML = `
    <div class="card__corner card__corner--top">${rankStr}${suitStr}</div>
    <div class="card__full">
      <div class="card__center">${suitStr}</div>
      <div class="card__corner card__corner--bottom">${rankStr}${suitStr}</div>
    </div>
    <div class="card__compact">
      <div class="card__rank">${rankStr}</div>
      <div class="card__suit">${suitStr}</div>
    </div>
  `;

  return el;
}
