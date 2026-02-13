/* ══════════════════════════════════════════════════════════════
   Saved Maps Library — localStorage persistence for map configs
   ══════════════════════════════════════════════════════════════ */
import type { AppState, Orientation } from "./map-state";
import type { MapPalette } from "./ink-palette";

const STORAGE_KEY = 'wud-saved-maps';
const MAX_SAVED = 20;

export interface SavedMap {
  id: string;
  name: string;
  timestamp: number;
  center: [number, number];
  zoom: number;
  bearing: number;
  orientation: Orientation;
  styleId: string;
  palette: MapPalette;
  fontPairing: string;
  title: [string, string];
  textColor: string;
  thumbnail: string; // data URL
}

function loadAll(): SavedMap[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

function saveAll(maps: SavedMap[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(maps));
  } catch { /* storage full — remove oldest */ }
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function captureThumbnail(state: AppState): string {
  try {
    const canvas = state.map.getCanvas();
    // Create a small thumbnail (160x120)
    const thumb = document.createElement('canvas');
    thumb.width = 160;
    thumb.height = 120;
    const ctx = thumb.getContext('2d');
    if (!ctx) return '';
    ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, 160, 120);
    return thumb.toDataURL('image/jpeg', 0.6);
  } catch {
    return '';
  }
}

export function saveCurrentMap(state: AppState, name?: string): SavedMap {
  const maps = loadAll();
  const center = state.map.getCenter();
  const l1 = document.getElementById('screenprint-l1')?.textContent || 'UPSIDE';
  const l2 = document.getElementById('screenprint-l2')?.textContent || 'DOWN';
  const textColor = getComputedStyle(document.documentElement).getPropertyValue('--sp-color').trim();

  const saved: SavedMap = {
    id: generateId(),
    name: name || state.currentCityName || 'Saved map',
    timestamp: Date.now(),
    center: [center.lng, center.lat],
    zoom: state.map.getZoom(),
    bearing: state.map.getBearing(),
    orientation: state.orientation,
    styleId: state.currentStyleId,
    palette: { ...state.currentMapPalette },
    fontPairing: state.fontState.activePairing,
    title: [l1, l2],
    textColor,
    thumbnail: captureThumbnail(state),
  };

  maps.unshift(saved);
  if (maps.length > MAX_SAVED) maps.pop();
  saveAll(maps);

  return saved;
}

export function deleteSavedMap(id: string): void {
  const maps = loadAll().filter(m => m.id !== id);
  saveAll(maps);
}

export function getSavedMaps(): SavedMap[] {
  return loadAll();
}

export function setupSavedMaps(_state: AppState): void {
  // Saved maps UI will be rendered into the sidebar when opened
  // This is a placeholder — full sidebar integration happens via the sidebar module
}
