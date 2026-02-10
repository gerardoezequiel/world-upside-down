/* ══════════════════════════════════════════════════════════════
   Projection Cards — Bayer-dithered map projections
   Renders each projection as halftone riso dots on card canvases.
   ══════════════════════════════════════════════════════════════ */

import {
  geoPath,
  geoGraticule10,
  geoEqualEarth,
  geoAzimuthalEquidistant,
  type GeoProjection,
} from 'd3-geo';
import {
  geoCylindricalEqualArea,
  geoMollweide,
  geoInterruptedHomolosine,
  geoPolyhedralWaterman,
} from 'd3-geo-projection';
import { geoAirocean, geoImago } from 'd3-geo-polygon';
import * as topojson from 'topojson-client';
import type { Topology } from 'topojson-specification';

/* ── Projection definitions ── */

interface ProjCardDef {
  id: string;
  inkColor: string;
  factory: (() => GeoProjection) | null; // null = abstract fallback
  w: number;
  h: number;
}

const PROJ_DEFS: ProjCardDef[] = [
  { id: 'gall-peters',   inkColor: '#00838A', factory: () => (geoCylindricalEqualArea().parallel(45) as unknown as GeoProjection).rotate([0, 0, 180]),   w: 512, h: 320 },
  { id: 'equal-earth',   inkColor: '#0078BF', factory: () => geoEqualEarth().rotate([0, 0, 180]),       w: 512, h: 320 },
  { id: 'spilhaus',      inkColor: '#FF48B0', factory: null,                                             w: 512, h: 320 },
  { id: 'dymaxion',      inkColor: '#00838A', factory: () => geoAirocean() as unknown as GeoProjection,  w: 512, h: 320 },
  { id: 'waterman',      inkColor: '#0078BF', factory: () => geoPolyhedralWaterman().rotate([0, 0, 180]) as unknown as GeoProjection, w: 512, h: 320 },
  { id: 'hobo-dyer',     inkColor: '#00838A', factory: () => (geoCylindricalEqualArea().parallel(37.5) as unknown as GeoProjection).rotate([0, 0, 180]), w: 512, h: 320 },
  { id: 'homolosine',    inkColor: '#0078BF', factory: () => geoInterruptedHomolosine().rotate([0, 0, 180]) as unknown as GeoProjection, w: 512, h: 320 },
  { id: 'azimuthal',     inkColor: '#000000', factory: () => geoAzimuthalEquidistant().rotate([0, 0, 180]),  w: 400, h: 400 },
  { id: 'authagraph',    inkColor: '#FF48B0', factory: () => geoImago() as unknown as GeoProjection,     w: 512, h: 320 },
  { id: 'mollweide',     inkColor: '#00838A', factory: () => geoMollweide().rotate([0, 0, 180]),         w: 512, h: 320 },
];

/* ── Bayer 8x8 dither matrix (normalized 0-1) ── */

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

/* ── Render projection to grayscale offscreen canvas ── */

function renderGrayscale(
  proj: GeoProjection,
  w: number,
  h: number,
  land: any,
  borders: any,
  graticule: any,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  proj.fitSize([w * 0.92, h * 0.92], { type: 'Sphere' })
    .translate([w / 2, h / 2]);

  const path = geoPath(proj, ctx);

  // Black background
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, w, h);

  // Ocean sphere
  ctx.beginPath();
  path({ type: 'Sphere' });
  ctx.fillStyle = 'rgb(20,20,20)';
  ctx.fill();

  // Graticule
  ctx.beginPath();
  path(graticule);
  ctx.strokeStyle = 'rgb(50,50,50)';
  ctx.lineWidth = 0.5;
  ctx.stroke();

  // Land
  ctx.beginPath();
  path(land);
  ctx.fillStyle = 'rgb(180,180,180)';
  ctx.fill();

  // Borders
  ctx.beginPath();
  path(borders);
  ctx.strokeStyle = 'rgb(80,80,80)';
  ctx.lineWidth = 0.4;
  ctx.stroke();

  // Coastlines
  ctx.beginPath();
  path(land);
  ctx.strokeStyle = 'rgb(220,220,220)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Sphere outline
  ctx.beginPath();
  path({ type: 'Sphere' });
  ctx.strokeStyle = 'rgb(150,150,150)';
  ctx.lineWidth = 1.0;
  ctx.stroke();

  return canvas;
}

/* ── Spilhaus abstract fallback ── */

