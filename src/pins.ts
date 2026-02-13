import maplibregl from "maplibre-gl";
import type { AppState } from "./map-state";
import { showFlipToast } from "./orientation";
import { closeAllDropdowns } from "./style-system";
import { trackEvent } from "./analytics";

const STORAGE_KEY = 'wud-pins';

interface Pin {
  id: string;
  lat: number;
  lng: number;
  emotion: string;
  timestamp: number;
}

const EMOTIONS = [
  { id: 'lost',      emoji: '\u{1F62B}', label: 'Lost here',  color: '#FF48B0' },
  { id: 'love',      emoji: '\u2764\uFE0F',  label: 'Love this',  color: '#FF48B0' },
  { id: 'mindblown', emoji: '\u{1F92F}', label: 'Mind blown', color: '#0078BF' },
  { id: 'nostalgic', emoji: '\u{1F305}', label: 'Nostalgic',  color: '#FFE627' },
  { id: 'want',      emoji: '\u{1F4CC}', label: 'Want to go', color: '#00838A' },
  { id: 'been',      emoji: '\u2713',    label: 'Been here',  color: '#88898A' },
] as const;

const pinToasts = [
  "Pinned. This place is yours now.",
  "Marked. The map remembers.",
  "Your emotional cartography grows.",
  "One more pin in your world.",
  "Noted. The map is personal now.",
];

function loadPins(): Pin[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch { return []; }
}

function savePins(pins: Pin[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pins));
}

// Active markers on the map
const markers: Map<string, maplibregl.Marker> = new Map();

function createMarkerEl(emotion: string): HTMLElement {
  const info = EMOTIONS.find(e => e.id === emotion);
  const el = document.createElement('div');
  el.className = 'pin-marker';
  el.textContent = info?.emoji || '\u{1F4CC}';
  el.style.setProperty('--pin-color', info?.color || '#FF48B0');
  return el;
}

function renderPins(state: AppState, pins: Pin[]): void {
  // Clear existing
  markers.forEach(m => m.remove());
  markers.clear();

  for (const pin of pins) {
    const el = createMarkerEl(pin.emotion);

    // Long-press to delete
    let pressTimer: ReturnType<typeof setTimeout> | null = null;
    el.addEventListener('pointerdown', () => {
      pressTimer = setTimeout(() => {
        if (confirm('Remove this pin?')) {
          const updated = loadPins().filter(p => p.id !== pin.id);
          savePins(updated);
          renderPins(state, updated);
          showFlipToast(state, 'Pin removed');
        }
      }, 600);
    });
    el.addEventListener('pointerup', () => { if (pressTimer) clearTimeout(pressTimer); });
    el.addEventListener('pointercancel', () => { if (pressTimer) clearTimeout(pressTimer); });

    const marker = new maplibregl.Marker({ element: el })
      .setLngLat([pin.lng, pin.lat])
      .addTo(state.map);
    markers.set(pin.id, marker);
  }
}

export function setupPins(state: AppState): void {
  const btn = document.getElementById('tool-pin');
  const picker = document.getElementById('pin-picker');
  if (!btn || !picker) return;

  let pinMode = false;
  let selectedEmotion = '';

  // Build emotion picker
  for (const e of EMOTIONS) {
    const item = document.createElement('button');
    item.className = 'tb-dropdown-item pin-emotion-item';
    item.dataset.emotion = e.id;
    item.innerHTML = `<span class="pin-emotion-emoji">${e.emoji}</span> ${e.label}`;
    item.addEventListener('click', (ev) => {
      ev.stopPropagation();
      closeAllDropdowns();
      selectedEmotion = e.id;
      pinMode = true;
      btn.classList.add('active');
      state.map.getCanvas().style.cursor = 'crosshair';
      showFlipToast(state, `Tap the map to drop "${e.label}"`);
    });
    picker.appendChild(item);
  }

  // Toggle picker
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (pinMode) {
      // Exit pin mode
      pinMode = false;
      btn.classList.remove('active');
      state.map.getCanvas().style.cursor = '';
      closeAllDropdowns();
      return;
    }
    const isOpen = picker.classList.contains('open');
    closeAllDropdowns();
    if (!isOpen) picker.classList.add('open');
  });

  // Map click in pin mode
  state.map.on('click', (e) => {
    if (!pinMode || !selectedEmotion) return;

    const pin: Pin = {
      id: `pin-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      lat: e.lngLat.lat,
      lng: e.lngLat.lng,
      emotion: selectedEmotion,
      timestamp: Date.now(),
    };

    const pins = loadPins();
    pins.push(pin);
    savePins(pins);

    // Exit pin mode
    pinMode = false;
    selectedEmotion = '';
    btn.classList.remove('active');
    state.map.getCanvas().style.cursor = '';

    renderPins(state, pins);

    const toast = pinToasts[Math.floor(Math.random() * pinToasts.length)];
    showFlipToast(state, toast);
    trackEvent('pin', { emotion: pin.emotion, city: state.currentCityName || 'unknown' });
  });

  // Render existing pins
  const existing = loadPins();
  if (existing.length > 0) {
    renderPins(state, existing);
  }
}
