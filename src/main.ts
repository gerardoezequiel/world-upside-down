import maplibregl from "maplibre-gl";
import "./analytics";
import { initDymaxion } from "./dymaxion";
import { RISO_INKS, PAPER, generateMisregistration, getSessionSeed } from "./riso";
import {
  INK_CATALOG, PALETTES, CATEGORY_INKS, DEFAULT_PALETTE_ID,
  buildDerivedPalette, applyMapPalette, buildTextPairings, darken,
  type MapPalette, type DerivedPalette, type PresetPalette,
} from "./ink-palette";

/* ── 5-Colour Risograph — Official Riso Kagaku Inks ─────────── */
let PALETTE: Record<string, string> = {
  bg:        PAPER,
  earth:     "#F5F5F5",
  water:     RISO_INKS.teal.hex,
  waterLine: "#006A70",
  buildings: RISO_INKS.blue.hex,
  urban:     "#7BBCE0",
  park:      RISO_INKS.fluorPink.hex,
  parkAlt:   "#FF80C8",
  road:      "#000000",
  roadMajor: "#000000",
  roadMinor: RISO_INKS.lightGray.hex,
  roadCas:   "#D8D4CC",
  rail:      "#000000",
  boundary:  "#000000",
  label:     "#000000",
  labelHalo: PAPER,
  grass:     "#DDD8CC",
  farmland:  "#E0DCC8",
  scrub:     "#D4D0C0",
  barren:    "#E0DAC8",
  glacier:   "#EEEEEE",
  hospital:  "#FFB8D8",
  school:    "#A0D4F0",
  industrial:"#D0D4D8",
  beach:     "#F0E8D0",
  zoo:       "#FFB0D0",
  aerodrome: "#D0D0D0",
  pier:      "#D8D4CC",
  pedestrian:"#E0DCD4",
  runway:    "#B8B4AC",
};

/* ── Ink palette state ─────────────────────────────────────── */
let currentPaletteId = DEFAULT_PALETTE_ID;
let currentMapPalette: MapPalette = { ...PALETTES[0].palette };

/* ── Color replacement map ────────────────────────────────── */
const COLOR_MAP: Record<string, string> = {
  "#cccccc": PALETTE.bg,
  "#e2dfda": PALETTE.earth,
  "#cccccc_buildings": PALETTE.buildings,
  "#80deea": PALETTE.water,
  "#b4d4e1": PALETTE.waterLine,
  "rgba(210, 239, 207, 1)": PALETTE.grass,
  "rgba(255, 243, 215, 1)": PALETTE.barren,
  "rgba(230, 230, 230, 1)": PALETTE.urban,
  "rgba(216, 239, 210, 1)": PALETTE.farmland,
  "rgba(255, 255, 255, 1)": PALETTE.glacier,
  "rgba(234, 239, 210, 1)": PALETTE.scrub,
  "rgba(196, 231, 210, 1)": PALETTE.grass,
};

/* ── Deep-clone & recolor a style layer ───────────────────── */
function recolorStyle(style: maplibregl.StyleSpecification): maplibregl.StyleSpecification {
  const s = JSON.parse(JSON.stringify(style)) as maplibregl.StyleSpecification;

  for (const layer of s.layers) {
    const id = (layer as any).id as string;

    if (id === "background" && "paint" in layer) {
      (layer as any).paint["background-color"] = PALETTE.bg;
      continue;
    }

    if (id === "earth" && "paint" in layer) {
      (layer as any).paint["fill-color"] = PALETTE.earth;
      continue;
    }

    if (id === "buildings" && "paint" in layer) {
      (layer as any).paint["fill-color"] = PALETTE.buildings;
      (layer as any).paint["fill-opacity"] = [
        "interpolate", ["linear"], ["zoom"],
        12, 0.5, 14, 0.70, 16, 0.85,
      ];
      (layer as any).paint["fill-outline-color"] = "rgba(0, 120, 191, 0.25)";
      continue;
    }

    if (id === "water" && "paint" in layer) {
      (layer as any).paint["fill-color"] = PALETTE.water;
      continue;
    }

    if ((id === "water_stream" || id === "water_river") && "paint" in layer) {
      (layer as any).paint["line-color"] = PALETTE.waterLine;
      continue;
    }

    if (id.startsWith("landuse_park") && "paint" in layer) {
      (layer as any).paint["fill-color"] = PALETTE.park;
      (layer as any).paint["fill-opacity"] = 0.7;
      continue;
    }
    if (id === "landuse_urban_green" && "paint" in layer) {
      (layer as any).paint["fill-color"] = PALETTE.parkAlt;
      continue;
    }

    if (id === "landuse_hospital" && "paint" in layer) { (layer as any).paint["fill-color"] = PALETTE.hospital; continue; }
    if (id === "landuse_school" && "paint" in layer) { (layer as any).paint["fill-color"] = PALETTE.school; continue; }
    if (id === "landuse_industrial" && "paint" in layer) { (layer as any).paint["fill-color"] = PALETTE.industrial; continue; }
    if (id === "landuse_beach" && "paint" in layer) { (layer as any).paint["fill-color"] = PALETTE.beach; continue; }
    if (id === "landuse_zoo" && "paint" in layer) { (layer as any).paint["fill-color"] = PALETTE.zoo; continue; }
    if (id === "landuse_aerodrome" && "paint" in layer) { (layer as any).paint["fill-color"] = PALETTE.aerodrome; continue; }
    if (id === "landuse_pedestrian" && "paint" in layer) { (layer as any).paint["fill-color"] = PALETTE.pedestrian; continue; }
    if (id === "landuse_pier" && "paint" in layer) { (layer as any).paint["fill-color"] = PALETTE.pier; continue; }
    if (id === "landuse_runway" && "paint" in layer) { (layer as any).paint["fill-color"] = PALETTE.runway; continue; }

    if (id === "landcover" && "paint" in layer) {
      (layer as any).paint["fill-color"] = [
        "match", ["get", "kind"],
        "grassland", PALETTE.grass, "barren", PALETTE.barren,
        "urban_area", PALETTE.urban, "farmland", PALETTE.farmland,
        "glacier", PALETTE.glacier, "scrub", PALETTE.scrub,
        PALETTE.grass,
      ];
      continue;
    }

    if (id.includes("_casing") && "paint" in layer) {
      const p = (layer as any).paint;
      if (p["line-color"]) p["line-color"] = PALETTE.roadCas;
      continue;
    }

    if (id.startsWith("roads_") && !id.includes("label") && !id.includes("shield") && !id.includes("oneway") && "paint" in layer) {
      const p = (layer as any).paint;
      if (p["line-color"]) {
        if (id.includes("highway") || id.includes("major")) p["line-color"] = PALETTE.roadMajor;
        else if (id.includes("minor") || id.includes("other") || id.includes("link")) p["line-color"] = PALETTE.roadMinor;
        else if (id.includes("rail")) p["line-color"] = PALETTE.rail;
        else if (id.includes("pier")) p["line-color"] = PALETTE.pier;
        else if (id.includes("runway") || id.includes("taxiway")) p["line-color"] = PALETTE.runway;
      }
      continue;
    }

    if (id.startsWith("boundaries") && "paint" in layer) {
      (layer as any).paint["line-color"] = PALETTE.boundary;
      continue;
    }

    if (id === "pois") {
      const l = layer as any;
      delete l.layout["icon-image"];
      l.layout["text-offset"] = [0, 0];
      l.layout["text-variable-anchor"] = ["center", "left", "right", "top", "bottom"];
      l.layout["text-size"] = ["interpolate", ["linear"], ["zoom"], 14, 9, 18, 13];
      l.paint["text-color"] = [
        "match", ["get", "kind"],
        "park", PALETTE.park, "forest", PALETTE.park, "garden", PALETTE.park,
        "beach", PALETTE.park, "zoo", PALETTE.zoo, "marina", PALETTE.waterLine,
        "station", PALETTE.road, "bus_stop", PALETTE.roadMinor,
        "ferry_terminal", PALETTE.waterLine, "aerodrome", PALETTE.roadMinor,
        "university", PALETTE.boundary, "library", PALETTE.boundary,
        "school", PALETTE.boundary, "townhall", PALETTE.boundary,
        "post_office", PALETTE.boundary, "museum", PALETTE.boundary,
        "theatre", PALETTE.boundary, "artwork", PALETTE.boundary,
        PALETTE.roadMinor,
      ];
      l.paint["text-halo-color"] = PALETTE.labelHalo;
      l.paint["text-halo-width"] = 1.2;
      continue;
    }

    if (id === "places_locality") {
      delete (layer as any).layout["icon-image"];
      continue;
    }

    if (id === "roads_shields") {
      (layer as any).layout = { visibility: "none" };
      continue;
    }

    if ("paint" in layer) {
      const p = (layer as any).paint;
      if (p["text-color"]) p["text-color"] = PALETTE.label;
      if (p["text-halo-color"]) p["text-halo-color"] = PALETTE.labelHalo;
    }
  }

  return s;
}

