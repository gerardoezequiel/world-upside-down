import maplibregl from "maplibre-gl";
import { Protocol } from "pmtiles";

/* ── PMTiles protocol ─────────────────────────────────────── */
const protocol = new Protocol();
maplibregl.addProtocol("pmtiles", protocol.tile);

/* ── Risograph palette (London-Flipped inspired) ──────────── */
const PALETTE = {
  // Base tones
  bg:        "#D6D1C9",   // ocean / background — warm grey
  earth:     "#EDE8E0",   // land mass — cream paper
  // Urban fabric
  buildings: "#9EC4D4",   // light blue — the signature riso-blue
  urban:     "#C7DCE6",   // urban area landcover tint
  // Parks & green → coral/salmon (the "flip")
  park:      "#E87461",   // coral — parks, forests, cemeteries
  parkAlt:   "#F09E8C",   // lighter coral for secondary green
  // Water → olive/tan (the "flip")
  water:     "#9B8E7E",   // olive-tan river/lake fill
  waterLine: "#8B7D6B",   // darker for stream/river lines
  // Infrastructure
  road:      "#1A1A2E",   // dark navy
  roadMajor: "#2A2A3C",   // slightly lighter navy
  roadMinor: "#6E6E80",   // mid grey for minor roads
  roadCas:   "#CFCCC6",   // casing — warm light grey
  rail:      "#1A1A2E",   // rail lines
  // Boundaries
  boundary:  "#C9A0A0",   // muted rose for borders
  // Text
  label:     "#1A1A2E",   // dark navy labels
  labelHalo: "#EDE8E0",   // cream halo
  // Landcover
  grass:     "#DDE8D0",   // very muted sage (low-zoom landcover)
  farmland:  "#E8E4D0",   // warm beige
  scrub:     "#D8DEC8",   // light sage
  barren:    "#E8E2D0",   // sandy
  glacier:   "#F0F0F0",   // near white
  // Special
  hospital:  "#F0D0D0",   // light rose
  school:    "#D8D0E0",   // light lavender
  industrial:"#D0D4D8",   // blue-grey
  beach:     "#F0E8D0",   // sandy
  zoo:       "#F0C8B0",   // warm peach
  aerodrome: "#D0D0D0",   // neutral grey
  pier:      "#D8D4CC",   // warm grey
  pedestrian:"#E0DCD4",   // warm off-white
  runway:    "#B8B4AC",   // medium grey
};

