import type { AppState } from "./map-state";

const IDLE_TIMEOUT = 45000;
const root = document.documentElement;

export function setOverlayOpacity(val: number, transition?: string) {
  root.style.setProperty('--overlay-opacity', String(val));
  if (transition) root.style.setProperty('--overlay-transition', transition);
}

export function setMode(state: AppState, mode: AppState['currentMode']) {
  if (mode === state.currentMode) return;
  const prev = state.currentMode;
  state.currentMode = mode;

  const overlay = document.getElementById('screenprint-overlay');
  const touchControls = document.getElementById('touch-controls');
  const flipHint = document.getElementById('flip-hint');

  if (mode === 'poster') {
    root.style.setProperty('--overlay-transition', '1.2s cubic-bezier(0.4, 0, 0.2, 1)');
    setOverlayOpacity(0.90);
    overlay?.classList.add('poster-mode');
    touchControls?.classList.remove('visible');
    flipHint?.classList.remove('visible');
    clearIdleTimer(state);
  }

  if (mode === 'explore') {
    root.style.setProperty('--overlay-transition', prev === 'poster' ? '1.2s cubic-bezier(0.4, 0, 0.2, 1)' : '0.6s ease');
    setOverlayOpacity(0);
    overlay?.classList.remove('poster-mode');

    setTimeout(() => touchControls?.classList.add('visible'), 150);
    setTimeout(() => {
      if (flipHint && !localStorage.getItem('wud-explored')) {
        flipHint.classList.add('visible');
        localStorage.setItem('wud-explored', '1');
      }
    }, 300);

    startIdleTimer(state);
  }

  if (mode === 'maker') {
    root.style.setProperty('--overlay-transition', '0.4s ease');
    setOverlayOpacity(0.50);
    overlay?.classList.remove('poster-mode');
    clearIdleTimer(state);
  }
}

export function startIdleTimer(state: AppState) {
  clearIdleTimer(state);
  state.idleTimer = setTimeout(() => {
    if (state.currentMode === 'explore') {
      root.style.setProperty('--overlay-transition', '3s ease-in-out');
      setOverlayOpacity(0.90);
      setTimeout(() => {
        if (state.currentMode === 'explore') {
          state.currentMode = 'poster';
          document.getElementById('screenprint-overlay')?.classList.add('poster-mode');
          document.getElementById('touch-controls')?.classList.remove('visible');
        }
      }, 3000);
    }
  }, IDLE_TIMEOUT);
}

export function clearIdleTimer(state: AppState) {
  if (state.idleTimer) { clearTimeout(state.idleTimer); state.idleTimer = null; }
}

export function resetIdleTimer(state: AppState) {
  if (state.currentMode === 'explore') {
    const currentOpacity = parseFloat(root.style.getPropertyValue('--overlay-opacity') || '0.08');
    if (currentOpacity > 0.08) {
      root.style.setProperty('--overlay-transition', '0.3s ease');
      setOverlayOpacity(0);
    }
    startIdleTimer(state);
  }
}