/* ══════════════════════════════════════════════════════════════
   SCALE BAR
   ══════════════════════════════════════════════════════════════ */
interface ScaleConfig { total: number; detail: number; dStep: number; mStep: number; }

const scaleConfigs: ScaleConfig[] = [
  { total: 100, detail: 10, dStep: 2, mStep: 20 },
  { total: 200, detail: 20, dStep: 5, mStep: 50 },
  { total: 500, detail: 50, dStep: 10, mStep: 100 },
  { total: 1000, detail: 100, dStep: 20, mStep: 200 },
  { total: 2000, detail: 200, dStep: 50, mStep: 500 },
  { total: 5000, detail: 500, dStep: 100, mStep: 1000 },
  { total: 10000, detail: 1000, dStep: 200, mStep: 2000 },
  { total: 20000, detail: 2000, dStep: 500, mStep: 5000 },
  { total: 50000, detail: 5000, dStep: 1000, mStep: 10000 },
  { total: 100000, detail: 10000, dStep: 2000, mStep: 20000 },
  { total: 200000, detail: 20000, dStep: 5000, mStep: 50000 },
  { total: 500000, detail: 50000, dStep: 10000, mStep: 100000 },
  { total: 1000000, detail: 100000, dStep: 20000, mStep: 200000 },
  { total: 2000000, detail: 200000, dStep: 50000, mStep: 500000 },
  { total: 5000000, detail: 500000, dStep: 100000, mStep: 1000000 },
];

const niceRatios = [
  100, 200, 250, 500, 1000, 2000, 2500, 5000, 10000,
  15000, 20000, 25000, 50000, 100000, 150000, 200000,
  250000, 500000, 1000000,
];

function updateScaleBar(map: maplibregl.Map): void {
  const ctr = map.getCenter();
  const y = (ctr.lat * Math.PI) / 180;
  const mpp = (156543.03392 * Math.cos(y)) / Math.pow(2, map.getZoom());

  const targetM = mpp * 200;
  let cfg = scaleConfigs[0];
  for (const c of scaleConfigs) {
    if (c.total <= targetM * 1.5) cfg = c;
    else break;
  }

  let totalPx = cfg.total / mpp;
  if (totalPx < 80) {
    for (const c of scaleConfigs) {
      const px = c.total / mpp;
      if (px >= 80 && px <= 300) { cfg = c; totalPx = px; break; }
    }
    if (totalPx < 80) {
      cfg = scaleConfigs[scaleConfigs.length - 1];
      totalPx = cfg.total / mpp;
    }
  }

  const ink = '#000000';
  const svgH = 28;
  const baseline = svgH - 4;
  const tickMajor = 12;
  const tickMinor = 6;
  const pad = 2;

  let svg = `<svg width="${Math.ceil(totalPx + pad + 4)}" height="${svgH}" viewBox="0 0 ${Math.ceil(totalPx + pad + 4)} ${svgH}" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<line x1="${pad}" y1="${baseline}" x2="${pad + totalPx}" y2="${baseline}" stroke="${ink}" stroke-width="1"/>`;

  interface Tick { px: number; label: string; isMajor: boolean; }
  const ticks: Tick[] = [];

  const useKm = cfg.total >= 2000;
  for (let m = 0; m <= cfg.detail; m += cfg.dStep) {
    const px = pad + (m / cfg.total) * totalPx;
    const isMajor = m === 0 || m === cfg.detail;
    let label = '';
    if (m === 0) label = '0';
    else if (isMajor) label = useKm ? String(m / 1000) : String(m);
    ticks.push({ px, label, isMajor });
  }

  for (let m = cfg.detail + cfg.mStep; m <= cfg.total; m += cfg.mStep) {
    const px = pad + (m / cfg.total) * totalPx;
    const label = useKm ? String(m / 1000) : String(m);
    ticks.push({ px, label, isMajor: true });
  }

  const endPx = pad + totalPx;
  const endInList = ticks.some((t) => Math.abs(t.px - endPx) < 1);
  if (!endInList) {
    ticks.push({
      px: endPx,
      label: useKm ? String(cfg.total / 1000) : String(cfg.total),
      isMajor: true,
    });
  }

  for (const t of ticks) {
    const h = t.isMajor ? tickMajor : tickMinor;
    svg += `<line x1="${t.px}" y1="${baseline}" x2="${t.px}" y2="${baseline - h}" stroke="${ink}" stroke-width="${t.isMajor ? 1 : 0.6}"/>`;
    if (t.label) {
      svg += `<text x="${t.px}" y="${baseline - h - 2}" text-anchor="middle" font-family="Space Mono,monospace" font-size="7" fill="${ink}" opacity="0.8">${t.label}</text>`;
    }
  }

  const unitLabel = cfg.total >= 2000 ? 'km' : 'm';
  svg += `<text x="${endPx + 6}" y="${baseline + 1}" font-family="Space Mono,monospace" font-size="6" fill="${ink}" opacity="0.6">${unitLabel}</text>`;
  svg += '</svg>';

  const el = document.getElementById('scale-svg');
  if (el) el.outerHTML = svg.replace('<svg ', '<svg id="scale-svg" ');

  const metersPerCm = mpp * 37.8;
  let ratio = Math.round(metersPerCm * 100);
  let best = niceRatios[0];
  for (const r of niceRatios) {
    if (Math.abs(r - ratio) < Math.abs(best - ratio)) best = r;
  }
  const ratioEl = document.getElementById('scale-ratio');
  if (ratioEl) ratioEl.textContent = `1:${best.toLocaleString()}`;
}

/* ── Live coordinates updater ────────────────────────────── */
function updateCoords(map: maplibregl.Map): void {
  const ctr = map.getCenter();
  const lat = ctr.lat;
  const lon = ctr.lng;
  const z = map.getZoom();

  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';

  const latEl = document.getElementById('coords-lat');
  const lonEl = document.getElementById('coords-lon');
  const zoomEl = document.getElementById('coords-zoom');

  if (latEl) latEl.textContent = `${Math.abs(lat).toFixed(2)}° ${latDir}`;
  if (lonEl) lonEl.textContent = `${Math.abs(lon).toFixed(2)}° ${lonDir}`;
  if (zoomEl) zoomEl.textContent = `z${z.toFixed(1)}`;
}

/* ══════════════════════════════════════════════════════════════
   THREE-MODE STATE MACHINE
   ══════════════════════════════════════════════════════════════ */
type Mode = 'poster' | 'explore' | 'maker';
let currentMode: Mode = 'poster';
let hasCustomTitle = false;

const IDLE_TIMEOUT = 45000; // 45s
let idleTimer: ReturnType<typeof setTimeout> | null = null;

const root = document.documentElement;

function setOverlayOpacity(val: number, transition?: string) {
  root.style.setProperty('--overlay-opacity', String(val));
  if (transition) root.style.setProperty('--overlay-transition', transition);
}

function setMode(mode: Mode, map?: maplibregl.Map) {
  if (mode === currentMode) return;
  const prev = currentMode;
  currentMode = mode;

  const overlay = document.getElementById('screenprint-overlay');
  const touchControls = document.getElementById('touch-controls');
  const flipHint = document.getElementById('flip-hint');

  if (mode === 'poster') {
    root.style.setProperty('--overlay-transition', '1.2s cubic-bezier(0.4, 0, 0.2, 1)');
    setOverlayOpacity(0.90);
    overlay?.classList.add('poster-mode');
    touchControls?.classList.remove('visible');
    flipHint?.classList.remove('visible');
    clearIdleTimer();
  }

  if (mode === 'explore') {
    root.style.setProperty('--overlay-transition', prev === 'poster' ? '1.2s cubic-bezier(0.4, 0, 0.2, 1)' : '0.6s ease');
    setOverlayOpacity(0);
    overlay?.classList.remove('poster-mode');

    // Staggered entrance
    setTimeout(() => touchControls?.classList.add('visible'), 150);
    setTimeout(() => {
      // Show flip hint on desktop, first visit only
      if (flipHint && !localStorage.getItem('wud-explored')) {
        flipHint.classList.add('visible');
        localStorage.setItem('wud-explored', '1');
      }
    }, 300);

    startIdleTimer(map);
  }

  if (mode === 'maker') {
    root.style.setProperty('--overlay-transition', '0.4s ease');
    setOverlayOpacity(0.50);
    overlay?.classList.remove('poster-mode');
    clearIdleTimer();
  }
}

function startIdleTimer(map?: maplibregl.Map) {
  clearIdleTimer();
  idleTimer = setTimeout(() => {
    if (currentMode === 'explore') {
      // Gentle drift back to poster
      root.style.setProperty('--overlay-transition', '3s ease-in-out');
      setOverlayOpacity(0.90);
      // After transition, formally enter poster mode
      setTimeout(() => {
        if (currentMode === 'explore') {
          currentMode = 'poster';
          document.getElementById('screenprint-overlay')?.classList.add('poster-mode');
          document.getElementById('touch-controls')?.classList.remove('visible');
        }
      }, 3000);
    }
  }, IDLE_TIMEOUT);
}

