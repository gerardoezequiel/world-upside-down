import type { AppState, Orientation } from "./map-state";
import { setMode, setOverlayOpacity } from "./mode-system";
import { closeAllPanels } from "./style-system";
import { trackEvent, trackOrientationChange } from "./analytics";

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
    "The Wall Street Journal orientation",
    "Risk-averse cartography",
    "The safe word is 'north'",
    "Conformist, but we still like you",
    "The imperial default",
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
    "Torres Garc\u00eda drew this first",
    "The Mediterranean isn't the centre",
    "Indonesia has entered the chat",
    "New Zealand isn't at the edge anymore",
    "The South Pole says thanks",
    "Decolonise your atlas",
    "The first globe had no north",
    "Perspective is a political act",
    "The Mercator distortion exposed",
    "South-up since Apollo 17, 1972",
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
    "Japan is now west of California",
    "Good luck navigating",
    "Pacific Ocean: now on the left",
    "Your brain is re-routing",
  ],
};

const locationToasts: Record<Orientation, string[]> = {
  'normal': [
    "{city} snaps back to boring",
    "Back to the tourist map of {city}",
    "{city}: the postcard version",
    "The {city} your GPS expects",
    "{city} on autopilot again",
    "{city} returns to factory settings",
    "The guidebook version of {city}",
    "{city} as your teacher showed you",
    "Google Maps recognises {city} again",
    "{city}: safe mode restored",
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
    "{city} would like a word",
    "Show this {city} to a taxi driver",
    "{city}, decolonised",
    "The {city} nobody puts on a postcard",
    "You just rotated {city}'s whole vibe",
    "{city} hits different upside down",
    "{city}: now 100% more honest",
    "Somewhere in {city}, a cartographer is crying",
  ],
  'mirrored': [
    "{city}: mirror edition",
    "Finding your way in {city}? No.",
    "{city} through the looking glass",
    "Every turn in {city} is wrong now",
    "{city} in reverse",
    "{city}: your GPS just quit",
    "Good luck giving directions in {city}",
    "Mirror {city} looks uncanny",
    "{city}, but make it palindrome",
    "{city}: left is the new right",
  ],
};

const cityJokes: Record<string, string[]> = {
  'Tokyo':      ["Tokyo's subway map makes more sense upside down", "Shibuya crossing looks calm from here"],
  'London':     ["The Thames flows uphill now", "Mind the gap — and the orientation"],
  'New York':   ["Manhattan's grid still works. Barely.", "Uptown is downtown now. Classic NYC."],
  'Paris':      ["The Eiffel Tower points down now", "Paris looks just as arrogant upside down"],
  'Sydney':     ["Harbour Bridge finally right-side up", "Sydney was upside down all along"],
  'Buenos Aires': ["Buenos Aires: always knew south was up", "Boca just moved to the penthouse"],
  'Cairo':      ["The Nile flows in the right direction now", "Cairo finally feels like the centre"],
  'Mumbai':     ["Mumbai from a different angle entirely", "The trains still run. Probably."],
  'São Paulo':  ["São Paulo is even more chaotic this way", "Paulista Avenue looking brand new"],
  'Cape Town':  ["Table Mountain sits on top. As it should.", "Cape Town was born for this view"],
  'Mexico City': ["La Ciudad de México, al revés", "CDMX hits different from the south"],
  'Berlin':     ["The wall fell in every direction", "Berlin doesn't care which way is up"],
  'Istanbul':   ["Two continents. Still one city. Now flipped.", "The Bosphorus still divides, just vertically"],
  'Lagos':      ["Lagos doesn't slow down. Even upside down.", "Third Mainland Bridge, new perspective"],
  'Rio de Janeiro': ["Christ the Redeemer is still watching", "Copacabana from the other side"],
  'Singapore':  ["Singapore is organised in every orientation", "The Lion City roars south-up"],
  'Bangkok':    ["Bangkok traffic: chaotic in any direction", "Khao San Road still confuses you"],
  'Nairobi':    ["Nairobi skyline hits different", "The Great Rift Valley, inverted"],
  'Jakarta':    ["Jakarta just sprawls. In every direction.", "Java from the south side"],
  'Seoul':      ["Gangnam is now below the river. Wait—", "Seoul's neon looks the same, flipped"],
};

function getTimeOfDayMessage(): string | null {
  const h = new Date().getHours();
  if (h >= 0 && h < 5) {
    const msgs = [
      "Late night cartography? Respect.",
      "The world looks different at this hour",
      "Insomniac cartography. We see you.",
      "Maps hit different after midnight",
    ];
    return msgs[Math.floor(Math.random() * msgs.length)];
  }
  if (h >= 5 && h < 8) {
    const msgs = [
      "Early bird gets the disorientation",
      "Coffee and cartography. Good combo.",
      "Starting the day upside down. Bold.",
    ];
    return msgs[Math.floor(Math.random() * msgs.length)];
  }
  if (h >= 22) {
    const msgs = [
      "Night owl cartography",
      "The stars don't know north either",
      "Evening disorientation session",
    ];
    return msgs[Math.floor(Math.random() * msgs.length)];
  }
  return null;
}

function getAchievementMessage(flipCount: number): string | null {
  switch (flipCount) {
    case 5:  return "5 flips. You're getting the hang of this.";
    case 10: return "10 flips. You're officially lost.";
    case 25: return "25 flips. Cartography anarchist.";
    case 50: return "50 flips. You should teach a class.";
    case 100: return "100 flips. You've broken your atlas forever.";
    default: return null;
  }
}

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
  // Achievement messages take priority
  const achievement = getAchievementMessage(state.flipCount);
  if (achievement) return achievement;

  // Time-of-day messages (15% chance)
  if (Math.random() < 0.15) {
    const tod = getTimeOfDayMessage();
    if (tod) return tod;
  }

  // City-specific jokes (20% chance when city matches)
  if (state.currentCityName && target === 'upside-down' && Math.random() < 0.20) {
    const jokes = cityJokes[state.currentCityName];
    if (jokes) return jokes[Math.floor(Math.random() * jokes.length)];
  }

  // Location-aware messages (55% chance when city known)
  if (state.currentCityName && Math.random() < 0.55) {
    const locMsgs = locationToasts[target];
    const template = locMsgs[Math.floor(Math.random() * locMsgs.length)];
    return template.replace('{city}', state.currentCityName);
  }

  // Default orientation messages
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

  state.flipCount++;
  trackOrientationChange(target);
  showFlipToast(state, getOrientationToast(state, target));
  trackEvent('flip', { orientation: target, city: state.currentCityName || 'unknown', flip_number: state.flipCount });

  // Share nudge: after first flip, suggest sharing (once per session)
  if (!sessionStorage.getItem('wud-share-nudged')) {
    sessionStorage.setItem('wud-share-nudged', '1');
    setTimeout(() => {
      const city = state.currentCityName;
      const msg = city
        ? `Share ${city} upside down with someone`
        : 'Share this with someone who needs disorienting';
      showFlipToast(state, msg);
    }, 4000);
  }

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
