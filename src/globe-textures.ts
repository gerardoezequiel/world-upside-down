/* ══════════════════════════════════════════════════════════════
   Globe Projection Textures
   Pre-renders world map in multiple projections as grayscale
   canvases for WebGL dither shader consumption.
   All projections south-up (rotated 180°).
   ══════════════════════════════════════════════════════════════ */

import {
  geoPath,
  geoGraticule10,
  geoMercator,
  geoEqualEarth,
  geoNaturalEarth1,
  geoOrthographic,
  geoAzimuthalEqualArea,
  type GeoProjection,
} from 'd3-geo';
import { geoAirocean } from 'd3-geo-polygon';
import * as topojson from 'topojson-client';
import type { Topology } from 'topojson-specification';

export interface ProjectionTexture {
  canvas: HTMLCanvasElement;
  name: string;
  label: string;
  color: [number, number, number]; // RGB 0-1 for shader
}

/* ── Riso ink colors (normalized 0-1 for GL) ── */
const RISO_BLUE:  [number, number, number] = [0.0, 0.471, 0.749];   // #0078BF
const RISO_TEAL:  [number, number, number] = [0.0, 0.514, 0.541];   // #00838A
const RISO_PINK:  [number, number, number] = [1.0, 0.282, 0.690];   // #FF48B0
const RISO_BLACK: [number, number, number] = [0.05, 0.05, 0.05];

/* ── Grayscale values for map features (0-255 direct fill) ── */
const OCEAN_VAL      = 20;
const LAND_VAL       = 180;
const COAST_VAL      = 220;
const GRATICULE_VAL  = 50;
const BORDER_VAL     = 80;

/* ── Canvas size ── */
const TEX_W = 1024;
const TEX_H = 512;

/* ── Projection definitions ── */
interface ProjDef {
  name: string;
  label: string;
  color: [number, number, number];
  factory: () => GeoProjection;
  w: number;
  h: number;
}

const PROJECTIONS: ProjDef[] = [
  {
    name: 'mercator',
    label: 'Mercator · South-Up',
    color: RISO_BLUE,
    factory: () => geoMercator().rotate([0, 0, 180]).clipExtent([[0, 0], [TEX_W, TEX_H]]) as GeoProjection,
    w: TEX_W, h: TEX_H,
  },
  {
    name: 'equalearth',
    label: 'Equal Earth · Fair Area',
    color: RISO_TEAL,
    factory: () => geoEqualEarth().rotate([0, 0, 180]) as GeoProjection,
    w: TEX_W, h: TEX_H,
  },
  {
    name: 'naturalearth',
    label: 'Natural Earth · The Compromise',
    color: RISO_PINK,
    factory: () => geoNaturalEarth1().rotate([0, 0, 180]) as GeoProjection,
    w: TEX_W, h: TEX_H,
  },
  {
    name: 'orthographic',
    label: 'Orthographic · South Pole',
    color: RISO_BLUE,
    factory: () => geoOrthographic().rotate([0, 90, 0]) as GeoProjection, // South pole facing viewer
    w: 512, h: 512,
  },
  {
    name: 'airocean',
    label: 'Airocean · No Hierarchy',
    color: RISO_TEAL,
    factory: () => geoAirocean() as unknown as GeoProjection,
    w: TEX_W, h: TEX_H,
  },
];

/* ── Render a single projection to canvas ── */
function renderProjection(
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

  // Fit projection to canvas
  proj.fitSize([w * 0.92, h * 0.92], { type: 'Sphere' })
      .translate([w / 2, h / 2]);

  const path = geoPath(proj, ctx);

  // Black background
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, w, h);

  // Ocean sphere fill (for non-rectangular projections)
  ctx.beginPath();
  path({ type: 'Sphere' });
  const oc = OCEAN_VAL;
  ctx.fillStyle = `rgb(${oc},${oc},${oc})`;
  ctx.fill();

  // Graticule
  ctx.beginPath();
  path(graticule);
  const gr = GRATICULE_VAL;
  ctx.strokeStyle = `rgb(${gr},${gr},${gr})`;
  ctx.lineWidth = 0.5;
  ctx.stroke();

  // Land fill
  ctx.beginPath();
  path(land);
  const la = LAND_VAL;
  ctx.fillStyle = `rgb(${la},${la},${la})`;
  ctx.fill();

  // Country borders
  ctx.beginPath();
  path(borders);
  const bo = BORDER_VAL;
  ctx.strokeStyle = `rgb(${bo},${bo},${bo})`;
  ctx.lineWidth = 0.4;
  ctx.stroke();

  // Coastlines (bright)
  ctx.beginPath();
  path(land);
  const co = COAST_VAL;
  ctx.strokeStyle = `rgb(${co},${co},${co})`;
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

/* ── Main export: generate all projection textures ── */
export async function generateProjectionTextures(): Promise<ProjectionTexture[]> {
  // Load TopoJSON data
  const [landTopo, countriesTopo] = await Promise.all([
    fetch('/maps/world-land-110m.json').then(r => r.json()) as Promise<Topology>,
    fetch('/maps/countries-110m.json').then(r => r.json()) as Promise<Topology>,
  ]);

  const land = topojson.feature(landTopo, landTopo.objects.land);
  const borders = topojson.mesh(
    countriesTopo,
    countriesTopo.objects.countries as any,
    (a: any, b: any) => a !== b
  );
  const graticule = geoGraticule10();

  const textures: ProjectionTexture[] = [];

  for (const def of PROJECTIONS) {
    const proj = def.factory();
    const canvas = renderProjection(proj, def.w, def.h, land, borders, graticule);

    textures.push({
      canvas,
      name: def.name,
      label: def.label,
      color: def.color,
    });
  }

  return textures;
}

export { PROJECTIONS };
