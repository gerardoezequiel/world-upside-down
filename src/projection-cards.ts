/* ══════════════════════════════════════════════════════════════
   Projection Cards — Two-layer map rendering
   Layer 1: Subtle vector fill + thin coastline outlines
   Layer 2: Bayer-dithered halftone dots in complementary color
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
  factory: () => GeoProjection;
}

const PROJ_DEFS: ProjCardDef[] = [
  {
    id: 'mercator',
    fill: 'rgba(0,131,138, 0.07)',
    outline: 'rgba(0,131,138, 0.18)',
    dither: '#C46B50',
    factory: () => geoMercator().rotate([0, 0, 180]),
  },
  {
    id: 'gall-peters',
    fill: 'rgba(0,120,191, 0.07)',
    outline: 'rgba(0,120,191, 0.18)',
    dither: '#C4883A',
    factory: () => (geoCylindricalEqualArea().parallel(45) as unknown as GeoProjection).rotate([0, 0, 180]),
  },
  {
    id: 'equal-earth',
    fill: 'rgba(0,131,138, 0.07)',
    outline: 'rgba(0,131,138, 0.18)',
    dither: '#C46B50',
    factory: () => geoEqualEarth().rotate([0, 0, 180]),
  },
  {
    id: 'robinson',
    fill: 'rgba(90,75,60, 0.06)',
    outline: 'rgba(90,75,60, 0.15)',
    dither: '#5A7A8A',
    factory: () => geoRobinson().rotate([0, 0, 180]) as unknown as GeoProjection,
  },
  {
    id: 'mollweide',
    fill: 'rgba(0,120,191, 0.07)',
    outline: 'rgba(0,120,191, 0.18)',
    dither: '#C4883A',
    factory: () => geoMollweide().rotate([0, 0, 180]),
  },
  {
    id: 'dymaxion',
    fill: 'rgba(0,131,138, 0.07)',
    outline: 'rgba(0,131,138, 0.18)',
    dither: '#C46B50',
    factory: () => geoAirocean() as unknown as GeoProjection,
  },
  {
    id: 'waterman',
    fill: 'rgba(0,120,191, 0.07)',
    outline: 'rgba(0,120,191, 0.18)',
    dither: '#C4883A',
    factory: () => geoPolyhedralWaterman().rotate([0, 0, 180]) as unknown as GeoProjection,
  },
  {
    id: 'homolosine',
    fill: 'rgba(90,75,60, 0.06)',
    outline: 'rgba(90,75,60, 0.15)',
    dither: '#5A7A8A',
    factory: () => geoInterruptedHomolosine().rotate([0, 0, 180]) as unknown as GeoProjection,
  },
  {
    id: 'azimuthal',
    fill: 'rgba(0,131,138, 0.07)',
    outline: 'rgba(0,131,138, 0.18)',
    dither: '#C46B50',
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
  const cw = Math.round(w * dpr);
  const ch = Math.round(h * dpr);

  canvas.width = cw;
  canvas.height = ch;
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';

  const ctx = canvas.getContext('2d')!;

  // Configure projection to fit canvas
  const proj = def.factory();
  proj.fitSize([cw * 0.86, ch * 0.86], { type: 'Sphere' })
    .translate([cw / 2, ch / 2]);

  /* ── Layer 1: Subtle vector fill + thin outline ── */

  const path = geoPath(proj, ctx);

  // Land fill (very subtle)
  ctx.beginPath();
  path(land);
  ctx.fillStyle = def.fill;
  ctx.fill();

  // Coastline outlines (thin)
  ctx.beginPath();
  path(land);
  ctx.strokeStyle = def.outline;
  ctx.lineWidth = 0.7 * dpr;
  ctx.stroke();

  /* ── Layer 2: Bayer dither from grayscale source ── */

  // Offscreen grayscale at same pixel resolution
  const offscreen = document.createElement('canvas');
  offscreen.width = cw;
  offscreen.height = ch;
  const offCtx = offscreen.getContext('2d')!;
  const offPath = geoPath(proj, offCtx);

  offCtx.fillStyle = '#000';
  offCtx.fillRect(0, 0, cw, ch);

  // Ocean sphere
  offCtx.beginPath();
  offPath({ type: 'Sphere' });
  offCtx.fillStyle = 'rgb(15,15,15)';
  offCtx.fill();

  // Graticule
  offCtx.beginPath();
  offPath(graticule);
  offCtx.strokeStyle = 'rgb(40,40,40)';
  offCtx.lineWidth = 0.4;
  offCtx.stroke();

  // Land
  offCtx.beginPath();
  offPath(land);
  offCtx.fillStyle = 'rgb(190,190,190)';
  offCtx.fill();

  // Borders
  offCtx.beginPath();
  offPath(borders);
  offCtx.strokeStyle = 'rgb(80,80,80)';
  offCtx.lineWidth = 0.4;
  offCtx.stroke();

  // Coastlines
  offCtx.beginPath();
  offPath(land);
  offCtx.strokeStyle = 'rgb(230,230,230)';
  offCtx.lineWidth = 1.2;
  offCtx.stroke();

  // Sample offscreen → draw dither dots on visible canvas
  const cellSize = 3 * dpr;
  const imageData = offCtx.getImageData(0, 0, cw, ch);
  const pixels = imageData.data;
  const dotRadius = cellSize * 0.36;

  ctx.fillStyle = def.dither;

  const cols = Math.floor(cw / cellSize);
  const rows = Math.floor(ch / cellSize);

  for (let gy = 0; gy < rows; gy++) {
    for (let gx = 0; gx < cols; gx++) {
      const cx = gx * cellSize + cellSize / 2;
      const cy = gy * cellSize + cellSize / 2;
      const px = Math.floor(cx);
      const py = Math.floor(cy);
      const idx = (py * cw + px) * 4;
      const brightness = pixels[idx] / 255;
      const threshold = BAYER_8[gy % 8][gx % 8];

      if (brightness > threshold) {
        ctx.beginPath();
        ctx.arc(cx, cy, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

/* ── Build lookup from id → def ── */

const PROJ_MAP = new Map(PROJ_DEFS.map(d => [d.id, d]));

/* ── Setup dither drift animation via IntersectionObserver ── */

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