function clearIdleTimer() {
  if (idleTimer) { clearTimeout(idleTimer); idleTimer = null; }
}

function resetIdleTimer(map?: maplibregl.Map) {
  if (currentMode === 'explore') {
    // If we're drifting back, snap to explore
    const currentOpacity = parseFloat(root.style.getPropertyValue('--overlay-opacity') || '0.08');
    if (currentOpacity > 0.08) {
      root.style.setProperty('--overlay-transition', '0.3s ease');
      const zoom = map?.getZoom() ?? 11;
      setOverlayOpacity(0);
    }
    startIdleTimer(map);
  }
}

/* ── Reverse geocode for city name ───────────────────────── */
let geocodeTimeout: ReturnType<typeof setTimeout> | null = null;
let currentCityName = '';

function updateCityTitle(map: maplibregl.Map): void {
  if (geocodeTimeout) clearTimeout(geocodeTimeout);
  geocodeTimeout = setTimeout(async () => {
    const ctr = map.getCenter();
    const z = map.getZoom();
    const titleEl = document.getElementById('city-title');
    if (!titleEl) return;

    if (z < 5) {
      titleEl.textContent = 'Upside Down';
      currentCityName = '';
      return;
    }

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${ctr.lat}&lon=${ctr.lng}&zoom=${Math.min(Math.round(z), 14)}&format=json&accept-language=en`,
        { headers: { 'User-Agent': 'world-upside-down/1.0' } }
      );
      const data = await res.json();
      const addr = data.address;
      const name = addr?.city || addr?.town || addr?.village || addr?.state || addr?.country || '';
      if (name) {
        titleEl.textContent = name;
        currentCityName = name;
      }
    } catch {
      // Silently fail
    }
  }, 800);
}

/* ══════════════════════════════════════════════════════════════
   ORIENTATION SYSTEM
   ══════════════════════════════════════════════════════════════ */
type Orientation = 'upside-down' | 'normal' | 'mirrored';
let orientation: Orientation = 'upside-down';
let bearingLocked = true;

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

function toggleMapLabels(map: maplibregl.Map, show: boolean): void {
  const style = map.getStyle();
  if (!style) return;
  for (const layer of style.layers) {
    if (layer.type === 'symbol') {
      map.setLayoutProperty(layer.id, 'visibility', show ? 'visible' : 'none');
    }
  }
}

let lastToastTime = 0;
const TOAST_COOLDOWN = 3000;

function showFlipToast(text: string): void {
  const now = Date.now();
  if (now - lastToastTime < TOAST_COOLDOWN) return;
  lastToastTime = now;

  const toast = document.getElementById('flip-toast');
  if (!toast) return;
  toast.textContent = text;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2200);
}

function getOrientationToast(target: Orientation): string {
  if (currentCityName && Math.random() < 0.4) {
    const locMsgs = locationToasts[target];
    const template = locMsgs[Math.floor(Math.random() * locMsgs.length)];
    return template.replace('{city}', currentCityName);
  }
  const msgs = toastMessages[target];
  return msgs[Math.floor(Math.random() * msgs.length)];
}

function applyOrientation(map: maplibregl.Map, target: Orientation): void {
  if (target === orientation) return;
  const prev = orientation;
  orientation = target;

  const arrow = document.getElementById('north-arrow');
  const mapEl = document.getElementById('map');

  const needsBearingChange =
    (prev === 'upside-down' && target !== 'upside-down') ||
    (prev !== 'upside-down' && target === 'upside-down');

  if (needsBearingChange) {
    const targetBearing = target === 'upside-down' ? 180 : 0;
    bearingLocked = false;
    map.easeTo({
      bearing: targetBearing,
      duration: 1200,
      easing: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
    });
    setTimeout(() => { bearingLocked = true; }, 1300);
  }

  if (prev === 'mirrored' && target !== 'mirrored') {
    mapEl?.classList.remove('mirrored');
    toggleMapLabels(map, true);
  }
  if (target === 'mirrored' && prev !== 'mirrored') {
    if (prev === 'upside-down') {
      bearingLocked = false;
      map.easeTo({
        bearing: 0, duration: 1200,
        easing: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
      });
      setTimeout(() => {
        bearingLocked = true;
        mapEl?.classList.add('mirrored');
        toggleMapLabels(map, false);
      }, 1200);
    } else {
      mapEl?.classList.add('mirrored');
      toggleMapLabels(map, false);
    }
  }

  if (arrow) {
    arrow.classList.toggle('flipped', target === 'normal' || target === 'mirrored');
  }

  // Update screenprint text — only if user hasn't customized
  if (!hasCustomTitle) {
    const spL1 = document.getElementById('screenprint-l1');
    const spL2 = document.getElementById('screenprint-l2');
    if (spL1 && spL2) {
      if (target === 'upside-down') { spL1.textContent = 'UPSIDE'; spL2.textContent = 'DOWN'; }
      else if (target === 'normal') { spL1.textContent = 'NORTH'; spL2.textContent = 'UP'; }
      else if (target === 'mirrored') { spL1.textContent = 'EAST'; spL2.textContent = 'WEST'; }
    }
    // Brief overlay pulse
    if (currentMode === 'explore') {
      root.style.setProperty('--overlay-transition', '0.4s ease');
      setOverlayOpacity(0.60);
      setTimeout(() => {
        if (currentMode === 'explore') {
          root.style.setProperty('--overlay-transition', '0.8s ease');
          setOverlayOpacity(0);
        }
      }, 1500);
    }
  } else {
    // Custom title — subtle pulse
    if (currentMode === 'explore') {
      root.style.setProperty('--overlay-transition', '0.3s ease');
      setOverlayOpacity(0.15);
      setTimeout(() => {
        if (currentMode === 'explore') {
          root.style.setProperty('--overlay-transition', '0.5s ease');
          setOverlayOpacity(0);
        }
      }, 800);
    }
  }

  showFlipToast(getOrientationToast(target));

  // Enter explore mode on flip
  if (currentMode === 'poster') {
    setMode('explore', map);
  }
}

function setupFlip(map: maplibregl.Map): void {
  const flipHint = document.getElementById('flip-hint');

  document.addEventListener('keydown', (e) => {
    if ((e.target as HTMLElement).tagName === 'INPUT' ||
        (e.target as HTMLElement).hasAttribute('contenteditable')) return;

    switch (e.key) {
      case 'ArrowUp': applyOrientation(map, 'normal'); break;
      case 'ArrowDown': applyOrientation(map, 'upside-down'); break;
      case 'ArrowRight': applyOrientation(map, 'mirrored'); break;
      case 'ArrowLeft': applyOrientation(map, 'normal'); break;
      case 'Escape':
        closeAllPanels();
        if (currentMode === 'explore' || currentMode === 'maker') {
          setMode('poster', map);
        }
        return;
      default: return;
    }
    e.preventDefault();
    flipHint?.classList.remove('visible');
  });

  // Flip buttons (mobile)
  const touchPrompt = document.getElementById('touch-prompt');

  function updateFlipButtons() {
    document.querySelectorAll('.flip-btn').forEach(btn => {
      const orient = (btn as HTMLElement).dataset.orient as Orientation;
      btn.classList.toggle('active', orient === orientation);
    });
  }

  document.querySelectorAll('.flip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const orient = (btn as HTMLElement).dataset.orient as Orientation;
      if (orient) {
        const target = orientation === orient ? 'upside-down' : orient;
        applyOrientation(map, target);
        updateFlipButtons();
        touchPrompt?.classList.add('hidden');
      }
    });
  });

  updateFlipButtons();
}

/* ══════════════════════════════════════════════════════════════
   GEOCODER
   ══════════════════════════════════════════════════════════════ */
let searchTimeout: ReturnType<typeof setTimeout> | null = null;

function setupGeocoder(map: maplibregl.Map): void {
  const titleEl = document.getElementById('city-title')!;
  const geocoderEl = document.getElementById('geocoder')!;
  const inputEl = document.getElementById('geocoder-input') as HTMLInputElement;
  const resultsEl = document.getElementById('geocoder-results')!;

  function openGeocoder() {
    titleEl.style.display = 'none';
    geocoderEl.classList.add('open');
    inputEl.value = '';
    inputEl.focus();
    resultsEl.innerHTML = '';
    resultsEl.classList.remove('has-results');
  }

  function closeGeocoder() {
    geocoderEl.classList.remove('open');
    titleEl.style.display = '';
    resultsEl.innerHTML = '';
    resultsEl.classList.remove('has-results');
    if (searchTimeout) clearTimeout(searchTimeout);
  }

  titleEl.addEventListener('click', openGeocoder);

  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeGeocoder();
  });

  document.addEventListener('click', (e) => {
    if (geocoderEl.classList.contains('open') &&
        !geocoderEl.contains(e.target as Node) &&
        e.target !== titleEl) {
      closeGeocoder();
    }
  });

  inputEl.addEventListener('input', () => {
    const q = inputEl.value.trim();
    if (searchTimeout) clearTimeout(searchTimeout);

    if (q.length < 2) {
      resultsEl.innerHTML = '';
      resultsEl.classList.remove('has-results');
      return;
    }

    searchTimeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=6&accept-language=en`,
          { headers: { 'User-Agent': 'world-upside-down/1.0' } }
        );
        const results = await res.json();

        resultsEl.innerHTML = '';
        if (results.length === 0) {
          resultsEl.classList.remove('has-results');
          return;
        }

        resultsEl.classList.add('has-results');

        for (const r of results) {
          const item = document.createElement('div');
          item.className = 'geocoder-result';

          const parts = (r.display_name as string).split(', ');
          const name = parts[0];
          const detail = parts.slice(1).join(', ');

          item.innerHTML = `
            <span class="geocoder-result-name">${name}</span>
            <span class="geocoder-result-detail">${detail}</span>
          `;

          item.addEventListener('click', () => {
            const lat = parseFloat(r.lat);
            const lon = parseFloat(r.lon);
            const bbox = r.boundingbox;

            if (bbox) {
              const sw: [number, number] = [parseFloat(bbox[2]), parseFloat(bbox[0])];
              const ne: [number, number] = [parseFloat(bbox[3]), parseFloat(bbox[1])];
              map.fitBounds([sw, ne], {
                bearing: orientation === 'upside-down' ? 180 : 0,
                padding: 60, duration: 1800, maxZoom: 14,
              });
            } else {
              map.flyTo({
                center: [lon, lat], zoom: 12,
                bearing: orientation === 'upside-down' ? 180 : 0,
                duration: 1800,
              });
            }

            titleEl.textContent = name;
            closeGeocoder();
          });

          resultsEl.appendChild(item);
        }
      } catch {
        // Silently fail
      }
    }, 350);
  });

  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const first = resultsEl.querySelector('.geocoder-result') as HTMLElement | null;
      if (first) first.click();
    }
  });
}

