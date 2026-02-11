export interface HeaderElements {
  timerEl: HTMLElement;
  movesEl: HTMLElement;
  suitsEl: HTMLElement;
  dealCountEl: HTMLElement;
  dealBtn: HTMLElement;
  newGameBtn: HTMLElement;
  settingsBtn: HTMLElement;
}

export function initHeader(container: HTMLElement): HeaderElements {
  const header = document.createElement('header');
  header.id = 'header';
  header.className = 'header';

  header.innerHTML = `
    <div class="header__row header__row--stats">
      <span class="header__stat" data-stat="suits">♠ 0/8</span>
      <span class="header__stat" data-stat="moves">Moves: 0</span>
      <span class="header__stat" data-stat="timer">0:00</span>
    </div>
    <div class="header__row header__row--actions">
      <button class="header__btn" data-action="new-game">New Game</button>
      <button class="header__btn" data-action="deal">Deal <span class="header__deal-count" data-deal-count>(5)</span></button>
      <button class="header__btn" data-action="undo">Undo</button>
      <button class="header__btn" data-action="settings">Settings</button>
    </div>
  `;

  container.appendChild(header);

  return {
    timerEl: header.querySelector('[data-stat="timer"]')!,
    movesEl: header.querySelector('[data-stat="moves"]')!,
    suitsEl: header.querySelector('[data-stat="suits"]')!,
    dealCountEl: header.querySelector('[data-deal-count]')!,
    dealBtn: header.querySelector('[data-action="deal"]')!,
    newGameBtn: header.querySelector('[data-action="new-game"]')!,
    settingsBtn: header.querySelector('[data-action="settings"]')!,
  };
}

export function updateTimer(el: HTMLElement, elapsedMs: number): void {
  const totalSec = Math.floor(elapsedMs / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  el.textContent = `${min}:${sec.toString().padStart(2, '0')}`;
}

export function updateMoves(el: HTMLElement, moves: number): void {
  el.textContent = `Moves: ${moves}`;
}

export function updateSuits(el: HTMLElement, completed: number): void {
  el.textContent = `♠ ${completed}/8`;
}

export function updateDealCount(el: HTMLElement, remaining: number): void {
  el.textContent = `(${remaining})`;
}
