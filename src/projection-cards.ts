/* ══════════════════════════════════════════════════════════════
   Projection Cards — Animated two-ink riso dithered maps
   Layer 1: Subtle vector fill + coastline outlines (static)
   Layer 2: Ocean ink dither + land ink dither (animated)
   Animation: Phase-shifted Bayer matrix creates morphing dither
   ══════════════════════════════════════════════════════════════ */

import {
  geoPath,
  geoGraticule10,
  geoMercator,
  geoEqualEarth,
  geoAzimuthalEquidistant,
  type GeoProjection,
} from 'd3-geo';
import {
  geoCylindricalEqualArea,
  geoMollweide,
  geoRobinson,
  geoInterruptedHomolosine,
  geoPolyhedralWaterman,
} from 'd3-geo-projection';
import { geoAirocean } from 'd3-geo-polygon';
import * as topojson from 'topojson-client';
import type { Topology } from 'topojson-specification';

/* ── Projection definitions ── */

interface ProjCardDef {
  id: string;
  fill: string;
  outline: string;
  dither: string;
  oceanInk: string;
  factory: () => GeoProjection;
}

const PROJ_DEFS: ProjCardDef[] = [
  {
    id: 'mercator',
    fill: 'rgba(0,131,138, 0.13)',
    outline: 'rgba(0,131,138, 0.32)',
    dither: '#C46B50',
    oceanInk: 'rgba(100,155,190, 0.45)',
    factory: () => geoMercator().rotate([0, 0, 180]),
  },
  {
    id: 'gall-peters',
    fill: 'rgba(0,120,191, 0.13)',
    outline: 'rgba(0,120,191, 0.32)',
    dither: '#C4883A',
    oceanInk: 'rgba(80,155,165, 0.45)',
    factory: () => (geoCylindricalEqualArea().parallel(45) as unknown as GeoProjection).rotate([0, 0, 180]),
  },
  {
    id: 'equal-earth',
    fill: 'rgba(0,131,138, 0.13)',
    outline: 'rgba(0,131,138, 0.32)',
    dither: '#C46B50',
    oceanInk: 'rgba(100,155,190, 0.45)',
    factory: () => geoEqualEarth().rotate([0, 0, 180]),
  },
  {
    id: 'robinson',
    fill: 'rgba(90,75,60, 0.12)',
    outline: 'rgba(90,75,60, 0.28)',
    dither: '#5A7A8A',
    oceanInk: 'rgba(170,155,130, 0.4)',
    factory: () => geoRobinson().rotate([0, 0, 180]) as unknown as GeoProjection,
  },
  {
    id: 'mollweide',
    fill: 'rgba(0,120,191, 0.13)',
    outline: 'rgba(0,120,191, 0.32)',
    dither: '#C4883A',
    oceanInk: 'rgba(80,155,165, 0.45)',
    factory: () => geoMollweide().rotate([0, 0, 180]),
  },
  {
    id: 'dymaxion',
    fill: 'rgba(0,131,138, 0.13)',
    outline: 'rgba(0,131,138, 0.32)',
    dither: '#C46B50',
    oceanInk: 'rgba(100,155,190, 0.45)',
    factory: () => geoAirocean() as unknown as GeoProjection,
  },
  {
    id: 'waterman',
    fill: 'rgba(0,120,191, 0.13)',
    outline: 'rgba(0,120,191, 0.32)',
    dither: '#C4883A',
    oceanInk: 'rgba(80,155,165, 0.45)',
    factory: () => geoPolyhedralWaterman().rotate([0, 0, 180]) as unknown as GeoProjection,
  },
  {
    id: 'homolosine',
    fill: 'rgba(90,75,60, 0.12)',
    outline: 'rgba(90,75,60, 0.28)',
    dither: '#5A7A8A',
    oceanInk: 'rgba(170,155,130, 0.4)',
    factory: () => geoInterruptedHomolosine().rotate([0, 0, 180]) as unknown as GeoProjection,
  },
  {
    id: 'azimuthal',
    fill: 'rgba(0,131,138, 0.13)',
    outline: 'rgba(0,131,138, 0.32)',
    dither: '#C46B50',
    oceanInk: 'rgba(100,155,190, 0.45)',
    factory: () => geoAzimuthalEquidistant().rotate([0, 0, 180]),
  },
];

/* ── Bayer 8×8 dither matrix (normalized 0–1) ── */

const BAYER_8 = [
  [ 0/64, 48/64, 12/64, 60/64,  3/64, 51/64, 15/64, 63/64],
  [32/64, 16/64, 44/64, 28/64, 35/64, 19/64, 47/64, 31/64],
  [ 8/64, 56/64,  4/64, 52/64, 11/64, 59/64,  7/64, 55/64],
  [40/64, 24/64, 36/64, 20/64, 43/64, 27/64, 39/64, 23/64],
  [ 2/64, 50/64, 14/64, 62/64,  1/64, 49/64, 13/64, 61/64],
  [34/64, 18/64, 46/64, 30/64, 33/64, 17/64, 45/64, 29/64],
  [10/64, 58/64,  6/64, 54/64,  9/64, 57/64,  5/64, 53/64],
  [42/64, 26/64, 38/64, 22/64, 41/64, 25/64, 37/64, 21/64],
];