/* ── Color replacement map ────────────────────────────────── */
// Maps original style.json colors → risograph palette
const COLOR_MAP: Record<string, string> = {
  // Background & earth
  "#cccccc": PALETTE.bg,
  "#e2dfda": PALETTE.earth,
  // Buildings
  "#cccccc_buildings": PALETTE.buildings, // handled specially
  // Water
  "#80deea": PALETTE.water,
  "#b4d4e1": PALETTE.waterLine,
  // Parks (greens → corals)
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

    // Background
    if (id === "background" && "paint" in layer) {
      (layer as any).paint["background-color"] = PALETTE.bg;
      continue;
    }

    // Earth
    if (id === "earth" && "paint" in layer) {
      (layer as any).paint["fill-color"] = PALETTE.earth;
      continue;
    }

    // Buildings → signature riso-blue with zoom-dependent opacity + outline
    if (id === "buildings" && "paint" in layer) {
      (layer as any).paint["fill-color"] = PALETTE.buildings;
      (layer as any).paint["fill-opacity"] = [
        "interpolate", ["linear"], ["zoom"],
        12, 0.4,
        14, 0.65,
        16, 0.75,
      ];
      (layer as any).paint["fill-outline-color"] = "rgba(122, 172, 194, 0.35)";
      continue;
    }

    // Water fill
    if (id === "water" && "paint" in layer) {
      (layer as any).paint["fill-color"] = PALETTE.water;
      continue;
    }

    // Water streams & rivers
    if ((id === "water_stream" || id === "water_river") && "paint" in layer) {
      (layer as any).paint["line-color"] = PALETTE.waterLine;
      continue;
    }

    // Parks / green spaces → coral/salmon
    if (id.startsWith("landuse_park") && "paint" in layer) {
      (layer as any).paint["fill-color"] = PALETTE.park;
      (layer as any).paint["fill-opacity"] = 0.7;
      continue;
    }
    if (id === "landuse_urban_green" && "paint" in layer) {
      (layer as any).paint["fill-color"] = PALETTE.parkAlt;
      continue;
    }

    // Hospital, school, industrial, etc.
    if (id === "landuse_hospital" && "paint" in layer) {
      (layer as any).paint["fill-color"] = PALETTE.hospital;
      continue;
    }
    if (id === "landuse_school" && "paint" in layer) {
      (layer as any).paint["fill-color"] = PALETTE.school;
      continue;
    }
    if (id === "landuse_industrial" && "paint" in layer) {
      (layer as any).paint["fill-color"] = PALETTE.industrial;
      continue;
    }
    if (id === "landuse_beach" && "paint" in layer) {
      (layer as any).paint["fill-color"] = PALETTE.beach;
      continue;
    }
    if (id === "landuse_zoo" && "paint" in layer) {
      (layer as any).paint["fill-color"] = PALETTE.zoo;
      continue;
    }
    if (id === "landuse_aerodrome" && "paint" in layer) {
      (layer as any).paint["fill-color"] = PALETTE.aerodrome;
      continue;
    }
    if (id === "landuse_pedestrian" && "paint" in layer) {
      (layer as any).paint["fill-color"] = PALETTE.pedestrian;
      continue;
    }
    if (id === "landuse_pier" && "paint" in layer) {
      (layer as any).paint["fill-color"] = PALETTE.pier;
      continue;
    }
    if (id === "landuse_runway" && "paint" in layer) {
      (layer as any).paint["fill-color"] = PALETTE.runway;
      continue;
    }

    // Landcover (low zoom)
    if (id === "landcover" && "paint" in layer) {
      (layer as any).paint["fill-color"] = [
        "match", ["get", "kind"],
        "grassland",   PALETTE.grass,
        "barren",      PALETTE.barren,
        "urban_area",  PALETTE.urban,
        "farmland",    PALETTE.farmland,
        "glacier",     PALETTE.glacier,
        "scrub",       PALETTE.scrub,
        PALETTE.grass,
      ];
      continue;
    }

    // Roads — casing layers
    if (id.includes("_casing") && "paint" in layer) {
      const p = (layer as any).paint;
      if (p["line-color"]) {
        if (id.includes("highway")) {
          p["line-color"] = PALETTE.roadCas;
        } else if (id.includes("major")) {
          p["line-color"] = PALETTE.roadCas;
        } else {
          p["line-color"] = PALETTE.roadCas;
        }
      }
      continue;
    }

    // Roads — fill layers
    if (id.startsWith("roads_") && !id.includes("label") && !id.includes("shield") && !id.includes("oneway") && "paint" in layer) {
      const p = (layer as any).paint;
      if (p["line-color"]) {
        if (id.includes("highway")) {
          p["line-color"] = PALETTE.roadMajor;
        } else if (id.includes("major")) {
          p["line-color"] = PALETTE.roadMajor;
        } else if (id.includes("minor") || id.includes("other") || id.includes("link")) {
          p["line-color"] = PALETTE.roadMinor;
        } else if (id.includes("rail")) {
          p["line-color"] = PALETTE.rail;
        } else if (id.includes("pier")) {
          p["line-color"] = PALETTE.pier;
        } else if (id.includes("runway") || id.includes("taxiway")) {
          p["line-color"] = PALETTE.runway;
        }
      }
      continue;
    }

    // Boundaries
    if (id.startsWith("boundaries") && "paint" in layer) {
      (layer as any).paint["line-color"] = PALETTE.boundary;
      continue;
    }

    // POIs — strip icons, text-only with risograph palette colors
    if (id === "pois") {
      const l = layer as any;
      // Remove sprite icons entirely — text only
      delete l.layout["icon-image"];
      l.layout["text-offset"] = [0, 0];
      l.layout["text-variable-anchor"] = ["center", "left", "right", "top", "bottom"];
      l.layout["text-size"] = ["interpolate", ["linear"], ["zoom"], 14, 9, 18, 13];

      // Palette-matched POI text colors
      l.paint["text-color"] = [
        "match", ["get", "kind"],
        // Nature → coral (matching parks)
        "park", PALETTE.park, "forest", PALETTE.park, "garden", PALETTE.park,
        "beach", PALETTE.park, "zoo", PALETTE.zoo, "marina", PALETTE.waterLine,
        // Transit → dark navy
        "station", PALETTE.road, "bus_stop", PALETTE.roadMinor,
        "ferry_terminal", PALETTE.waterLine, "aerodrome", PALETTE.roadMinor,
        // Civic → muted rose (matching boundaries)
        "university", PALETTE.boundary, "library", PALETTE.boundary,
        "school", PALETTE.boundary, "townhall", PALETTE.boundary,
        "post_office", PALETTE.boundary, "museum", PALETTE.boundary,
        "theatre", PALETTE.boundary, "artwork", PALETTE.boundary,
        // Default
        PALETTE.roadMinor,
      ];
      l.paint["text-halo-color"] = PALETTE.labelHalo;
      l.paint["text-halo-width"] = 1.2;
      continue;
    }

    // Places locality — strip townspot/capital dot icons
    if (id === "places_locality") {
      const l = layer as any;
      delete l.layout["icon-image"];
      continue;
    }

    // Road shields — hide (too noisy for this aesthetic)
    if (id === "roads_shields") {
      (layer as any).layout = { visibility: "none" };
      continue;
    }

    // Labels — text color + halo
    if ("paint" in layer) {
      const p = (layer as any).paint;
      if (p["text-color"]) {
        p["text-color"] = PALETTE.label;
      }
      if (p["text-halo-color"]) {
        p["text-halo-color"] = PALETTE.labelHalo;
      }
    }
  }

  return s;
}