function renderSpilhausFallback(w: number, h: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, w, h);

  // Ocean-centric radial gradient
  const cx = w * 0.45, cy = h * 0.5;
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, w * 0.6);
  grad.addColorStop(0, 'rgb(160,160,160)');
  grad.addColorStop(0.4, 'rgb(120,120,120)');
  grad.addColorStop(0.7, 'rgb(60,60,60)');
  grad.addColorStop(1, 'rgb(15,15,15)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Concentric ellipses suggesting ocean currents
  ctx.strokeStyle = 'rgb(100,100,100)';
  ctx.lineWidth = 0.8;
  for (let r = 30; r < w * 0.55; r += 35) {
    ctx.beginPath();
    ctx.ellipse(cx, cy, r * 1.3, r, -0.2, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Small scattered land fragments at edges
  ctx.fillStyle = 'rgb(40,40,40)';
  const seeds = [[0.1, 0.15], [0.85, 0.2], [0.05, 0.8], [0.9, 0.75], [0.5, 0.05], [0.45, 0.95]];
  for (const [sx, sy] of seeds) {
    ctx.beginPath();
    ctx.ellipse(sx * w, sy * h, 15 + Math.random() * 20, 10 + Math.random() * 15, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  return canvas;
}

/* ── Bayer dither: grayscale canvas → colored halftone dots ── */

function bayerDither(
  grayscale: HTMLCanvasElement,
  visible: HTMLCanvasElement,
  inkColor: string,
  cellSize: number,
): void {
  const gW = grayscale.width;
  const gH = grayscale.height;
  const gCtx = grayscale.getContext('2d')!;
  const imageData = gCtx.getImageData(0, 0, gW, gH);
  const pixels = imageData.data;

  const vW = visible.width;
  const vH = visible.height;
  const vCtx = visible.getContext('2d')!;
  vCtx.clearRect(0, 0, vW, vH);

  const scaleX = gW / vW;
  const scaleY = gH / vH;
  const dotRadius = cellSize * 0.38;

  vCtx.fillStyle = inkColor;

  const cols = Math.floor(vW / cellSize);
  const rows = Math.floor(vH / cellSize);

  for (let gy = 0; gy < rows; gy++) {
    for (let gx = 0; gx < cols; gx++) {
      // Sample center of cell in grayscale canvas
      const sx = Math.floor((gx * cellSize + cellSize / 2) * scaleX);
      const sy = Math.floor((gy * cellSize + cellSize / 2) * scaleY);
      const idx = (sy * gW + sx) * 4;
      const brightness = pixels[idx] / 255;

      // Bayer threshold
      const threshold = BAYER_8[gy % 8][gx % 8];

      if (brightness > threshold) {
        const cx = gx * cellSize + cellSize / 2;
        const cy = gy * cellSize + cellSize / 2;
        vCtx.beginPath();
        vCtx.arc(cx, cy, dotRadius, 0, Math.PI * 2);
        vCtx.fill();
      }
    }
  }
}

/* ── Render a single card ── */

function renderCard(
  canvas: HTMLCanvasElement,
  def: ProjCardDef,
  land: any,
  borders: any,
  graticule: any,
): void {
  const parent = canvas.parentElement;
  if (!parent) return;

  const w = parent.offsetWidth;
  const h = parent.offsetHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';

  const cellSize = 4 * dpr;

  // Stage 1: grayscale projection
  let grayscale: HTMLCanvasElement;
  if (def.factory) {
    try {
      const proj = def.factory();
      grayscale = renderGrayscale(proj, def.w, def.h, land, borders, graticule);
    } catch {
      grayscale = renderSpilhausFallback(def.w, def.h);
    }
  } else {
    grayscale = renderSpilhausFallback(def.w, def.h);
  }

  // Stage 2+3: Bayer dither → colored dots
  bayerDither(grayscale, canvas, def.inkColor, cellSize);
}

/* ── Build lookup from id → def ── */

const PROJ_MAP = new Map(PROJ_DEFS.map(d => [d.id, d]));

/* ── Setup breathing animation via IntersectionObserver ── */

function setupAnimation(): void {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const canvas = entry.target.querySelector('.proj-card-canvas');
      if (canvas) {
        canvas.classList.toggle('animating', entry.isIntersecting);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.proj-card').forEach(card => observer.observe(card));
}

/* ── Main entry point ── */

export function initProjectionCards(): void {
  const cards = document.querySelectorAll<HTMLElement>('.proj-card');
  if (cards.length === 0) return;

  loadGeoData().then(({ land, borders, graticule }) => {
    cards.forEach(card => {
      const canvas = card.querySelector<HTMLCanvasElement>('.proj-card-canvas');
      const projId = card.dataset.proj;
      if (!canvas || !projId) return;

      const def = PROJ_MAP.get(projId);
      if (!def) return;

      renderCard(canvas, def, land, borders, graticule);
    });

    setupAnimation();
  }).catch(err => {
    console.warn('Projection cards: failed to load geo data', err);
  });
}