/* ══════════════════════════════════════════════════════════════
   GRATICULE
   ══════════════════════════════════════════════════════════════ */
function addGraticule(map: maplibregl.Map): void {
  const GRAT_COLOR = '#D4A017';

  function getIntervals(zoom: number) {
    if (zoom >= 10) return { major: 1, sub: 0.25, labelSpacing: 5 };
    if (zoom >= 7)  return { major: 2, sub: 0.5, labelSpacing: 10 };
    if (zoom >= 5)  return { major: 5, sub: 1, labelSpacing: 20 };
    if (zoom >= 3)  return { major: 10, sub: 2, labelSpacing: 30 };
    if (zoom >= 2)  return { major: 15, sub: 5, labelSpacing: 45 };
    return { major: 30, sub: 10, labelSpacing: 60 };
  }

  function buildGraticuleGeoJSON(major: number, sub: number, labelSpacing: number): GeoJSON.FeatureCollection {
    const features: GeoJSON.Feature[] = [];

    for (let lon = -180; lon <= 180; lon += major) {
      const coords: [number, number][] = [];
      for (let lat = -85; lat <= 85; lat += 2) coords.push([lon, lat]);
      features.push({ type: 'Feature', properties: { rank: 'major' }, geometry: { type: 'LineString', coordinates: coords } });

      const lonLabel = lon === 0 ? '0°' : `${Math.abs(lon)}°${lon > 0 ? 'E' : 'W'}`;
      for (let lat = -80; lat <= 80; lat += labelSpacing) {
        features.push({
          type: 'Feature',
          properties: { rank: 'label', text: lonLabel, axis: 'lon' },
          geometry: { type: 'Point', coordinates: [lon, lat] },
        });
      }
    }

    for (let lat = -80; lat <= 80; lat += major) {
      const coords: [number, number][] = [];
      for (let lon = -180; lon <= 180; lon += 2) coords.push([lon, lat]);
      features.push({ type: 'Feature', properties: { rank: 'major' }, geometry: { type: 'LineString', coordinates: coords } });

      const latLabel = lat === 0 ? '0°' : `${Math.abs(lat)}°${lat > 0 ? 'N' : 'S'}`;
      for (let lon = -180; lon <= 180; lon += labelSpacing) {
        features.push({
          type: 'Feature',
          properties: { rank: 'label', text: latLabel, axis: 'lat' },
          geometry: { type: 'Point', coordinates: [lon, lat] },
        });
      }
    }

    for (let lon = -180; lon <= 180; lon += sub) {
      if (Number.isInteger(lon / major) && lon % major === 0) continue;
      const coords: [number, number][] = [];
      for (let lat = -85; lat <= 85; lat += 2) coords.push([lon, lat]);
      features.push({ type: 'Feature', properties: { rank: 'sub' }, geometry: { type: 'LineString', coordinates: coords } });
    }

    for (let lat = -80; lat <= 80; lat += sub) {
      if (Number.isInteger(lat / major) && lat % major === 0) continue;
      const coords: [number, number][] = [];
      for (let lon = -180; lon <= 180; lon += 2) coords.push([lon, lat]);
      features.push({ type: 'Feature', properties: { rank: 'sub' }, geometry: { type: 'LineString', coordinates: coords } });
    }

    return { type: 'FeatureCollection', features };
  }

  let currentMajor = getIntervals(map.getZoom()).major;
  const { major, sub, labelSpacing } = getIntervals(map.getZoom());

  map.addSource('graticule', {
    type: 'geojson',
    data: buildGraticuleGeoJSON(major, sub, labelSpacing),
  });

  map.addLayer({
    id: 'graticule-sub', type: 'line', source: 'graticule',
    filter: ['==', ['get', 'rank'], 'sub'],
    paint: {
      'line-color': GRAT_COLOR, 'line-opacity': 0.22,
      'line-width': ['interpolate', ['linear'], ['zoom'], 1, 0.4, 5, 0.5, 10, 0.6, 14, 0.8],
    },
  });

  map.addLayer({
    id: 'graticule-major', type: 'line', source: 'graticule',
    filter: ['==', ['get', 'rank'], 'major'],
    paint: {
      'line-color': GRAT_COLOR, 'line-opacity': 0.40,
      'line-width': ['interpolate', ['linear'], ['zoom'], 1, 0.5, 5, 0.7, 10, 1.0, 14, 1.2],
    },
  });

  map.addLayer({
    id: 'graticule-labels', type: 'symbol', source: 'graticule',
    filter: ['==', ['get', 'rank'], 'label'],
    layout: {
      'text-field': ['get', 'text'],
      'text-font': ['Open Sans Regular'],
      'text-size': ['interpolate', ['linear'], ['zoom'], 1, 8, 5, 9, 10, 10],
      'text-anchor': 'bottom-left',
      'text-offset': [0.3, -0.2],
      'text-allow-overlap': false,
      'text-ignore-placement': false,
      'text-padding': 20,
      'symbol-placement': 'point',
    },
    paint: {
      'text-color': GRAT_COLOR, 'text-opacity': 0.65,
      'text-halo-color': 'rgba(242, 237, 228, 0.6)', 'text-halo-width': 1,
    },
  });

  map.on('zoomend', () => {
    const intervals = getIntervals(map.getZoom());
    if (intervals.major !== currentMajor) {
      currentMajor = intervals.major;
      const src = map.getSource('graticule') as maplibregl.GeoJSONSource;
      if (src) src.setData(buildGraticuleGeoJSON(intervals.major, intervals.sub, intervals.labelSpacing));
    }
  });

  const labelContainer = document.getElementById('grat-edge-labels');
  if (labelContainer) labelContainer.innerHTML = '';
}

/* ── Riso Misregistration ──────────────────────────────────── */
function applyRisoMisregistration(map: maplibregl.Map): void {
  const seed = getSessionSeed();
  const misreg = generateMisregistration(seed);
  const style = map.getStyle();
  if (!style) return;

  const SCALE = 2.5;

  const waterLayer = style.layers.find(l => l.id === 'water');
  if (waterLayer && 'source-layer' in waterLayer) {
    map.addLayer({
      id: 'water-riso-offset', type: 'fill',
      source: (waterLayer as any).source,
      'source-layer': (waterLayer as any)['source-layer'],
      paint: {
        'fill-color': RISO_INKS.teal.hex, 'fill-opacity': 0.12,
        'fill-translate': [misreg.teal.dx * SCALE, misreg.teal.dy * SCALE],
      },
    }, 'water');
  }

  const buildingLayer = style.layers.find(l => l.id === 'buildings');
  if (buildingLayer && 'source-layer' in buildingLayer) {
    map.addLayer({
      id: 'buildings-riso-offset', type: 'fill',
      source: (buildingLayer as any).source,
      'source-layer': (buildingLayer as any)['source-layer'],
      paint: {
        'fill-color': RISO_INKS.blue.hex, 'fill-opacity': 0.10,
        'fill-translate': [misreg.blue.dx * SCALE, misreg.blue.dy * SCALE],
      },
    }, 'buildings');
  }

  for (const layer of style.layers) {
    if (layer.id.startsWith('landuse_park') && layer.type === 'fill' && 'source-layer' in layer) {
      map.addLayer({
        id: `${layer.id}-riso-offset`, type: 'fill',
        source: (layer as any).source,
        'source-layer': (layer as any)['source-layer'],
        filter: (layer as any).filter,
        paint: {
          'fill-color': RISO_INKS.fluorPink.hex, 'fill-opacity': 0.12,
          'fill-translate': [misreg.fluorPink.dx * SCALE, misreg.fluorPink.dy * SCALE],
        },
      }, layer.id);
    }
  }

  for (const layer of style.layers) {
    if ((layer.id.startsWith('roads_') || layer.id.startsWith('boundaries')) &&
        layer.type === 'line' && 'source-layer' in layer &&
        !layer.id.includes('label') && !layer.id.includes('shield')) {
      const lineWidth = (layer as any).paint?.['line-width'] || 1;
      try {
        map.addLayer({
          id: `${layer.id}-riso-offset`, type: 'line',
          source: (layer as any).source,
          'source-layer': (layer as any)['source-layer'],
          filter: (layer as any).filter,
          paint: {
            'line-color': '#333333', 'line-width': lineWidth,
            'line-opacity': 0.08,
            'line-translate': [misreg.black.dx * SCALE, misreg.black.dy * SCALE],
          },
        }, layer.id);
      } catch {
        // Skip
      }
    }
  }
}