/* ── Scale bar configuration ──────────────────────────────── */
interface ScaleConfig {
  total: number;
  detail: number;
  dStep: number;
  mStep: number;
}

const scaleConfigs: ScaleConfig[] = [
  { total: 100,      detail: 10,     dStep: 2,     mStep: 20 },
  { total: 200,      detail: 20,     dStep: 5,     mStep: 50 },
  { total: 500,      detail: 50,     dStep: 10,    mStep: 100 },
  { total: 1000,     detail: 100,    dStep: 20,    mStep: 200 },
  { total: 2000,     detail: 200,    dStep: 50,    mStep: 500 },
  { total: 5000,     detail: 500,    dStep: 100,   mStep: 1000 },
  { total: 10000,    detail: 1000,   dStep: 200,   mStep: 2000 },
  { total: 20000,    detail: 2000,   dStep: 500,   mStep: 5000 },
  { total: 50000,    detail: 5000,   dStep: 1000,  mStep: 10000 },
  { total: 100000,   detail: 10000,  dStep: 2000,  mStep: 20000 },
  { total: 200000,   detail: 20000,  dStep: 5000,  mStep: 50000 },
  { total: 500000,   detail: 50000,  dStep: 10000, mStep: 100000 },
  { total: 1000000,  detail: 100000, dStep: 20000, mStep: 200000 },
  { total: 2000000,  detail: 200000, dStep: 50000, mStep: 500000 },
  { total: 5000000,  detail: 500000, dStep: 100000,mStep: 1000000 },
];

const niceRatios = [
  100, 200, 250, 500, 1000, 2000, 2500, 5000, 10000,
  15000, 20000, 25000, 50000, 100000, 150000, 200000,
  250000, 500000, 1000000,
];

