import type { AppState, Orientation } from "./map-state";
import { setMode, setOverlayOpacity } from "./mode-system";
import { closeAllPanels } from "./style-system";

const toastMessages: Record<Orientation, string[]> = {
  'normal': [
    "Wait... this feels wrong", "Oh no, not this again", "The boring way up",
    "How conventional of you", "You've been conditioned",
    "North is a social construct", "Comfortable? That's the problem",
    "Welcome back to the Matrix", "Plot twist: this is the weird one",
    "Back to the colonial default", "Safety blanket: activated",
  ],
  'upside-down': [
    "Ah, much better", "Welcome back", "Now we're talking",
    "Home sweet upside down", "This is the real world",
    "South is the new up", "Earth has no opinion on the matter",
    "Suddenly everything is unfamiliar", "There is no up in space",
    "Now you see it as Apollo 17 did", "The Southern Hemisphere approves",
    "Antarctica is on top now. Deal with it.",
  ],
  'mirrored': [
    "Through the looking glass", "Everything is backwards now",
    "Mirror, mirror on the wall...", "East is west, west is east",
    "Your mental map just broke", "Try giving someone directions now",
    "Even Google Maps can't help you now",
    "This is how da Vinci wrote his notes",
  ],
};

const locationToasts: Record<Orientation, string[]> = {
  'normal': [
    "{city} looks boringly correct now",
    "The people of {city} feel safe again",
    "{city}: back to the atlas version",
  ],
  'upside-down': [
    "Did you get lost in {city}?",
    "{city} looks different from down here",
    "Welcome to {city}... upside down",
    "Is that really {city}?",
    "Good luck giving directions in {city} now",
  ],
  'mirrored': [
    "{city} through the looking glass",
    "Try finding your hotel in {city} now",
    "{city} but make it backwards",
  ],
};

const TOAST_COOLDOWN = 3000;
const root = document.documentElement;

function toggleMapLabels(state: AppState, show: boolean): void {
  const style = state.map.getStyle();
  if (!style) return;
  for (const layer of style.layers) {
    if (layer.type === 'symbol') {
      state.map.setLayoutProperty(layer.id, 'visibility', show ? 'visible' : 'none');
    }
  }
}

export function showFlipToast(state: AppState, text: string): void {
  const now = Date.now();
  if (now - state.lastToastTime < TOAST_COOLDOWN) return;
  state.lastToastTime = now;

  const toast = document.getElementById('flip-toast');
  if (!toast) return;
  toast.textContent = text;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2200);
}

function getOrientationToast(state: AppState, target: Orientation): string {
  if (state.currentCityName && Math.random() < 0.4) {
    const locMsgs = locationToasts[target];
    const template = locMsgs[Math.floor(Math.random() * locMsgs.length)];
    return template.replace('{city}', state.currentCityName);
  }
  const msgs = toastMessages[target];
  return msgs[Math.floor(Math.random() * msgs.length)];
}

