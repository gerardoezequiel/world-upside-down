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

    // Background — matches MapLibre ocean warm grey
    ctx.fillStyle = '#C8C2B8';
    ctx.fillRect(0, 0, w, h);

    // Graticule (under land) — riso blue ink at low opacity
    ctx.beginPath();
    path(graticule);
    ctx.strokeStyle = 'rgba(91, 158, 173, 0.18)';
    ctx.lineWidth = 0.4;
    ctx.stroke();

    // Land fill — cream paper stock (matches MapLibre earth)
    ctx.beginPath();
    path(land);
    ctx.fillStyle = '#F2EDE4';
    ctx.fill();

    // Country borders — coral ink at low opacity
    ctx.beginPath();
    path(borders);
    ctx.strokeStyle = 'rgba(232, 116, 97, 0.20)';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Icosahedron outline — coral ink (the signature riso accent)
    ctx.beginPath();
    path({ type: 'Sphere' });
    ctx.strokeStyle = 'rgba(232, 116, 97, 0.45)';
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