/* ── Dynamic scale bar renderer ──────────────────────────── */
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

  // Ensure minimum readable width at low zoom levels
  if (totalPx < 80) {
    // Pick a larger config that yields at least 80px
    for (const c of scaleConfigs) {
      const px = c.total / mpp;
      if (px >= 80 && px <= 300) { cfg = c; totalPx = px; break; }
    }
    // Fallback: just use the largest config
    if (totalPx < 80) {
      cfg = scaleConfigs[scaleConfigs.length - 1];
      totalPx = cfg.total / mpp;
    }
  }

  const ink = '#E87461';
  const svgH = 28;
  const baseline = svgH - 4;
  const tickMajor = 12;
  const tickMinor = 6;
  const pad = 2;

  let svg = `<svg width="${Math.ceil(totalPx + pad + 4)}" height="${svgH}" viewBox="0 0 ${Math.ceil(totalPx + pad + 4)} ${svgH}" xmlns="http://www.w3.org/2000/svg">`;

  // Baseline
  svg += `<line x1="${pad}" y1="${baseline}" x2="${pad + totalPx}" y2="${baseline}" stroke="${ink}" stroke-width="1"/>`;

  interface Tick { px: number; label: string; isMajor: boolean; }
  const ticks: Tick[] = [];

  // Detail section
  const useKm = cfg.total >= 2000;
  for (let m = 0; m <= cfg.detail; m += cfg.dStep) {
    const px = pad + (m / cfg.total) * totalPx;
    const isMajor = m === 0 || m === cfg.detail;
    let label = '';
    if (m === 0) label = '0';
    else if (isMajor) label = useKm ? String(m / 1000) : String(m);
    ticks.push({ px, label, isMajor });
  }

  // Major section
  for (let m = cfg.detail + cfg.mStep; m <= cfg.total; m += cfg.mStep) {
    const px = pad + (m / cfg.total) * totalPx;
    const label = useKm ? String(m / 1000) : String(m);
    ticks.push({ px, label, isMajor: true });
  }

  // End tick
  const endPx = pad + totalPx;
  const endInList = ticks.some((t) => Math.abs(t.px - endPx) < 1);
  if (!endInList) {
    ticks.push({
      px: endPx,
      label: useKm ? String(cfg.total / 1000) : String(cfg.total),
      isMajor: true,
    });
  }

  // Draw ticks
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

  // Numerical ratio (1:X)
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

/* ── Reverse geocode for city name ───────────────────────── */
let geocodeTimeout: ReturnType<typeof setTimeout> | null = null;

function updateCityTitle(map: maplibregl.Map): void {
  if (geocodeTimeout) clearTimeout(geocodeTimeout);
  geocodeTimeout = setTimeout(async () => {
    const ctr = map.getCenter();
    const z = map.getZoom();
    const titleEl = document.getElementById('city-title');
    if (!titleEl) return;

    // Only show place names at zoom >= 5
    if (z < 5) {
      titleEl.textContent = 'Upside Down';
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
      }
    } catch {
      // Silently fail — keep last known name
    }
  }, 800);
}

/* ── Orientation state ────────────────────────────────────── */
type Orientation = 'upside-down' | 'normal' | 'mirrored';
let orientation: Orientation = 'upside-down';

const toastMessages: Record<Orientation, string[]> = {
  'normal': [
    "Wait... this feels wrong",
    "Oh no, not this again",
    "The boring way up",
    "How conventional of you",
    "You've been conditioned",
    "This is just a convention, you know",
    "North is a social construct",
    "Comfortable? That's the problem",
    "Welcome back to the Matrix",
    "Your brain just sighed with relief",
    "Plot twist: this is the weird one",
    "Congratulations, you're normal again",
  ],
  'upside-down': [
    "Ah, much better",
    "Welcome back",
    "Now we're talking",
    "Home sweet upside down",
    "This is the real world",
    "Your GPS is confused",
    "South is the new up",
    "Wait, where's my country?",
    "Earth has no opinion on the matter",
    "Suddenly everything is unfamiliar",
    "Try finding your house now",
    "There is no up in space",
  ],
  'mirrored': [
    "Through the looking glass",
    "Everything is backwards now",
    "Mirror, mirror on the wall...",
    "East is west, west is east",
    "The sun rises in the west now",
    "Your mental map just broke",
    "Try giving someone directions now",
    "Left is right, right is wrong",
    "Good luck navigating home",
    "Your brain: does not compute",
  ],
};