/* ══════════════════════════════════════════════════════════════
   ⊕ REGISTRATION MARK & TOOL MENU
   ══════════════════════════════════════════════════════════════ */
let formatsOpen = false;

function closeAllPanels() {
  const colorStrip = document.getElementById('color-strip');
  const exportPreview = document.getElementById('export-preview');

  closeAllDropdowns();
  colorStrip?.classList.remove('visible');
  exportPreview?.classList.remove('visible');
  formatsOpen = false;
}

function setupTools(map: maplibregl.Map): void {
  setupToolLocate(map);
  setupToolTitle(map);
  setupToolInk(map);
  setupToolDownload(map);
  setupToolShare(map);
}

/* ══════════════════════════════════════════════════════════════
   TOOL: ⌖ FIND ME (Geolocation)
   ══════════════════════════════════════════════════════════════ */
function setupToolLocate(map: maplibregl.Map): void {
  const btn = document.getElementById('tool-locate');
  if (!btn) return;

  btn.addEventListener('click', () => {
    closeAllPanels();

    if (!navigator.geolocation) {
      showFlipToast("Couldn't find you — try searching instead");
      return;
    }

    showFlipToast("Finding you...");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;

        map.flyTo({
          center: [lon, lat], zoom: 13,
          bearing: orientation === 'upside-down' ? 180 : 0,
          duration: 2000,
        });

        // Reverse geocode
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&zoom=14&format=json&accept-language=en`,
            { headers: { 'User-Agent': 'world-upside-down/1.0' } }
          );
          const data = await res.json();
          const addr = data.address;
          const name = addr?.city || addr?.town || addr?.village || addr?.state || addr?.country || 'Here';

          // Update title
          const titleEl = document.getElementById('city-title');
          if (titleEl) titleEl.textContent = name;
          currentCityName = name;

          // Update screenprint text
          updateScreenprintText(name);
          hasCustomTitle = true;

          // Snap to poster with new text
          setTimeout(() => setMode('poster', map), 500);
          setTimeout(() => showFlipToast(`${name}, upside down`), 2600);
        } catch {
          setMode('poster', map);
        }
      },
      () => {
        showFlipToast("Couldn't find you — try searching instead");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

function updateScreenprintText(name: string): void {
  const spL1 = document.getElementById('screenprint-l1');
  const spL2 = document.getElementById('screenprint-l2');
  if (!spL1 || !spL2) return;

  const words = name.toUpperCase().split(/\s+/);
  if (words.length === 1) {
    spL1.textContent = words[0];
    spL2.textContent = '';
  } else if (words.length === 2) {
    spL1.textContent = words[0];
    spL2.textContent = words[1];
  } else {
    spL1.textContent = words[0];
    spL2.textContent = words.slice(1).join(' ');
  }
}

/* ══════════════════════════════════════════════════════════════
   TOOL: T TITLE EDITOR
   ══════════════════════════════════════════════════════════════ */
function setupToolTitle(map: maplibregl.Map): void {
  const btn = document.getElementById('tool-title');
  const colorStripEl = document.getElementById('color-strip');
  const spL1El = document.getElementById('screenprint-l1');
  const spL2El = document.getElementById('screenprint-l2');
  if (!btn || !colorStripEl || !spL1El || !spL2El) return;
  const colorStrip: HTMLElement = colorStripEl;
  const spL1: HTMLElement = spL1El;
  const spL2: HTMLElement = spL2El;

  btn.addEventListener('click', () => {
    closeAllPanels();
    setMode('maker', map);

    // Make text editable
    spL1.setAttribute('contenteditable', 'true');
    spL2.setAttribute('contenteditable', 'true');

    // Select line 1 text
    const range = document.createRange();
    range.selectNodeContents(spL1);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);

    // Show color strip
    colorStrip.classList.add('visible');

    // Enter on line 1 → focus line 2
    function handleL1Keydown(e: KeyboardEvent) {
      if (e.key === 'Enter') {
        e.preventDefault();
        spL2.focus();
        const r = document.createRange();
        r.selectNodeContents(spL2);
        const s = window.getSelection();
        s?.removeAllRanges();
        s?.addRange(r);
      }
    }

    // Enter on line 2 or Escape → confirm
    function handleL2Keydown(e: KeyboardEvent) {
      if (e.key === 'Enter' || e.key === 'Escape') {
        e.preventDefault();
        confirmEdit();
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        confirmEdit();
      }
    }

    // Click outside to confirm
    function handleClickOutside(e: MouseEvent) {
      if (!spL1.contains(e.target as Node) &&
          !spL2.contains(e.target as Node) &&
          !colorStrip.contains(e.target as Node)) {
        confirmEdit();
      }
    }

    function confirmEdit() {
      spL1.removeAttribute('contenteditable');
      spL2.removeAttribute('contenteditable');
      colorStrip.classList.remove('visible');

      spL1.removeEventListener('keydown', handleL1Keydown);
      spL2.removeEventListener('keydown', handleL2Keydown);
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('click', handleClickOutside);

      hasCustomTitle = true;

      // Store in session
      sessionStorage.setItem('wud-custom-title', JSON.stringify({
        l1: spL1.textContent || '',
        l2: spL2.textContent || '',
      }));

      // Update shareable URL
      updateShareableHash();

      // Snap to poster
      setMode('poster', map);

      const toasts = ["Your poster", "Claimed", "Now it's yours"];
      setTimeout(() => showFlipToast(toasts[Math.floor(Math.random() * toasts.length)]), 700);
    }

    spL1.addEventListener('keydown', handleL1Keydown);
    spL2.addEventListener('keydown', handleL2Keydown);
    document.addEventListener('keydown', handleEscape);
    // Delay click-outside to avoid immediate trigger
    setTimeout(() => document.addEventListener('click', handleClickOutside), 100);
  });

  // Color dot clicks are handled by updateColorStrip() which rebuilds dots dynamically
}

/* ══════════════════════════════════════════════════════════════
   TOOL: ◉ INK PALETTE
   ══════════════════════════════════════════════════════════════ */
function setupToolInk(map: maplibregl.Map): void {
  const btn = document.getElementById('tool-ink');
  const panel = document.getElementById('ink-panel');
  const presetsContainer = document.getElementById('ink-presets');
  const customContainer = document.getElementById('ink-custom');
  if (!btn || !panel || !presetsContainer || !customContainer) return;

  // Toggle dropdown
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = panel.classList.contains('open');
    closeAllDropdowns();
    if (!isOpen) panel.classList.add('open');
  });

  // Build preset rows
  for (const preset of PALETTES) {
    const row = document.createElement('div');
    row.className = 'ink-preset-row' + (preset.id === currentPaletteId ? ' active' : '');
    row.dataset.presetId = preset.id;

    const dots = document.createElement('div');
    dots.className = 'ink-preset-dots';
    for (const role of ['base', 'water', 'built', 'green', 'ink'] as (keyof MapPalette)[]) {
      const dot = document.createElement('span');
      dot.className = 'ink-dot';
      dot.style.background = INK_CATALOG[preset.palette[role]].hex;
      dots.appendChild(dot);
    }
    row.appendChild(dots);

    const name = document.createElement('span');
    name.className = 'ink-preset-name';
    name.textContent = preset.name;
    row.appendChild(name);

    row.addEventListener('click', (e) => {
      e.stopPropagation();
      selectPreset(map, preset);
    });

    presetsContainer.appendChild(row);
  }

  // Build customizer
  buildCustomizer(map, customContainer);

  // Initialize color strip from default palette
  updateColorStrip(currentMapPalette);

  // Restore persisted palette (may update color strip again)
  restorePalette(map);
}

function selectPreset(map: maplibregl.Map, preset: PresetPalette): void {
  currentPaletteId = preset.id;
  currentMapPalette = { ...preset.palette };

  const derived = buildDerivedPalette(currentMapPalette);
  applyMapPalette(map, derived, currentMapPalette);
  updatePALETTEFromDerived(derived);
  updateLegendColors(derived);
  updateColorStrip(currentMapPalette);
  updateInkUI();
  persistPalette();
  updateShareableHash();
}

function buildCustomizer(map: maplibregl.Map, container: HTMLElement): void {
  const title = document.createElement('div');
  title.className = 'ink-section-title';
  title.textContent = 'Custom mix';
  container.appendChild(title);

  const roles: { key: keyof MapPalette; label: string }[] = [
    { key: 'base',  label: 'Base' },
    { key: 'water', label: 'Water' },
    { key: 'built', label: 'Built' },
    { key: 'green', label: 'Green' },
    { key: 'ink',   label: 'Ink' },
  ];

  for (const { key, label } of roles) {
    const cat = document.createElement('div');
    cat.className = 'ink-category';
    cat.dataset.role = key;

    // Header
    const header = document.createElement('div');
    header.className = 'ink-category-header';

    const dot = document.createElement('span');
    dot.className = 'ink-dot ink-category-dot';
    dot.style.background = INK_CATALOG[currentMapPalette[key]].hex;
    header.appendChild(dot);

    const labelEl = document.createElement('span');
    labelEl.className = 'ink-category-label';
    labelEl.textContent = label;
    header.appendChild(labelEl);

    const current = document.createElement('span');
    current.className = 'ink-category-current';
    current.textContent = INK_CATALOG[currentMapPalette[key]].name;
    header.appendChild(current);

    header.addEventListener('click', (e) => {
      e.stopPropagation();
      cat.classList.toggle('open');
    });
    cat.appendChild(header);

    // Body — ink options
    const body = document.createElement('div');
    body.className = 'ink-category-body';

    for (const inkId of CATEGORY_INKS[key]) {
      const ink = INK_CATALOG[inkId];
      const opt = document.createElement('button');
      opt.className = 'ink-option' + (currentMapPalette[key] === inkId ? ' active' : '');
      opt.dataset.inkId = inkId;

      const optDot = document.createElement('span');
      optDot.className = 'ink-dot';
      optDot.style.background = ink.hex;
      opt.appendChild(optDot);

      const optName = document.createElement('span');
      optName.textContent = ink.name;
      opt.appendChild(optName);

      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        selectCategoryInk(map, key, inkId);
      });

      body.appendChild(opt);
    }

    cat.appendChild(body);
    container.appendChild(cat);
  }
}

function selectCategoryInk(map: maplibregl.Map, role: keyof MapPalette, inkId: string): void {
  currentMapPalette[role] = inkId;
  currentPaletteId = 'custom';

  const derived = buildDerivedPalette(currentMapPalette);
  applyMapPalette(map, derived, currentMapPalette);
  updatePALETTEFromDerived(derived);
  updateLegendColors(derived);
  updateColorStrip(currentMapPalette);
  updateInkUI();
  persistPalette();
  updateShareableHash();
}

function updatePALETTEFromDerived(d: DerivedPalette): void {
  // Keep the global PALETTE in sync for export and other reads
  PALETTE = { ...d } as unknown as Record<string, string>;
}

function updateLegendColors(d: DerivedPalette): void {
  const rows = document.querySelectorAll('.leg-item');
  const colorMap: Record<string, string> = {
    'Land': d.earth,
    'Water': d.water,
    'Buildings': d.buildings,
    'Parks': d.park,
  };

  rows.forEach(row => {
    const label = row.querySelector('span')?.textContent?.trim();
    if (label && colorMap[label]) {
      const rect = row.querySelector('rect');
      if (rect) {
        rect.setAttribute('fill', colorMap[label]);
        rect.setAttribute('stroke', darken(colorMap[label], 0.15));
      }
    }
  });
}

function updateColorStrip(mp: MapPalette): void {
  const strip = document.getElementById('color-strip');
  if (!strip) return;

  const pairings = buildTextPairings(mp);
  strip.innerHTML = '';

  pairings.forEach((p, i) => {
    const btn = document.createElement('button');
    btn.className = 'color-dot' + (i === 0 ? ' active' : '');
    btn.dataset.color = p.color;
    btn.dataset.shadow = p.shadow;
    btn.setAttribute('aria-label', p.name);

    const span = document.createElement('span');
    span.style.background = p.color;
    btn.appendChild(span);

    if (p.recommended) {
      btn.classList.add('recommended');
    }

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      strip.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
      btn.classList.add('active');
      root.style.setProperty('--sp-color', p.color);
      root.style.setProperty('--sp-shadow', p.shadow);
      updateShareableHash();
    });

    strip.appendChild(btn);
  });

  // Auto-apply recommended (first) pairing
  const first = pairings[0];
  if (first) {
    root.style.setProperty('--sp-color', first.color);
    root.style.setProperty('--sp-shadow', first.shadow);
  }
}

function updateInkUI(): void {
  // Update preset rows active state
  document.querySelectorAll('.ink-preset-row').forEach(row => {
    const el = row as HTMLElement;
    row.classList.toggle('active', el.dataset.presetId === currentPaletteId);
  });

  // Update category headers and option active states
  document.querySelectorAll('.ink-category').forEach(cat => {
    const el = cat as HTMLElement;
    const role = el.dataset.role as keyof MapPalette;
    if (!role) return;

    const inkId = currentMapPalette[role];
    const ink = INK_CATALOG[inkId];

    // Update header dot + current name
    const dot = cat.querySelector('.ink-category-dot') as HTMLElement | null;
    if (dot) dot.style.background = ink.hex;
    const cur = cat.querySelector('.ink-category-current');
    if (cur) cur.textContent = ink.name;

    // Update option active states
    cat.querySelectorAll('.ink-option').forEach(opt => {
      const optEl = opt as HTMLElement;
      opt.classList.toggle('active', optEl.dataset.inkId === inkId);
    });
  });
}

/* ── Palette persistence ─────────────────────────────────── */
function persistPalette(): void {
  sessionStorage.setItem('wud-palette', JSON.stringify({
    id: currentPaletteId,
    palette: currentMapPalette,
  }));
}

function restorePalette(map: maplibregl.Map): void {
  // URL hash takes priority
  const hash = window.location.hash.replace('#', '');
  const parts = hash.split('/');
  for (const part of parts) {
    if (part.startsWith('p:')) {
      const pVal = part.slice(2);
      if (pVal.startsWith('custom:')) {
        const inks = pVal.slice(7).split('-');
        if (inks.length === 5) {
          const [base, water, built, green, ink] = inks;
          if (INK_CATALOG[base] && INK_CATALOG[water] && INK_CATALOG[built] && INK_CATALOG[green] && INK_CATALOG[ink]) {
            currentMapPalette = { base, water, built, green, ink };
            currentPaletteId = 'custom';
            const derived = buildDerivedPalette(currentMapPalette);
            applyMapPalette(map, derived, currentMapPalette);
            updatePALETTEFromDerived(derived);
            updateLegendColors(derived);
            updateColorStrip(currentMapPalette);
            updateInkUI();
            return;
          }
        }
      } else {
        const preset = PALETTES.find(p => p.id === pVal);
        if (preset) {
          selectPreset(map, preset);
          return;
        }
      }
    }
  }

  // Fallback: sessionStorage
  const stored = sessionStorage.getItem('wud-palette');
  if (stored) {
    try {
      const { id, palette } = JSON.parse(stored);
      if (id && palette && palette.base && palette.water && palette.built && palette.green && palette.ink) {
        // Validate all ink IDs exist
        const allValid = [palette.base, palette.water, palette.built, palette.green, palette.ink]
          .every((inkId: string) => INK_CATALOG[inkId]);
        if (allValid) {
          currentMapPalette = palette;
          currentPaletteId = id;
          const derived = buildDerivedPalette(currentMapPalette);
          applyMapPalette(map, derived, currentMapPalette);
          updatePALETTEFromDerived(derived);
          updateLegendColors(derived);
          updateColorStrip(currentMapPalette);
          updateInkUI();
        }
      }
    } catch {
      // Ignore
    }
  }
}

/* ══════════════════════════════════════════════════════════════
   TOOL: ↓ DOWNLOAD
   ══════════════════════════════════════════════════════════════ */
function closeAllDropdowns() {
  document.querySelectorAll('.tb-dropdown-menu.open').forEach(el => el.classList.remove('open'));
}

function setupToolDownload(map: maplibregl.Map): void {
  const btn = document.getElementById('tool-download');
  const menu = document.getElementById('download-formats');
  if (!btn || !menu) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = menu.classList.contains('open');
    closeAllDropdowns();
    if (!isOpen) menu.classList.add('open');
  });

  // Format item clicks → go straight to export
  menu.querySelectorAll('.tb-dropdown-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      const format = (item as HTMLElement).dataset.format!;
      closeAllDropdowns();
      captureAndExport(map, format, 'download');
    });
  });

  // Close on click outside
  document.addEventListener('click', () => closeAllDropdowns());
}

/* (Export preview removed — download goes straight to capture) */

async function captureAndExport(map: maplibregl.Map, format: string, action: 'download' | 'copy'): Promise<void> {
  const resolutions: Record<string, { w: number; h: number }> = {
    feed: { w: 1080, h: 1080 },
    reel: { w: 1080, h: 1920 },
    poster: { w: 3600, h: 4800 },
  };

  const res = resolutions[format] || resolutions.feed;
  const exportSubtitle = document.getElementById('subtitle-text')?.textContent || '';

  showFlipToast('Generating...');

  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

  if (format === 'poster') {
    // For poster, use html2canvas on #page
    try {
      const html2canvas = (await import('html2canvas')).default;
      const page = document.getElementById('page')!;

      // Hide UI elements
      const hideEls = [
        document.getElementById('reg-mark'),
        document.getElementById('toolbar'),
        document.getElementById('touch-controls'),
        document.getElementById('flip-toast'),
        document.getElementById('download-formats'),
      ];
      hideEls.forEach(el => { if (el) el.style.display = 'none'; });

      // Set overlay to poster opacity
      setOverlayOpacity(0.90);
      await new Promise(r => setTimeout(r, 400));

      const canvas = await html2canvas(page, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#FFFFFF',
      });

      // Restore UI
      hideEls.forEach(el => { if (el) el.style.display = ''; });

      await exportCanvas(canvas, format, action, exportSubtitle);
    } catch (err) {
      showFlipToast('Export failed — try Feed or Reel');
      console.error('Poster export failed:', err);
    }
  } else {
    // Feed/Reel: offscreen canvas
    const canvas = document.createElement('canvas');
    canvas.width = res.w;
    canvas.height = res.h;
    const ctx = canvas.getContext('2d')!;

    // Draw map
    const mapCanvas = map.getCanvas();
    const targetRatio = res.w / res.h;
    const srcW = mapCanvas.width;
    const srcH = mapCanvas.height;
    const srcRatio = srcW / srcH;

    let cropX = 0, cropY = 0, cropW = srcW, cropH = srcH;
    if (srcRatio > targetRatio) {
      cropW = srcH * targetRatio;
      cropX = (srcW - cropW) / 2;
    } else {
      cropH = srcW / targetRatio;
      cropY = (srcH - cropH) / 2;
    }

    ctx.drawImage(mapCanvas, cropX, cropY, cropW, cropH, 0, 0, res.w, res.h);

    // Draw screenprint text
    const spColor = getComputedStyle(root).getPropertyValue('--sp-color').trim();
    const spShadow = getComputedStyle(root).getPropertyValue('--sp-shadow').trim();
    const l1 = document.getElementById('screenprint-l1')?.textContent || '';
    const l2 = document.getElementById('screenprint-l2')?.textContent || '';

    const fontSize = res.w * 0.14;
    ctx.font = `400 ${fontSize}px Anton`;
    ctx.textAlign = 'center';
    ctx.globalCompositeOperation = 'multiply';

    const cx = res.w / 2;
    const cy = format === 'reel' ? res.h * 0.33 : res.h / 2;

    // Shadow
    ctx.fillStyle = spShadow;
    ctx.globalAlpha = 0.9;
    ctx.fillText(l1, cx + 5, cy - fontSize * 0.1 + 4);
    ctx.fillText(l2, cx + 5, cy + fontSize * 0.88 + 4);

    // Main text
    ctx.fillStyle = spColor;
    ctx.globalAlpha = 0.9;
    ctx.fillText(l1, cx, cy - fontSize * 0.1);
    ctx.fillText(l2, cx, cy + fontSize * 0.88);

    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;

    // Subtitle
    if (exportSubtitle) {
      ctx.font = `italic ${fontSize * 0.16}px 'Instrument Serif', serif`;
      ctx.fillStyle = spColor;
      ctx.globalAlpha = 0.6;
      ctx.fillText(exportSubtitle, cx, cy + fontSize * 1.6);
      ctx.globalAlpha = 1;
    }

    // Credit line
    ctx.font = `400 ${res.w * 0.009}px 'Space Mono', monospace`;
    ctx.fillStyle = '#88898A';
    ctx.globalAlpha = 0.5;
    ctx.textAlign = 'right';
    ctx.fillText('Gerardo Ezequiel · upside-down.vercel.app', res.w - 20, res.h - 20);
    ctx.globalAlpha = 1;

    // Check toggles
    const toggles = document.getElementById('export-toggles');
    if (toggles) {
      const compassOn = (toggles.querySelector('[data-toggle="compass"]') as HTMLInputElement)?.checked;
      const coordsOn = (toggles.querySelector('[data-toggle="coords"]') as HTMLInputElement)?.checked;
      const urlOn = (toggles.querySelector('[data-toggle="url"]') as HTMLInputElement)?.checked;

      if (coordsOn) {
        const ctr = map.getCenter();
        const coordText = `${Math.abs(ctr.lat).toFixed(2)}°${ctr.lat >= 0 ? 'N' : 'S'} / ${Math.abs(ctr.lng).toFixed(2)}°${ctr.lng >= 0 ? 'E' : 'W'}`;
        ctx.font = `400 ${res.w * 0.007}px 'Space Mono', monospace`;
        ctx.fillStyle = '#88898A';
        ctx.globalAlpha = 0.5;
        ctx.textAlign = 'left';
        ctx.fillText(coordText, 20, res.h - 20);
        ctx.globalAlpha = 1;
      }

      if (urlOn) {
        ctx.font = `400 ${res.w * 0.007}px 'Space Mono', monospace`;
        ctx.fillStyle = '#88898A';
        ctx.globalAlpha = 0.5;
        ctx.textAlign = 'center';
        ctx.fillText('upside-down.vercel.app', res.w / 2, res.h - 20);
        ctx.globalAlpha = 1;
      }
    }

    await exportCanvas(canvas, format, action, exportSubtitle);
  }

  setMode('explore', map);
}

async function exportCanvas(canvas: HTMLCanvasElement, format: string, action: 'download' | 'copy', _subtitle: string): Promise<void> {
  const citySlug = (currentCityName || 'world').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const paletteSuffix = currentPaletteId !== 'classic' ? `-${currentPaletteId}` : '';
  const filename = `upside-down-${format}-${citySlug}${paletteSuffix}.png`;

  if (action === 'download') {
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();

    const toasts: Record<string, string> = {
      feed: 'Ready for the grid',
      reel: 'Swipe up on that',
      poster: 'Print it. Frame it. Flip someone\'s world.',
    };
    setTimeout(() => showFlipToast(toasts[format] || 'Downloaded'), 500);
  }

  if (action === 'copy') {
    try {
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob(b => resolve(b!), 'image/png');
      });
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      setTimeout(() => showFlipToast('Copied — paste it anywhere'), 500);
    } catch {
      // Fallback to download
      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setTimeout(() => showFlipToast('Downloaded (copy unavailable)'), 500);
    }
  }
}

/* ══════════════════════════════════════════════════════════════
   TOOL: ⤴ SHARE
   ══════════════════════════════════════════════════════════════ */
function setupToolShare(_map: maplibregl.Map): void {
  const btn = document.getElementById('tool-share');
  const menu = document.getElementById('share-menu');
  if (!btn || !menu) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = menu.classList.contains('open');
    closeAllDropdowns();
    if (!isOpen) menu.classList.add('open');
  });

  menu.querySelectorAll('.tb-dropdown-item').forEach(item => {
    item.addEventListener('click', async (e) => {
      e.stopPropagation();
      closeAllDropdowns();

      const platform = (item as HTMLElement).dataset.share;
      const url = encodeURIComponent(window.location.href);
      const text = encodeURIComponent("I flipped the world upside down. 🌍⬇️");
      const title = encodeURIComponent("Upside Down — You've Been Holding the Map Wrong");

      if (platform === 'linkedin') {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank', 'width=600,height=500');
      } else if (platform === 'x') {
        window.open(`https://x.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'width=600,height=400');
      } else if (platform === 'copy') {
        try {
          await navigator.clipboard.writeText(window.location.href);
          showFlipToast('Link copied');
        } catch {
          showFlipToast('Copy the URL from your browser');
        }
      }
    });
  });
}

