import type { AppState, Orientation } from "./map-state";
import { setMode, setOverlayOpacity } from "./mode-system";
import { closeAllPanels } from "./style-system";

const toastMessages: Record<Orientation, string[]> = {
  'normal': [
    "How very atlas of you",
    "Safe mode: enabled",
    "Mercator thanks you",
    "You chose the boring one",
    "The school map wins again",
    "Comfort zone: restored",
    "Corporate cartography activated",
    "You had one job",
    "The boardroom orientation",
    "Back to the PowerPoint map",
    "Autopilot engaged",
    "HR-approved orientation",
    "Google Maps breathes a sigh",
    "That's what they want you to see",
    "Predictable, but okay",
    "You folded",
    "The colonisers would be proud",
    "Your teacher would approve",
    "Welcome back to the Matrix",
    "North is a social construct",
    "Plot twist: this is the weird one",
  ],
  'upside-down': [
    "Ah, the correct way",
    "Greenland just got honest",
    "Australia finally on top",
    "The ISS sees it this way",
    "Nuestro norte es el Sur",
    "Antarctica crowns the world",
    "South is upstream on the Nile",
    "Al-Idrisi had it right in 1154",
    "NASA rotated the original photo",
    "The Blue Marble was south-up",
    "Sorry, Mercator",
    "Flat earthers hate this one trick",
    "Africa at its true scale",
    "No astronaut has ever seen north",
    "This is how satellites see it",
    "Every compass points to a choice",
    "500 years of habit, broken",
    "The Southern Cross approves",
    "Brazil is bigger than you think",
    "Polaris is just a star",
    "Buckminster Fuller nodded",
    "Your geography teacher lied",
    "The equator hasn't moved",
    "Down Under? Under what?",
    "The Nile approves this message",
    "There is no up in space",
    "Now you see it as Apollo 17 did",
    "Earth has no opinion on the matter",
    "Antarctica is on top now. Deal with it.",
    "Stuart McArthur sends his regards",
  ],
  'mirrored': [
    "Read this backwards",
    "Your left is now your right",
    "Ambulance mode",
    "Leonardo would feel at home",
    "East and west just swapped",
    "Try parallel parking now",
    "Every sat-nav just died",
    "This is how mirrors see maps",
    "Left turn means right turn",
    "The world as a palindrome",
    "Through the looking glass",
  ],
};

const locationToasts: Record<Orientation, string[]> = {
  'normal': [
    "{city} snaps back to boring",
    "Back to the tourist map of {city}",
    "{city}: the postcard version",
    "The {city} your GPS expects",
    "{city} on autopilot again",
  ],
  'upside-down': [
    "{city} from the other side",
    "You just disoriented {city}",
    "{city} has never looked like this",
    "Try hailing a cab in {city} now",
    "Lost in {city}? Good.",
    "{city}, but make it honest",
    "New perspective on {city}",
    "{city} looking brand new",
    "The locals in {city} approve",
    "{city} just got interesting",
  ],
  'mirrored': [
    "{city}: mirror edition",
    "Finding your way in {city}? No.",
    "{city} through the looking glass",
    "Every turn in {city} is wrong now",
    "{city} in reverse",
  ],
};

const TOAST_COOLDOWN = 2000;
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
  // Subtle random tilt for zine-like personality
  const tilt = (Math.random() - 0.5) * 3;
  toast.style.setProperty('--toast-tilt', `${tilt}deg`);
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2400);
}

function getOrientationToast(state: AppState, target: Orientation): string {
  if (state.currentCityName && Math.random() < 0.55) {
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