function showFlipToast(text: string): void {
  const toast = document.getElementById('flip-toast');
  if (!toast) return;
  toast.textContent = text;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

function applyOrientation(map: maplibregl.Map, target: Orientation): void {
  if (target === orientation) return;
  const prev = orientation;
  orientation = target;

  const title = document.getElementById('city-title');
  const sub = document.querySelector('.subtitle') as HTMLElement | null;
  const arrow = document.getElementById('north-arrow');
  const mapEl = document.getElementById('map');

  // Handle bearing changes (upside-down vs normal/mirrored)
  const needsBearingChange =
    (prev === 'upside-down' && target !== 'upside-down') ||
    (prev !== 'upside-down' && target === 'upside-down');

  if (needsBearingChange) {
    const targetBearing = target === 'upside-down' ? 180 : 0;
    map.dragRotate.enable();
    map.easeTo({
      bearing: targetBearing,
      duration: 1200,
      easing: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
    });
    setTimeout(() => map.dragRotate.disable(), 1300);
  }

  // If coming from mirror or going to mirror, handle the CSS mirror
  if (prev === 'mirrored' && target !== 'mirrored') {
    mapEl?.classList.remove('mirrored');
  }
  if (target === 'mirrored' && prev !== 'mirrored') {
    // If we were upside-down, first reset bearing to 0
    if (prev === 'upside-down') {
      map.dragRotate.enable();
      map.easeTo({
        bearing: 0,
        duration: 1200,
        easing: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
      });
      setTimeout(() => {
        map.dragRotate.disable();
        mapEl?.classList.add('mirrored');
      }, 1200);
    } else {
      mapEl?.classList.add('mirrored');
    }
  }

  // Title classes
  if (title) {
    title.classList.remove('normal', 'mirrored');
    if (target === 'normal') title.classList.add('normal');
    else if (target === 'mirrored') title.classList.add('mirrored');
    // default (upside-down) has no extra class → CSS rotates 180
  }

  // Subtitle
  if (sub) {
    if (target === 'upside-down') sub.style.transform = 'rotate(180deg)';
    else if (target === 'mirrored') sub.style.transform = 'scaleX(-1)';
    else sub.style.transform = 'rotate(0deg)';
  }

  // North arrow
  if (arrow) {
    arrow.classList.toggle('flipped', target === 'normal' || target === 'mirrored');
  }

  // Toast
  const msgs = toastMessages[target];
  showFlipToast(msgs[Math.floor(Math.random() * msgs.length)]);

  // Hide hint
  document.getElementById('flip-hint')?.classList.remove('visible');
}

function setupFlip(map: maplibregl.Map): void {
  // Show hints after a short delay (persistent on desktop until first key press)
  const flipHint = document.getElementById('flip-hint');
  setTimeout(() => {
    flipHint?.classList.add('visible');
  }, 2000);

  // Show mobile flip buttons after a short delay
  setTimeout(() => {
    document.getElementById('touch-controls')?.classList.add('visible');
  }, 2000);

  document.addEventListener('keydown', (e) => {
    if ((e.target as HTMLElement).tagName === 'INPUT') return;

    switch (e.key) {
      case 'ArrowUp':
        applyOrientation(map, 'normal');
        break;
      case 'ArrowDown':
        applyOrientation(map, 'upside-down');
        break;
      case 'ArrowRight':
        applyOrientation(map, 'mirrored');
        break;
      case 'ArrowLeft':
        applyOrientation(map, 'normal');
        break;
      default:
        return;
    }
    e.preventDefault();
    // Hide hint after first arrow key use
    flipHint?.classList.remove('visible');
  });

  // ── Mobile flip buttons ──
  function updateFlipButtons() {
    document.querySelectorAll('.flip-btn').forEach(btn => {
      const orient = (btn as HTMLElement).dataset.orient as Orientation;
      // Flip the arrow icon when its orientation is active
      btn.classList.toggle('flipped', orient === orientation);
    });
  }

  document.querySelectorAll('.flip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const orient = (btn as HTMLElement).dataset.orient as Orientation;
      if (orient) {
        applyOrientation(map, orient);
        updateFlipButtons();
      }
    });
  });

  // Set initial state
  updateFlipButtons();
}

