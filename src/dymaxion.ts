import { geoPath, geoGraticule10 } from 'd3-geo';
import { geoAirocean } from 'd3-geo-polygon';
import * as topojson from 'topojson-client';
import type { Topology } from 'topojson-specification';
import { RisoCompositor, applyHalftone, getSessionSeed } from './riso';

interface DymaxionController {
  show: (t: number) => void;
  resize: () => void;
  destroy: () => void;
}

export async function initDymaxion(container: HTMLElement): Promise<DymaxionController> {
  const canvas = document.getElementById('dymaxion-canvas') as HTMLCanvasElement
    || document.createElement('canvas');
  if (!canvas.id) {
    canvas.id = 'dymaxion-canvas';
    container.appendChild(canvas);
  }
  const ctx = canvas.getContext('2d')!;

  // Lazy-load: defer TopoJSON fetch until actually needed (show() called with t > 0)
  let land: any = null;
  let borders: any = null;
  let dataLoaded = false;
  let dataLoading = false;

  async function loadData() {
    if (dataLoaded || dataLoading) return;
    dataLoading = true;
    const [landTopo, countriesTopo] = await Promise.all([
      fetch('/land-110m.json').then(r => r.json()) as Promise<Topology>,
      fetch('/countries-110m.json').then(r => r.json()) as Promise<Topology>,
    ]);
    land = topojson.feature(landTopo, landTopo.objects.land);
    borders = topojson.mesh(
      countriesTopo,
      countriesTopo.objects.countries as any,
      (a, b) => a !== b
    );
    dataLoaded = true;
    dataLoading = false;
  }

  const graticule = geoGraticule10();

  let projection = geoAirocean();
  let pathGen = geoPath(projection);
  let rendered = false;
  let currentT = 0;

  const seed = getSessionSeed();
  let compositor: RisoCompositor | null = null;

  function sizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const w = container.clientWidth;
    const h = container.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';

    projection = geoAirocean()
      .fitSize([w * dpr * 0.85, h * dpr * 0.85], { type: 'Sphere' })
      .translate([w * dpr / 2, h * dpr / 2]);
    pathGen = geoPath(projection);

    compositor = new RisoCompositor(w * dpr, h * dpr, seed);
    rendered = false;
  }

  function render() {
    if (!compositor || !dataLoaded) return;
    const w = canvas.width;
    const h = canvas.height;

    compositor.clear();

    // ── Light Gray layer: land base fill ──
    const grayCtx = compositor.layers.lightGray.ctx;
    grayCtx.beginPath();
    pathGen.context(grayCtx)(land);
    grayCtx.fillStyle = 'rgba(0, 0, 0, 0.18)';
    grayCtx.fill();
    pathGen.context(null);

    // ── Teal layer: ocean (sphere minus land) ──
    const tealCtx = compositor.layers.teal.ctx;
    tealCtx.save();
    tealCtx.beginPath();
    pathGen.context(tealCtx)({ type: 'Sphere' });
    tealCtx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    tealCtx.fill();
    pathGen.context(null);
    // Cut out land
    tealCtx.globalCompositeOperation = 'destination-out';
    tealCtx.beginPath();
    pathGen.context(tealCtx)(land);
    tealCtx.fillStyle = 'rgba(0, 0, 0, 1.0)';
    tealCtx.fill();
    pathGen.context(null);
    tealCtx.restore();
    // Halftone the ocean
    applyHalftone(tealCtx, w, h, 5);

    // ── Blue layer: coastline stroke ──
    const blueCtx = compositor.layers.blue.ctx;
    blueCtx.beginPath();
    pathGen.context(blueCtx)(land);
    blueCtx.strokeStyle = 'rgba(0, 0, 0, 0.30)';
    blueCtx.lineWidth = 1.2;
    blueCtx.stroke();
    pathGen.context(null);

    // ── Black layer: borders, graticule, icosahedron fold lines ──
    const blackCtx = compositor.layers.black.ctx;

    // Country borders
    blackCtx.beginPath();
    pathGen.context(blackCtx)(borders);
    blackCtx.strokeStyle = 'rgba(0, 0, 0, 0.30)';
    blackCtx.lineWidth = 0.4;
    blackCtx.stroke();
    pathGen.context(null);

    // Graticule (dashed)
    blackCtx.beginPath();
    pathGen.context(blackCtx)(graticule);
    blackCtx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
    blackCtx.lineWidth = 0.3;
    blackCtx.setLineDash([2, 3]);
    blackCtx.stroke();
    blackCtx.setLineDash([]);
    pathGen.context(null);

    // Icosahedron outline (dashed fold lines)
    blackCtx.beginPath();
    pathGen.context(blackCtx)({ type: 'Sphere' });
    blackCtx.strokeStyle = 'rgba(0, 0, 0, 0.50)';
    blackCtx.lineWidth = 0.8;
    blackCtx.setLineDash([4, 4]);
    blackCtx.stroke();
    blackCtx.setLineDash([]);
    pathGen.context(null);

    // ── Composite all layers ──
    compositor.composite();

    // ── Copy to visible canvas ──
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(compositor.outputCanvas, 0, 0);

    rendered = true;
  }

  async function show(t: number) {
    currentT = t;
    if (t <= 0) {
      canvas.style.opacity = '0';
      canvas.style.display = 'none';
      return;
    }
    canvas.style.display = 'block';
    canvas.style.opacity = String(t);
    if (!rendered) {
      await loadData();
      sizeCanvas();
      render();
    }
  }

  function resize() {
    sizeCanvas();
    if (currentT > 0 && dataLoaded) render();
  }

  function destroy() {
    canvas.remove();
  }

  sizeCanvas();

  return { show, resize, destroy };
}