/* ══════════════════════════════════════════════════════════════
   SHAREABLE URLs
   ══════════════════════════════════════════════════════════════ */
const COLOR_NAMES: Record<string, { color: string; shadow: string }> = {
  yellow: { color: '#FFE627', shadow: '#FF48B0' },
  pink:   { color: '#FF48B0', shadow: '#C4305C' },
  teal:   { color: '#00838A', shadow: '#004D52' },
  blue:   { color: '#0078BF', shadow: '#004A75' },
  black:  { color: '#000000', shadow: '#333333' },
};

function updateShareableHash(): void {
  const hash = window.location.hash;
  // MapLibre hash format: #zoom/lat/lng
  // We append: /bearing/t:TITLE/c:COLOR
  const parts = hash.replace('#', '').split('/');

  // Keep first 3 parts (zoom/lat/lng)
  const base = parts.slice(0, 3).join('/');

  const bearing = orientation === 'upside-down' ? 180 : 0;
  let newHash = `#${base}/${bearing}`;

  if (hasCustomTitle) {
    const l1 = document.getElementById('screenprint-l1')?.textContent || '';
    const l2 = document.getElementById('screenprint-l2')?.textContent || '';
    const title = l2 ? `${l1} ${l2}`.trim() : l1.trim();
    if (title && title !== 'UPSIDE DOWN') {
      newHash += `/t:${encodeURIComponent(title).replace(/%20/g, '+')}`;
    }
  }

  // Text color — store as hex (without #) for dynamic palette pairings
  const currentColor = getComputedStyle(root).getPropertyValue('--sp-color').trim();
  const defaultPairings = buildTextPairings(currentMapPalette);
  const isDefault = defaultPairings.length > 0 && defaultPairings[0].color.toLowerCase() === currentColor.toLowerCase();
  if (!isDefault && currentColor) {
    const currentShadow = getComputedStyle(root).getPropertyValue('--sp-shadow').trim();
    newHash += `/c:${currentColor.slice(1)}.${currentShadow.slice(1)}`;
  }

  // Palette param
  if (currentPaletteId !== 'classic') {
    if (currentPaletteId === 'custom') {
      const { base, water, built, green, ink } = currentMapPalette;
      newHash += `/p:custom:${base}-${water}-${built}-${green}-${ink}`;
    } else {
      newHash += `/p:${currentPaletteId}`;
    }
  }

  history.replaceState(null, '', newHash);
}