/* ── Geocoder search ─────────────────────────────────────── */
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

  // Click title → open search
  titleEl.addEventListener('click', openGeocoder);

  // Escape → close
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeGeocoder();
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (geocoderEl.classList.contains('open') &&
        !geocoderEl.contains(e.target as Node) &&
        e.target !== titleEl) {
      closeGeocoder();
    }
  });

  // Search on typing (debounced)
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

            // Fly to location
            if (bbox) {
              const sw: [number, number] = [parseFloat(bbox[2]), parseFloat(bbox[0])];
              const ne: [number, number] = [parseFloat(bbox[3]), parseFloat(bbox[1])];
              map.fitBounds([sw, ne], {
                bearing: orientation === 'upside-down' ? 180 : 0,
                padding: 60,
                duration: 1800,
                maxZoom: 14,
              });
            } else {
              map.flyTo({
                center: [lon, lat],
                zoom: 12,
                bearing: orientation === 'upside-down' ? 180 : 0,
                duration: 1800,
              });
            }

            // Update title to place name
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

  // Enter key → select first result
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const first = resultsEl.querySelector('.geocoder-result') as HTMLElement | null;
      if (first) first.click();
    }
  });
}

/* ── Dynamic Graticule ────────────────────────────────────── */
function addGraticule(map: maplibregl.Map): void {
  const GRAT_COLOR = 'rgba(107, 168, 189, 0.55)';  // light blue, OS-style
  const LABEL_COLOR = '#5A9BB0';

  function getInterval(zoom: number): number {
    if (zoom >= 10) return 1;
    if (zoom >= 7) return 2;
    if (zoom >= 5) return 5;
    if (zoom >= 3) return 10;
    if (zoom >= 2) return 15;
    return 30;
  }

  function buildGraticuleGeoJSON(interval: number): GeoJSON.FeatureCollection {
    const features: GeoJSON.Feature[] = [];

    // Meridians (longitude lines)
    for (let lon = -180; lon <= 180; lon += interval) {
      const coords: [number, number][] = [];
      for (let lat = -85; lat <= 85; lat += 2) {
        coords.push([lon, lat]);
      }
      features.push({
        type: 'Feature',
        properties: { type: 'line' },
        geometry: { type: 'LineString', coordinates: coords },
      });
    }

    // Parallels (latitude lines)
    for (let lat = -80; lat <= 80; lat += interval) {
      const coords: [number, number][] = [];
      for (let lon = -180; lon <= 180; lon += 2) {
        coords.push([lon, lat]);
      }
      features.push({
        type: 'Feature',
        properties: { type: 'line' },
        geometry: { type: 'LineString', coordinates: coords },
      });
    }

    return { type: 'FeatureCollection', features };
  }

  function buildLabelGeoJSON(interval: number): GeoJSON.FeatureCollection {
    const features: GeoJSON.Feature[] = [];

    // Latitude labels — placed at right edge of view
    for (let lat = -80; lat <= 80; lat += interval) {
      if (lat === 0) {
        features.push({
          type: 'Feature',
          properties: { label: '0° Eq' },
          geometry: { type: 'Point', coordinates: [0, 0] },
        });
      } else {
        const dir = lat > 0 ? 'N' : 'S';
        features.push({
          type: 'Feature',
          properties: { label: `${Math.abs(lat)}°${dir}` },
          geometry: { type: 'Point', coordinates: [0, lat] },
        });
      }
    }

    // Longitude labels — placed at equator
    for (let lon = -180; lon <= 180; lon += interval) {
      if (lon === 0) continue; // skip duplicate at equator
      const dir = lon > 0 ? 'E' : 'W';
      features.push({
        type: 'Feature',
        properties: { label: `${Math.abs(lon)}°${dir}` },
        geometry: { type: 'Point', coordinates: [lon, 0] },
      });
    }

    return { type: 'FeatureCollection', features };
  }

  let currentInterval = getInterval(map.getZoom());

  // Add source and layers
  map.addSource('graticule', {
    type: 'geojson',
    data: buildGraticuleGeoJSON(currentInterval),
  });

  map.addSource('graticule-labels', {
    type: 'geojson',
    data: buildLabelGeoJSON(currentInterval),
  });

  map.addLayer({
    id: 'graticule-lines',
    type: 'line',
    source: 'graticule',
    paint: {
      'line-color': GRAT_COLOR,
      'line-width': [
        'interpolate', ['linear'], ['zoom'],
        1, 0.6,
        5, 0.9,
        10, 1.2,
        14, 1.5,
      ],
    },
  });

  map.addLayer({
    id: 'graticule-labels',
    type: 'symbol',
    source: 'graticule-labels',
    layout: {
      'text-field': ['get', 'label'],
      'text-font': ['Noto Sans Regular'],
      'text-size': [
        'interpolate', ['linear'], ['zoom'],
        1, 8,
        5, 9,
        10, 10,
      ],
      'text-anchor': 'center',
      'text-allow-overlap': false,
      'text-ignore-placement': false,
      'text-padding': 4,
    },
    paint: {
      'text-color': LABEL_COLOR,
      'text-opacity': 0.85,
      'text-halo-color': 'rgba(237, 232, 224, 0.85)',
      'text-halo-width': 1.4,
    },
  });

  // Update on zoom
  map.on('zoomend', () => {
    const newInterval = getInterval(map.getZoom());
    if (newInterval !== currentInterval) {
      currentInterval = newInterval;
      const lineSource = map.getSource('graticule') as maplibregl.GeoJSONSource;
      const labelSource = map.getSource('graticule-labels') as maplibregl.GeoJSONSource;
      if (lineSource) lineSource.setData(buildGraticuleGeoJSON(currentInterval));
      if (labelSource) labelSource.setData(buildLabelGeoJSON(currentInterval));
    }
  });
}