/* ── Cached geo data ── */

let geoDataPromise: Promise<{ land: any; borders: any; graticule: any }> | null = null;

function loadGeoData() {
  if (!geoDataPromise) {
    geoDataPromise = Promise.all([
      fetch('/maps/world-land-110m.json').then(r => r.json()) as Promise<Topology>,
      fetch('/maps/countries-110m.json').then(r => r.json()) as Promise<Topology>,
    ]).then(([landTopo, countriesTopo]) => ({
      land: topojson.feature(landTopo, landTopo.objects.land),
      borders: topojson.mesh(countriesTopo, countriesTopo.objects.countries as any, (a: any, b: any) => a !== b),
      graticule: geoGraticule10(),
    }));
  }
  return geoDataPromise;
}

/* ── Per-card animation state ── */

interface CardState {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  def: ProjCardDef;
  landPixels: Uint8ClampedArray;
  oceanPixels: Uint8ClampedArray;
  vectorCanvas: HTMLCanvasElement;
  cw: number;
  ch: number;
  dpr: number;
  visible: boolean;
  phase: number;
}

const cardStates: CardState[] = [];

/* ── Initialize a card (one-time d3-geo setup) ── */

function initCard(
  canvas: HTMLCanvasElement,
  def: ProjCardDef,
  land: any,
  borders: any,
  graticule: any,
  index: number,
): CardState {
  const parent = canvas.parentElement!;
  const w = parent.offsetWidth;
  const h = parent.offsetHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const cw = Math.round(w * dpr);
  const ch = Math.round(h * dpr);

  canvas.width = cw;
  canvas.height = ch;
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';

  const ctx = canvas.getContext('2d')!;
  const proj = def.factory();
  proj.fitSize([cw * 0.86, ch * 0.86], { type: 'Sphere' })
    .translate([cw / 2, ch / 2]);

  // Pre-render vector fill (static base layer)
  const vectorCanvas = document.createElement('canvas');
  vectorCanvas.width = cw;
  vectorCanvas.height = ch;
  const vCtx = vectorCanvas.getContext('2d')!;
  const vPath = geoPath(proj, vCtx);

  vCtx.beginPath();
  vPath(land);
  vCtx.fillStyle = def.fill;
  vCtx.fill();

  vCtx.beginPath();
  vPath(land);
  vCtx.strokeStyle = def.outline;
  vCtx.lineWidth = 1.0 * dpr;
  vCtx.stroke();

  // Land grayscale (bright land, dark ocean)
  const landCanvas = document.createElement('canvas');
  landCanvas.width = cw;
  landCanvas.height = ch;
  const lCtx = landCanvas.getContext('2d')!;
  const lPath = geoPath(proj, lCtx);

  lCtx.fillStyle = '#000';
  lCtx.fillRect(0, 0, cw, ch);
  lCtx.beginPath(); lPath({ type: 'Sphere' }); lCtx.fillStyle = 'rgb(15,15,15)'; lCtx.fill();
  lCtx.beginPath(); lPath(graticule); lCtx.strokeStyle = 'rgb(40,40,40)'; lCtx.lineWidth = 0.4; lCtx.stroke();
  lCtx.beginPath(); lPath(land); lCtx.fillStyle = 'rgb(190,190,190)'; lCtx.fill();
  lCtx.beginPath(); lPath(borders); lCtx.strokeStyle = 'rgb(80,80,80)'; lCtx.lineWidth = 0.4; lCtx.stroke();
  lCtx.beginPath(); lPath(land); lCtx.strokeStyle = 'rgb(230,230,230)'; lCtx.lineWidth = 1.2; lCtx.stroke();

  const landPixels = lCtx.getImageData(0, 0, cw, ch).data;

  // Ocean grayscale (bright ocean, dark land)
  const oceanCanvas = document.createElement('canvas');
  oceanCanvas.width = cw;
  oceanCanvas.height = ch;
  const oCtx = oceanCanvas.getContext('2d')!;
  const oPath = geoPath(proj, oCtx);

  oCtx.fillStyle = '#000';
  oCtx.fillRect(0, 0, cw, ch);
  oCtx.beginPath(); oPath({ type: 'Sphere' }); oCtx.fillStyle = 'rgb(120,120,120)'; oCtx.fill();
  oCtx.beginPath(); oPath(land); oCtx.fillStyle = '#000'; oCtx.fill();

  const oceanPixels = oCtx.getImageData(0, 0, cw, ch).data;

  const state: CardState = {
    canvas, ctx, def, landPixels, oceanPixels, vectorCanvas,
    cw, ch, dpr, visible: false, phase: index * 1.7,
  };

  renderDither(state);
  return state;
}