export function applyOrientation(state: AppState, target: Orientation): void {
  if (target === state.orientation) return;
  const prev = state.orientation;
  state.orientation = target;

  const map = state.map;
  const arrow = document.getElementById('north-arrow');
  const mapEl = document.getElementById('map');

  const needsBearingChange =
    (prev === 'upside-down' && target !== 'upside-down') ||
    (prev !== 'upside-down' && target === 'upside-down');

  if (needsBearingChange) {
    const targetBearing = target === 'upside-down' ? 180 : 0;
    state.bearingLocked = false;
    map.easeTo({
      bearing: targetBearing,
      duration: 1200,
      easing: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
    });
    setTimeout(() => { state.bearingLocked = true; }, 1300);
  }

  if (prev === 'mirrored' && target !== 'mirrored') {
    mapEl?.classList.remove('mirrored');
    toggleMapLabels(state, true);
  }
  if (target === 'mirrored' && prev !== 'mirrored') {
    if (prev === 'upside-down') {
      state.bearingLocked = false;
      map.easeTo({
        bearing: 0, duration: 1200,
        easing: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
      });
      setTimeout(() => {
        state.bearingLocked = true;
        mapEl?.classList.add('mirrored');
        toggleMapLabels(state, false);
      }, 1200);
    } else {
      mapEl?.classList.add('mirrored');
      toggleMapLabels(state, false);
    }
  }

  if (arrow) {
    arrow.classList.toggle('flipped', target === 'normal' || target === 'mirrored');
  }

  if (!state.hasCustomTitle) {
    const spL1 = document.getElementById('screenprint-l1');
    const spL2 = document.getElementById('screenprint-l2');
    if (spL1 && spL2) {
      if (target === 'upside-down') { spL1.textContent = 'UPSIDE'; spL2.textContent = 'DOWN'; }
      else if (target === 'normal') { spL1.textContent = 'NORTH'; spL2.textContent = 'UP'; }
      else if (target === 'mirrored') { spL1.textContent = 'EAST'; spL2.textContent = 'WEST'; }
    }
    if (state.currentMode === 'explore') {
      root.style.setProperty('--overlay-transition', '0.4s ease');
      setOverlayOpacity(0.60);
      setTimeout(() => {
        if (state.currentMode === 'explore') {
          root.style.setProperty('--overlay-transition', '0.8s ease');
          setOverlayOpacity(0);
        }
      }, 1500);
    }
  } else {
    if (state.currentMode === 'explore') {
      root.style.setProperty('--overlay-transition', '0.3s ease');
      setOverlayOpacity(0.15);
      setTimeout(() => {
        if (state.currentMode === 'explore') {
          root.style.setProperty('--overlay-transition', '0.5s ease');
          setOverlayOpacity(0);
        }
      }, 800);
    }
  }

  showFlipToast(state, getOrientationToast(state, target));

  if (state.currentMode === 'poster') {
    setMode(state, 'explore');
  }
}

export function setupFlip(state: AppState): void {
  const flipHint = document.getElementById('flip-hint');

  document.addEventListener('keydown', (e) => {
    if ((e.target as HTMLElement).tagName === 'INPUT' ||
        (e.target as HTMLElement).hasAttribute('contenteditable')) return;

    switch (e.key) {
      case 'ArrowUp': applyOrientation(state, 'normal'); break;
      case 'ArrowDown': applyOrientation(state, 'upside-down'); break;
      case 'ArrowRight': applyOrientation(state, 'mirrored'); break;
      case 'ArrowLeft': applyOrientation(state, 'normal'); break;
      case 'Escape':
        closeAllPanels(state);
        if (state.currentMode === 'explore' || state.currentMode === 'maker') {
          setMode(state, 'poster');
        }
        return;
      default: return;
    }
    e.preventDefault();
    flipHint?.classList.remove('visible');
  });

  const touchPrompt = document.getElementById('touch-prompt');

  function updateFlipButtons() {
    document.querySelectorAll('.flip-btn').forEach(btn => {
      const orient = (btn as HTMLElement).dataset.orient as Orientation;
      btn.classList.toggle('active', orient === state.orientation);
    });
  }

  document.querySelectorAll('.flip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const orient = (btn as HTMLElement).dataset.orient as Orientation;
      if (orient) {
        const target = state.orientation === orient ? 'upside-down' : orient;
        applyOrientation(state, target);
        updateFlipButtons();
        touchPrompt?.classList.add('hidden');
      }
    });
  });

  updateFlipButtons();

  // ── Flip FAB (mobile) ──
  const flipFab = document.getElementById('flip-fab');
  if (flipFab) {
    function updateFabState() {
      flipFab!.classList.toggle('flipped', state.orientation === 'normal' || state.orientation === 'mirrored');
    }

    flipFab.addEventListener('click', () => {
      const target = state.orientation === 'upside-down' ? 'normal' : 'upside-down';
      applyOrientation(state, target);
      updateFabState();
      updateFlipButtons();
      touchPrompt?.classList.add('hidden');
    });

    updateFabState();
  }
}
