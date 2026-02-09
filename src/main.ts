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

    // Buildings → signature blue
    if (id === "buildings" && "paint" in layer) {
      (layer as any).paint["fill-color"] = PALETTE.buildings;
      (layer as any).paint["fill-opacity"] = 0.6;
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
  { total: 100,    detail: 10,    dStep: 2,    mStep: 20 },
  { total: 200,    detail: 20,    dStep: 5,    mStep: 50 },
  { total: 500,    detail: 50,    dStep: 10,   mStep: 100 },
  { total: 1000,   detail: 100,   dStep: 20,   mStep: 200 },
  { total: 2000,   detail: 200,   dStep: 50,   mStep: 500 },
  { total: 5000,   detail: 500,   dStep: 100,  mStep: 1000 },
  { total: 10000,  detail: 1000,  dStep: 200,  mStep: 2000 },
  { total: 20000,  detail: 2000,  dStep: 500,  mStep: 5000 },
  { total: 50000,  detail: 5000,  dStep: 1000, mStep: 10000 },
  { total: 100000, detail: 10000, dStep: 2000, mStep: 20000 },
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

  const totalPx = cfg.total / mpp;
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
      titleEl.textContent = 'The World, Corrected';
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

/* ── Init ──────────────────────────────────────────────────── */
async function init() {
  const res = await fetch("/style.json");
  const baseStyle = (await res.json()) as maplibregl.StyleSpecification;
  const style = recolorStyle(baseStyle);

  const map = new maplibregl.Map({
    container: "map",
    style,
    center: [0, 20],          // World view
    zoom: 2.5,
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

  // Navigation controls (zoom only)
  map.addControl(
    new maplibregl.NavigationControl({ showCompass: false }),
    "top-right"
  );

  // ── Wire up cartographic UI ──
  map.on('load', () => {
    // Initial render
    updateScaleBar(map);
    updateCoords(map);
    updateCityTitle(map);

    // Show manifesto with a gentle fade-in
    setTimeout(() => {
      document.getElementById('manifesto')?.classList.add('visible');
    }, 1200);

    // Fade out manifesto when user starts interacting
    const hideManifesto = () => {
      document.getElementById('manifesto')?.classList.remove('visible');
      map.off('movestart', hideManifesto);
    };
    map.on('movestart', hideManifesto);
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
