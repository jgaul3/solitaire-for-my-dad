import { Difficulty, GameState, Selection, Stats } from './types';
import { createNewGame, moveCards, dealStock, undoLastAction } from './game/state';
import { canPickUp, canPlace, canDeal, isWon } from './game/rules';
import { TABLEAU_COLS } from './constants';
import {
  initRenderer,
  renderFullState,
  renderPartial,
  updateTimer,
  RendererElements,
} from './ui/renderer';
import {
  setSelectedCards,
  clearSelection,
  highlightValidTargets,
  clearHighlights,
  recalcOverlap,
} from './ui/tableau-renderer';
import { initLayout } from './ui/layout';
import { showModal, closeModal, showConfirm } from './ui/modal';
import { saveGameState, loadGameState, clearGameState, saveDifficulty, loadDifficulty } from './storage/persistence';
import { loadStats, recordWin, recordLoss, saveStats, getAverageWinTime } from './storage/statistics';
import { exportStats, importStats } from './storage/export';

export class App {
  private state!: GameState;
  private els!: RendererElements;
  private selection: Selection | null = null;
  private timerRunning = false;
  private lastTimestamp = 0;
  private rafId = 0;

  init(): void {
    const appEl = document.getElementById('app')!;
    this.els = initRenderer(appEl);

    // Try to restore saved game
    const saved = loadGameState();
    if (saved) {
      this.state = saved;
    } else {
      this.state = createNewGame(loadDifficulty());
    }

    renderFullState(this.state, this.els);
    this.updateHeaderMode();

    this.bindEvents(appEl);
    initLayout(() => recalcOverlap());

    // Only start timer if game is already in progress (restored from save)
    if (!this.state.won && this.state.moves > 0) {
      this.startTimer();
    }
    this.updateTimerDisplay();
  }