function parseShareableHash(): { title?: string; colorName?: string } {
  const hash = window.location.hash.replace('#', '');
  const parts = hash.split('/');

  let title: string | undefined;
  let colorName: string | undefined;

  for (const part of parts) {
    if (part.startsWith('t:')) {
      title = decodeURIComponent(part.slice(2).replace(/\+/g, ' '));
    }
    if (part.startsWith('c:')) {
      colorName = part.slice(2);
    }
  }

  return { title, colorName };
}

function applyShareableParams(): void {
  const { title, colorName } = parseShareableHash();

  if (title) {
    updateScreenprintText(title);
    hasCustomTitle = true;
  }

  if (colorName) {
    let color: string | undefined;
    let shadow: string | undefined;

    // New format: hex.hex (e.g. "FF48B0.C4305C")
    if (colorName.includes('.')) {
      const [c, s] = colorName.split('.');
      color = `#${c}`;
      shadow = `#${s}`;
    }
    // Legacy format: named color
    else if (COLOR_NAMES[colorName]) {
      color = COLOR_NAMES[colorName].color;
      shadow = COLOR_NAMES[colorName].shadow;
    }

    if (color && shadow) {
      root.style.setProperty('--sp-color', color);
      root.style.setProperty('--sp-shadow', shadow);

      // Update color strip active state
      document.querySelectorAll('#color-strip .color-dot').forEach(dot => {
        const el = dot as HTMLElement;
        dot.classList.toggle('active', el.dataset.color?.toLowerCase() === color!.toLowerCase());
      });
    }
  }

  // Restore session title if no URL title
  if (!title) {
    const stored = sessionStorage.getItem('wud-custom-title');
    if (stored) {
      try {
        const { l1, l2 } = JSON.parse(stored);
        const spL1 = document.getElementById('screenprint-l1');
        const spL2 = document.getElementById('screenprint-l2');
        if (spL1 && spL2 && l1) {
          spL1.textContent = l1;
          spL2.textContent = l2;
          hasCustomTitle = true;
        }
      } catch {
        // Ignore
      }
    }
  }
}

