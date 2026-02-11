import { GameState } from '../types';
import { canDeal } from '../game/rules';
import { initHeader, HeaderElements, updateTimer, updateMoves, updateSuits, updateDealCount } from './header-renderer';
import { initTableau, renderColumns } from './tableau-renderer';

export interface RendererElements {
  header: HeaderElements;
}

export function initRenderer(appEl: HTMLElement): RendererElements {
  appEl.innerHTML = '';

  const header = initHeader(appEl);

  const main = document.createElement('main');
  main.id = 'main';
  main.className = 'main';
  appEl.appendChild(main);

  initTableau(main);

  return { header };
}

export function renderFullState(state: GameState, els: RendererElements): void {
  renderColumns(state);
  updateStats(state, els);
}

export function renderPartial(state: GameState, changedCols: number[], els: RendererElements): void {
  renderColumns(state, changedCols);
  updateStats(state, els);
}

function updateStats(state: GameState, els: RendererElements): void {
  updateMoves(els.header.movesEl, state.moves);
  updateSuits(els.header.suitsEl, state.completedSuits);
  updateDealCount(els.header.dealCountEl, state.stock.length);
  els.header.dealBtn.classList.toggle('header__btn--struck', !canDeal(state) && state.stock.length > 0);
}

export { updateTimer };