  private bindEvents(appEl: HTMLElement): void {
    // Single event delegation from #app
    appEl.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;

      // Check for action buttons first
      const actionEl = target.closest('[data-action]') as HTMLElement | null;
      if (actionEl) {
        this.handleAction(actionEl.dataset.action!);
        return;
      }

      // Check for card click
      const cardEl = target.closest('.card') as HTMLElement | null;
      if (cardEl && cardEl.dataset.col !== undefined) {
        this.handleCardClick(parseInt(cardEl.dataset.col), parseInt(cardEl.dataset.index!));
        return;
      }

      // Check for column click (empty column, or highlighted valid target)
      const colEl = target.closest('.column') as HTMLElement | null;
      if (colEl && colEl.dataset.col !== undefined) {
        const isEmpty = colEl.classList.contains('column--empty');
        const isHighlighted = colEl.classList.contains('column--highlight');
        if (isEmpty || (isHighlighted && this.selection)) {
          this.handleColumnClick(parseInt(colEl.dataset.col));
          return;
        }
      }

      // Click on empty space deselects
      if (this.selection) {
        this.deselect();
      }
    });

    // Pause timer when page is hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseTimer();
      } else if (!this.state.won && this.state.moves > 0) {
        this.startTimer();
      }
    });
  }

  private handleAction(action: string): void {
    switch (action) {
      case 'new-game':
        this.confirmNewGame();
        break;
      case 'deal':
        this.doDeal();
        break;
      case 'undo':
        this.doUndo();
        break;
      case 'settings':
        this.showSettings();
        break;
    }
  }

  private handleCardClick(col: number, cardIndex: number): void {
    const card = this.state.tableau[col][cardIndex];

    // Can't interact with face-down cards
    if (!card.faceUp) return;

    if (this.selection) {
      // We have a selection — try to place it
      if (this.selection.col === col) {
        // Clicking same column — change selection if valid, otherwise deselect
        if (cardIndex !== this.selection.startIndex) {
          if (canPickUp(this.state, col, cardIndex)) {
            this.select(col, cardIndex);
          } else {
            this.deselect();
          }
        } else {
          this.deselect();
        }
        return;
      }

      // Try to move to this column
      this.tryMove(this.selection.col, this.selection.startIndex, col);
    } else {
      // No selection — try to select this card
      if (canPickUp(this.state, col, cardIndex)) {
        this.select(col, cardIndex);
      }
    }
  }

  private handleColumnClick(col: number): void {
    if (this.selection) {
      this.tryMove(this.selection.col, this.selection.startIndex, col);
    }
  }

  private select(col: number, startIndex: number): void {
    this.selection = { col, startIndex };
    setSelectedCards(col, startIndex);

    // Highlight valid targets
    const validTargets: number[] = [];
    for (let i = 0; i < TABLEAU_COLS; i++) {
      if (canPlace(this.state, col, startIndex, i)) {
        validTargets.push(i);
      }
    }
    highlightValidTargets(validTargets);
  }

  private deselect(): void {
    this.selection = null;
    clearSelection();
    clearHighlights();
  }

  private tryMove(fromCol: number, startIndex: number, toCol: number): void {
    const wasPreGame = this.state.moves === 0;
    const result = moveCards(this.state, fromCol, startIndex, toCol);

    this.deselect();

    if (result.success) {
      if (wasPreGame) {
        this.startTimer();
        this.updateHeaderMode();
      }
      renderPartial(this.state, result.changedCols, this.els);
      this.save();

      if (isWon(this.state)) {
        this.handleWin();
      }
    }
  }

  private doDeal(): void {
    if (!canDeal(this.state)) {
      // Flash feedback — briefly indicate empty columns
      if (this.state.stock.length > 0) {
        // There are cards to deal but empty columns exist
        this.flashEmptyColumns();
      }
      return;
    }

    const wasPreGame = this.state.moves === 0;
    this.deselect();
    const result = dealStock(this.state);
    if (result.success) {
      if (wasPreGame) {
        this.startTimer();
        this.updateHeaderMode();
      }
      renderPartial(this.state, result.changedCols, this.els);
      this.save();

      if (isWon(this.state)) {
        this.handleWin();
      }
    }
  }

  private flashEmptyColumns(): void {
    const empties = document.querySelectorAll('.column--empty');
    empties.forEach(el => {
      el.classList.add('column--flash');
      setTimeout(() => el.classList.remove('column--flash'), 400);
    });
  }

  private doUndo(): void {
    this.deselect();
    const result = undoLastAction(this.state);
    if (result.success) {
      this.state.won = false;
      renderFullState(this.state, this.els);
      this.updateHeaderMode();
      this.save();
      if (!this.timerRunning && this.state.moves > 0) {
        this.startTimer();
      }
    }
  }

  private confirmNewGame(): void {
    if (this.state.moves === 0) {
      // Pre-game: no confirmation needed
      this.startNewGame(this.state.difficulty);
      return;
    }
    showConfirm('Start a new game? Current progress will be lost.', () => {
      if (!this.state.won) {
        recordLoss(this.state.difficulty);
      }
      this.startNewGame(this.state.difficulty);
    });
  }

  private startNewGame(difficulty: Difficulty): void {
    this.pauseTimer();
    clearGameState();
    this.state = createNewGame(difficulty);
    saveDifficulty(difficulty);
    this.deselect();
    renderFullState(this.state, this.els);
    this.updateTimerDisplay();
    this.updateHeaderMode();
    this.save();
  }

  private handleWin(): void {
    this.state.won = true;
    this.pauseTimer();
    this.save();

    const elapsed = this.state.elapsed;
    const allStats = recordWin(this.state.difficulty, elapsed, this.state.moves);
    const stats = allStats[this.state.difficulty];

    const timeStr = formatTime(elapsed);
    const avgTime = getAverageWinTime(stats);

    const body = `
      <table>
        <tr><td>Time</td><td>${timeStr}</td></tr>
        <tr><td>Moves</td><td>${this.state.moves}</td></tr>
        <tr><td>Difficulty</td><td>${capitalize(this.state.difficulty)}</td></tr>
      </table>
      <h3 style="margin-top:16px;margin-bottom:8px;color:#222">High Scores (${capitalize(this.state.difficulty)})</h3>
      <table>
        <tr><td>Games Won</td><td>${stats.gamesWon}</td></tr>
        <tr><td>Games Lost</td><td>${stats.gamesLost}</td></tr>
        <tr><td>Avg Time</td><td>${avgTime ? formatTime(avgTime) : '—'}</td></tr>
        <tr><td>Fastest Win</td><td>${stats.fastestWin ? formatTime(stats.fastestWin) : '—'}</td></tr>
        <tr><td>Min Moves</td><td>${stats.minimumMoves ?? '—'}</td></tr>
      </table>
    `;

    const overlay = showModal('You Won!', body, [
      { label: 'New Game', action: 'new-game-win', primary: true },
    ]);

    overlay.addEventListener('click', (e) => {
      const action = (e.target as HTMLElement).dataset.action;
      if (action === 'new-game-win') {
        closeModal();
        this.startNewGame(this.state.difficulty);
      }
    });
  }

  private showSettings(): void {
    const currentDifficulty = this.state.difficulty;
    const stats = loadStats();

    const inGame = this.state.moves > 0;

    const body = `
      ${inGame ? '<button class="modal__btn modal__btn--primary" data-action="new-game-settings" style="width:100%;margin-bottom:16px">New Game</button>' : ''}
      <h3 style="margin-bottom:8px">Difficulty</h3>
      <div class="difficulty-options">
        <label>
          <input type="radio" name="difficulty" value="easy" ${currentDifficulty === 'easy' ? 'checked' : ''}>
          <span>Easy</span><br><small>1 suit</small>
        </label>
        <label>
          <input type="radio" name="difficulty" value="medium" ${currentDifficulty === 'medium' ? 'checked' : ''}>
          <span>Medium</span><br><small>2 suits</small>
        </label>
        <label>
          <input type="radio" name="difficulty" value="hard" ${currentDifficulty === 'hard' ? 'checked' : ''}>
          <span>Hard</span><br><small>4 suits</small>
        </label>
      </div>

      <h3 style="margin-top:16px;margin-bottom:8px">Statistics</h3>
      ${renderStatsTable(stats)}

      <h3 style="margin-top:16px;margin-bottom:8px">Import / Export</h3>
      <p>
        <button class="modal__btn" data-action="export-stats" style="margin-right:8px">Export Stats</button>
        <button class="modal__btn" data-action="import-stats">Import Stats</button>
      </p>
      <textarea id="import-export-area" placeholder="Paste exported data here to import..." style="margin-top:8px"></textarea>

      <h3 style="margin-top:16px;margin-bottom:8px">Install as App</h3>
      <p style="font-size:12px;color:#666">
        <strong>iOS:</strong> Tap Share → "Add to Home Screen"<br>
        <strong>Android:</strong> Tap Menu → "Add to Home Screen" or "Install App"
      </p>
    `;

    const overlay = showModal('Settings', body, [
      { label: 'Close', action: 'close-settings' },
      { label: 'Apply & New Game', action: 'apply-settings', primary: true },
    ]);

    overlay.addEventListener('click', (e) => {
      const action = (e.target as HTMLElement).dataset.action;
      if (!action) return;

      switch (action) {
        case 'close-settings':
          closeModal();
          break;
        case 'new-game-settings':
          closeModal();
          this.confirmNewGame();
          break;
        case 'apply-settings': {
          const radio = overlay.querySelector('input[name="difficulty"]:checked') as HTMLInputElement;
          if (radio) {
            const newDifficulty = radio.value as Difficulty;
            closeModal();
            if (!this.state.won && this.state.moves > 0) {
              recordLoss(this.state.difficulty);
            }
            this.startNewGame(newDifficulty);
          }
          break;
        }
        case 'export-stats': {
          const encoded = exportStats(loadStats());
          const textarea = document.getElementById('import-export-area') as HTMLTextAreaElement;
          textarea.value = encoded;
          textarea.select();
          navigator.clipboard.writeText(encoded).catch(() => {});
          break;
        }
        case 'import-stats': {
          const textarea = document.getElementById('import-export-area') as HTMLTextAreaElement;
          const imported = importStats(textarea.value.trim());
          if (imported) {
            saveStats(imported);
            closeModal();
            this.showSettings(); // re-open to show updated stats
          } else {
            textarea.style.borderColor = '#c0392b';
            textarea.placeholder = 'Invalid data — please try again';
          }
          break;
        }
      }
    });
  }

  private updateHeaderMode(): void {
    const preGame = this.state.moves === 0;
    this.els.header.newGameBtn.style.display = preGame ? '' : 'none';
  }

  // === Timer ===

  private startTimer(): void {
    if (this.timerRunning) return;
    this.timerRunning = true;
    this.lastTimestamp = performance.now();
    this.tick(this.lastTimestamp);
  }

  private pauseTimer(): void {
    this.timerRunning = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
  }

  private tick(now: number): void {
    if (!this.timerRunning) return;

    const delta = now - this.lastTimestamp;
    this.lastTimestamp = now;
    this.state.elapsed += delta;

    this.updateTimerDisplay();

    this.rafId = requestAnimationFrame((t) => this.tick(t));
  }

  private updateTimerDisplay(): void {
    updateTimer(this.els.header.timerEl, this.state.elapsed);
  }

  // === Persistence ===

  private save(): void {
    saveGameState(this.state);
  }
}

// === Helpers ===

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function renderStatsTable(allStats: { easy: Stats; medium: Stats; hard: Stats }): string {
  const rows = (['easy', 'medium', 'hard'] as const).map(d => {
    const s = allStats[d];
    const avg = getAverageWinTime(s);
    return `<tr>
      <td>${capitalize(d)}</td>
      <td>${s.gamesWon}</td>
      <td>${s.gamesLost}</td>
      <td>${avg ? formatTime(avg) : '—'}</td>
      <td>${s.fastestWin ? formatTime(s.fastestWin) : '—'}</td>
      <td>${s.minimumMoves ?? '—'}</td>
    </tr>`;
  }).join('');

  return `<table style="font-size:12px">
    <tr><th></th><th>Won</th><th>Lost</th><th>Avg</th><th>Fast</th><th>Min</th></tr>
    ${rows}
  </table>`;
}