/* ══════════════════════════════════════════════════════════════
   INIT
   ══════════════════════════════════════════════════════════════ */
async function init() {
  const res = await fetch("/style.json");
  const baseStyle = (await res.json()) as maplibregl.StyleSpecification;
  const style = recolorStyle(baseStyle);

  const map = new maplibregl.Map({
    container: "map",
    style,
    center: [-0.128, 51.507],
    zoom: 11,
    bearing: 180,
    pitch: 0,
    minZoom: 1,
    maxZoom: 18,
    maxTileCacheSize: 200,
    attributionControl: {},
    hash: true,
    preserveDrawingBuffer: true, // needed for canvas export
  });

  map.dragRotate.disable();

  map.on('moveend', () => {
    if (!bearingLocked) return;
    const expected = orientation === 'upside-down' ? 180 : 0;
    if (orientation !== 'mirrored' && Math.abs(map.getBearing() - expected) > 0.1) {
      map.easeTo({ bearing: expected, duration: 200 });
    }
  });

  // ── Map interaction → enter explore mode ──
  map.on('movestart', () => {
    if (currentMode === 'poster') setMode('explore', map);
    resetIdleTimer(map);
  });

  map.on('zoomstart', () => {
    if (currentMode === 'poster') setMode('explore', map);
    resetIdleTimer(map);
  });

  // Any interaction resets idle
  ['mousemove', 'touchstart', 'wheel', 'keydown'].forEach(evt => {
    document.addEventListener(evt, () => resetIdleTimer(map), { passive: true });
  });

  // ── Screenprint overlay click → toggle poster/explore ──
  const spOverlay = document.getElementById('screenprint-overlay');
  spOverlay?.addEventListener('click', () => {
    if (currentMode === 'poster') {
      setMode('explore', map);
    }
  });

  map.on('load', () => {
    updateScaleBar(map);
    updateCoords(map);
    updateCityTitle(map);
    setupGeocoder(map);
    setupFlip(map);
    addGraticule(map);
    applyRisoMisregistration(map);
    setupTools(map);

    // Apply shareable URL params
    applyShareableParams();

    // Start in poster mode
    setMode('poster', map);
    // Need to re-set since setMode checks prev === current
    currentMode = 'poster';
    root.style.setProperty('--overlay-opacity', '0.90');
    spOverlay?.classList.add('poster-mode');

    // ── Animated subtitle ──
    const subtitleEl = document.getElementById('subtitle');
    const subtitleText = document.getElementById('subtitle-text');

    const subtitlePhrases = [
      'an exercise in unlearning north',
      'north is a decision, not a fact',
      'every map is a portrait of power',
      'the first photo of earth had south on top',
      'orientation means east, not north',
      'there is no up in space',
      'you\'ve been holding the map wrong',
      'cartography is never neutral',
      'who decided north was up?',
      'the earth doesn\'t care which way you hold it',
      'south is just north with confidence',
      'tap the title to search a place',
    ];

    let subtitleCancelled = false;

    async function typeSubtitle(el: HTMLElement, text: string, speed = 35): Promise<void> {
      el.textContent = '';
      for (let i = 0; i < text.length; i++) {
        if (subtitleCancelled) return;
        el.textContent += text[i];
        await new Promise(r => setTimeout(r, speed));
      }
    }

    async function deleteSubtitle(el: HTMLElement, speed = 20): Promise<void> {
      const text = el.textContent || '';
      for (let i = text.length; i > 0; i--) {
        if (subtitleCancelled) return;
        el.textContent = text.substring(0, i - 1);
        await new Promise(r => setTimeout(r, speed));
      }
    }

    (async () => {
      if (!subtitleEl || !subtitleText) return;
      await new Promise(r => setTimeout(r, 8000));

      let phraseIdx = 1;
      while (!subtitleCancelled) {
        subtitleEl.classList.add('typing');
        await deleteSubtitle(subtitleText);
        await new Promise(r => setTimeout(r, 400));
        if (subtitleCancelled) return;
        await typeSubtitle(subtitleText, subtitlePhrases[phraseIdx]);
        subtitleEl.classList.remove('typing');
        await new Promise(r => setTimeout(r, 6000));
        if (subtitleCancelled) return;
        phraseIdx = (phraseIdx + 1) % subtitlePhrases.length;
      }
    })();
  });

  // ── Dymaxion crossfade ──
  const mapFrame = document.getElementById('map-frame')!;
  const mapEl = document.getElementById('map')!;
  const dymaxionLabel = document.getElementById('dymaxion-label');
  const gratLabels = document.getElementById('grat-edge-labels');

  initDymaxion(mapFrame).then(dymaxion => {
    function updateDymaxionTransition() {
      const zoom = map.getZoom();
      const t = Math.max(0, Math.min(1, 3 - zoom));
      dymaxion.show(t);
      mapEl.style.opacity = String(1 - t);
      if (gratLabels) gratLabels.style.opacity = String(1 - t);
      if (dymaxionLabel) dymaxionLabel.classList.toggle('visible', t > 0.9);
    }
    map.on('zoom', updateDymaxionTransition);
    window.addEventListener('resize', () => dymaxion.resize());
  });

  map.on('zoom', () => {
    updateScaleBar(map);
    updateCoords(map);
  });

  map.on('moveend', () => {
    updateScaleBar(map);
    updateCoords(map);
    updateCityTitle(map);
  });

  map.on('move', () => {
    updateCoords(map);
  });
}

init();