/* ── Init ──────────────────────────────────────────────────── */
async function init() {
  const res = await fetch("/style.json");
  const baseStyle = (await res.json()) as maplibregl.StyleSpecification;
  const style = recolorStyle(baseStyle);

  const map = new maplibregl.Map({
    container: "map",
    style,
    center: [-0.128, 51.507], // London
    zoom: 11,
    bearing: 180,              // THE FLIP — south is up
    pitch: 0,
    minZoom: 1,
    maxZoom: 18,
    attributionControl: {},
    hash: true,                // Persist position in URL
  });

  // Lock bearing so user can't accidentally rotate back
  map.dragRotate.disable();
  map.keyboard.disable();
  map.touchZoomRotate.disableRotation();

  // Re-enable keyboard for zoom/pan only
  map.keyboard.enable();

  // ── Wire up cartographic UI ──
  map.on('load', () => {
    // Initial render
    updateScaleBar(map);
    updateCoords(map);
    updateCityTitle(map);
    setupGeocoder(map);
    setupFlip(map);

    // Graticule
    addGraticule(map);

    // Show manifesto in top band with a gentle fade-in
    setTimeout(() => {
      document.getElementById('manifesto')?.classList.add('visible');
    }, 1200);
  });

  // Live updates on zoom/move
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
