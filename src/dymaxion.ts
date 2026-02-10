import { geoPath, geoGraticule10 } from 'd3-geo';
import { geoAirocean } from 'd3-geo-polygon';
import * as topojson from 'topojson-client';
import type { Topology } from 'topojson-specification';

interface DymaxionController {
  show: (t: number) => void;
  resize: () => void;
  destroy: () => void;
}

export async function initDymaxion(container: HTMLElement): Promise<DymaxionController> {
  // Create canvas
  const canvas = document.getElementById('dymaxion-canvas') as HTMLCanvasElement
    || document.createElement('canvas');
  if (!canvas.id) {
    canvas.id = 'dymaxion-canvas';
    container.appendChild(canvas);
  }
  const ctx = canvas.getContext('2d')!;

  // Load TopoJSON data
  const [landTopo, countriesTopo] = await Promise.all([
    fetch('/land-110m.json').then(r => r.json()) as Promise<Topology>,
    fetch('/countries-110m.json').then(r => r.json()) as Promise<Topology>,
  ]);

  const land = topojson.feature(landTopo, landTopo.objects.land);
  const borders = topojson.mesh(
    countriesTopo,
    countriesTopo.objects.countries as any,
    (a, b) => a !== b
  );
  const graticule = geoGraticule10();

  // Projection
  let projection = geoAirocean();
  let path = geoPath(projection, ctx);
  let rendered = false;
  let currentT = 0;

  function sizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const w = container.clientWidth;
    const h = container.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    projection = geoAirocean()
      .fitSize([w * 0.85, h * 0.85], { type: 'Sphere' })
      .translate([w / 2, h / 2]);
    path = geoPath(projection, ctx);
    rendered = false;
  }

  function render() {
    const w = container.clientWidth;
    const h = container.clientHeight;

    // Background
    ctx.fillStyle = '#1A1A2E';
    ctx.fillRect(0, 0, w, h);

    // Graticule (under land for subtle grid)
    ctx.beginPath();
    path(graticule);
    ctx.strokeStyle = 'rgba(107, 168, 189, 0.12)';
    ctx.lineWidth = 0.4;
    ctx.stroke();

    // Land fill
    ctx.beginPath();
    path(land);
    ctx.fillStyle = '#2D2D42';
    ctx.fill();

    // Country borders
    ctx.beginPath();
    path(borders);
    ctx.strokeStyle = 'rgba(250, 250, 246, 0.10)';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Icosahedron / sphere outline (the key visual)
    ctx.beginPath();
    path({ type: 'Sphere' });
    ctx.strokeStyle = 'rgba(232, 116, 97, 0.30)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    rendered = true;
  }

  function show(t: number) {
    currentT = t;
    if (t <= 0) {
      canvas.style.opacity = '0';
      canvas.style.display = 'none';
      return;
    }
    canvas.style.display = 'block';
    canvas.style.opacity = String(t);
    if (!rendered) {
      sizeCanvas();
      render();
    }
  }

  function resize() {
    sizeCanvas();
    if (currentT > 0) render();
  }

  function destroy() {
    canvas.remove();
  }

  // Initial sizing (but don't render yet)
  sizeCanvas();

  return { show, resize, destroy };
}
