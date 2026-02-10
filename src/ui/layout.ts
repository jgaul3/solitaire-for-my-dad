import { recalcOverlap } from './tableau-renderer';

export type Orientation = 'portrait' | 'landscape';

let currentOrientation: Orientation = 'portrait';
let onOrientationChange: ((o: Orientation) => void) | null = null;

export function initLayout(callback: (o: Orientation) => void): void {
  onOrientationChange = callback;
  updateOrientation();

  window.addEventListener('resize', updateOrientation);
  // Also listen for orientation change on mobile
  screen.orientation?.addEventListener('change', updateOrientation);
}

function updateOrientation(): void {
  const isWide = window.innerWidth > window.innerHeight;
  const hasSufficientHeight = window.innerHeight >= 500;
  const newOrientation: Orientation = isWide && hasSufficientHeight ? 'landscape' : 'portrait';

  if (newOrientation !== currentOrientation) {
    currentOrientation = newOrientation;
    document.documentElement.dataset.orientation = currentOrientation;
    onOrientationChange?.(currentOrientation);
  }

  recalcOverlap();
}

export function getOrientation(): Orientation {
  return currentOrientation;
}
