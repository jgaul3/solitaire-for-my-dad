import { GameState, Difficulty } from '../types';

const GAME_STATE_KEY = 'spider-solitaire-state';
const DIFFICULTY_KEY = 'spider-solitaire-difficulty';

export function saveGameState(state: GameState): void {
  try {
    localStorage.setItem(GAME_STATE_KEY, JSON.stringify(state));
  } catch {
    // localStorage full or unavailable — silently fail
  }
}

export function loadGameState(): GameState | null {
  try {
    const raw = localStorage.getItem(GAME_STATE_KEY);
    if (!raw) return null;
    const state = JSON.parse(raw) as GameState;
    // Basic validation
    if (!state.tableau || !Array.isArray(state.tableau) || state.tableau.length !== 10) {
      return null;
    }
    return state;
  } catch {
    return null;
  }
}

export function clearGameState(): void {
  try {
    localStorage.removeItem(GAME_STATE_KEY);
  } catch {
    // ignore
  }
}

export function saveDifficulty(difficulty: Difficulty): void {
  try {
    localStorage.setItem(DIFFICULTY_KEY, difficulty);
  } catch {
    // ignore
  }
}

export function loadDifficulty(): Difficulty {
  try {
    const d = localStorage.getItem(DIFFICULTY_KEY);
    if (d === 'easy' || d === 'medium' || d === 'hard') return d;
  } catch {
    // ignore
  }
  return 'easy';
}
