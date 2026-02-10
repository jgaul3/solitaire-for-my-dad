import { AllStats, Difficulty, Stats } from '../types';

const STATS_KEY = 'spider-solitaire-stats';

function emptyStats(): Stats {
  return {
    gamesWon: 0,
    gamesLost: 0,
    totalTime: 0,
    fastestWin: null,
    minimumMoves: null,
  };
}

function emptyAllStats(): AllStats {
  return {
    easy: emptyStats(),
    medium: emptyStats(),
    hard: emptyStats(),
  };
}

export function loadStats(): AllStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return emptyAllStats();
    const stats = JSON.parse(raw) as AllStats;
    // Ensure all difficulties exist
    if (!stats.easy) stats.easy = emptyStats();
    if (!stats.medium) stats.medium = emptyStats();
    if (!stats.hard) stats.hard = emptyStats();
    return stats;
  } catch {
    return emptyAllStats();
  }
}

export function saveStats(stats: AllStats): void {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    // ignore
  }
}

export function recordWin(difficulty: Difficulty, elapsedMs: number, moves: number): AllStats {
  const stats = loadStats();
  const s = stats[difficulty];

  s.gamesWon++;
  s.totalTime += elapsedMs;

  if (s.fastestWin === null || elapsedMs < s.fastestWin) {
    s.fastestWin = elapsedMs;
  }
  if (s.minimumMoves === null || moves < s.minimumMoves) {
    s.minimumMoves = moves;
  }

  saveStats(stats);
  return stats;
}

export function recordLoss(difficulty: Difficulty): AllStats {
  const stats = loadStats();
  stats[difficulty].gamesLost++;
  saveStats(stats);
  return stats;
}

export function getAverageWinTime(s: Stats): number | null {
  if (s.gamesWon === 0) return null;
  return Math.round(s.totalTime / s.gamesWon);
}