/* ── Render one dither frame (called per animation tick) ── */

function renderDither(state: CardState): void {
  const { ctx, cw, ch, dpr, def, landPixels, oceanPixels, vectorCanvas, phase } = state;
  const cellSize = 3 * dpr;
  const dotRadius = cellSize * 0.36;
  const misX = 1.5 * dpr;
  const misY = 1.0 * dpr;
  const cols = Math.floor(cw / cellSize);
  const rows = Math.floor(ch / cellSize);
  const twoPi = Math.PI * 2;

  // Phase offsets — shift at different rates for organic feel
  const phX = Math.floor(phase * 0.7) % 8;
  const phY = Math.floor(phase * 0.5) % 8;

  // Clear and stamp vector base
  ctx.clearRect(0, 0, cw, ch);
  ctx.drawImage(vectorCanvas, 0, 0);

  // Ocean dither pass (batched Path2D)
  const oceanPath = new Path2D();
  const oceanR = dotRadius * 0.65;
  for (let gy = 0; gy < rows; gy++) {
    for (let gx = 0; gx < cols; gx++) {
      const cx = gx * cellSize + cellSize / 2;
      const cy = gy * cellSize + cellSize / 2;
      const idx = (Math.floor(cy) * cw + Math.floor(cx)) * 4;
      const brightness = oceanPixels[idx] / 255;
      const threshold = BAYER_8[(gy + phY) % 8][(gx + phX) % 8];
      if (brightness > threshold) {
        oceanPath.moveTo(cx + oceanR, cy);
        oceanPath.arc(cx, cy, oceanR, 0, twoPi);
      }
    }
  }
  ctx.fillStyle = def.oceanInk;
  ctx.fill(oceanPath);

  // Land dither pass — echo (misregistration) + main (batched)
  const echoPath = new Path2D();
  const mainPath = new Path2D();
  const echoR = dotRadius * 0.85;
  for (let gy = 0; gy < rows; gy++) {
    for (let gx = 0; gx < cols; gx++) {
      const cx = gx * cellSize + cellSize / 2;
      const cy = gy * cellSize + cellSize / 2;
      const idx = (Math.floor(cy) * cw + Math.floor(cx)) * 4;
      const brightness = landPixels[idx] / 255;
      const threshold = BAYER_8[(gy + phY) % 8][(gx + phX) % 8];
      if (brightness > threshold) {
        echoPath.moveTo(cx + misX + echoR, cy + misY);
        echoPath.arc(cx + misX, cy + misY, echoR, 0, twoPi);
        mainPath.moveTo(cx + dotRadius, cy);
        mainPath.arc(cx, cy, dotRadius, 0, twoPi);
      }
    }
  }
  ctx.fillStyle = def.dither;
  ctx.globalAlpha = 0.25;
  ctx.fill(echoPath);
  ctx.globalAlpha = 1.0;
  ctx.fill(mainPath);
}

/* ── Animation loop (~5.5 fps for quirky riso feel) ── */

let animRunning = false;
let lastFrame = 0;

function startAnim(): void {
  if (animRunning) return;
  animRunning = true;
  requestAnimationFrame(animLoop);
}

function animLoop(now: number): void {
  if (!cardStates.some(s => s.visible)) {
    animRunning = false;
    return;
  }
  requestAnimationFrame(animLoop);

  if (now - lastFrame < 180) return;
  lastFrame = now;

  for (const state of cardStates) {
    if (!state.visible) continue;
    state.phase += 0.4;
    renderDither(state);
  }
}

/* ── Visibility tracking ── */

function setupVisibility(): void {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const canvas = entry.target.querySelector('.proj-card-canvas') as HTMLCanvasElement;
      if (!canvas) return;
      const state = cardStates.find(s => s.canvas === canvas);
      if (state) state.visible = entry.isIntersecting;
    });
    if (cardStates.some(s => s.visible)) startAnim();
  }, { threshold: 0.1 });

  document.querySelectorAll('.proj-card').forEach(card => observer.observe(card));
}

/* ── Main entry point ── */

export function initProjectionCards(): void {
  const cards = document.querySelectorAll<HTMLElement>('.proj-card');
  if (cards.length === 0) return;

  const PROJ_MAP = new Map(PROJ_DEFS.map(d => [d.id, d]));

  loadGeoData().then(({ land, borders, graticule }) => {
    cards.forEach((card, i) => {
      const canvas = card.querySelector<HTMLCanvasElement>('.proj-card-canvas');
      const projId = card.dataset.proj;
      if (!canvas || !projId) return;

      const def = PROJ_MAP.get(projId);
      if (!def) return;

      cardStates.push(initCard(canvas, def, land, borders, graticule, i));
    });

    setupVisibility();
  }).catch(err => {
    console.warn('Projection cards: failed to load geo data', err);
  });
}
