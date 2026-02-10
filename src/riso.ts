/* ══════════════════════════════════════════════════════════════
   5-Colour Risograph Rendering System
   Official Riso Kagaku spot inks on warm uncoated paper stock.
   ══════════════════════════════════════════════════════════════ */

export interface InkDef {
  hex: string;
  r: number; g: number; b: number;
  role: string;
  defaultOpacity: number;
  printOrder: number;
}

export const RISO_INKS: Record<string, InkDef> = {
  lightGray: {
    hex: '#88898A', r: 136, g: 137, b: 138,
    role: 'land base, secondary roads, railways, terrain shading',
    defaultOpacity: 0.20, printOrder: 1,
  },
  teal: {
    hex: '#00838A', r: 0, g: 131, b: 138,
    role: 'water bodies, rivers, ocean, coastline',
    defaultOpacity: 0.50, printOrder: 2,
  },
  blue: {
    hex: '#0078BF', r: 0, g: 120, b: 191,
    role: 'buildings, built environment, urban fabric',
    defaultOpacity: 0.85, printOrder: 3,
  },
  fluorPink: {
    hex: '#FF48B0', r: 255, g: 72, b: 176,
    role: 'parks, green space, gardens, cemeteries',
    defaultOpacity: 0.85, printOrder: 4,
  },
  black: {
    hex: '#000000', r: 0, g: 0, b: 0,
    role: 'text, labels, road casings, admin boundaries',
    defaultOpacity: 1.0, printOrder: 5,
  },
};

export const PAPER = '#F2EDE4';
export const PAPER_RGB = { r: 242, g: 237, b: 228 };

export const PRINT_ORDER = ['lightGray', 'teal', 'blue', 'fluorPink', 'black'] as const;

/* ── Seeded PRNG (Mulberry32) ─────────────────────────────── */
export function mulberry32(a: number): () => number {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ── Misregistration offsets ──────────────────────────────── */
export interface InkOffset {
  dx: number;
  dy: number;
  rotation: number;
}

export type MisregistrationMap = Record<string, InkOffset>;

export function generateMisregistration(seed: number = Date.now()): MisregistrationMap {
  const rng = mulberry32(seed);
  return {
    lightGray: { dx: 0, dy: 0, rotation: 0 },
    teal:      { dx: (rng() - 0.5) * 3, dy: (rng() - 0.5) * 3, rotation: (rng() - 0.5) * 0.15 },
    blue:      { dx: (rng() - 0.5) * 4, dy: (rng() - 0.5) * 4, rotation: (rng() - 0.5) * 0.2 },
    fluorPink: { dx: (rng() - 0.5) * 5, dy: (rng() - 0.5) * 5, rotation: (rng() - 0.5) * 0.25 },
    black:     { dx: (rng() - 0.5) * 2, dy: (rng() - 0.5) * 2, rotation: (rng() - 0.5) * 0.1 },
  };
}

/* ── Session seed — same "print" per browser tab ──────────── */
export function getSessionSeed(): number {
  let seed = sessionStorage.getItem('risoSeed');
  if (!seed) {
    seed = String(Math.floor(Math.random() * 100000));
    sessionStorage.setItem('risoSeed', seed);
  }
  return parseInt(seed, 10);
}

/* ── RisoCompositor — full 5-layer canvas compositor ──────── */
interface LayerState {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
}

export class RisoCompositor {
  width: number;
  height: number;
  misreg: MisregistrationMap;
  outputCanvas: HTMLCanvasElement;
  outputCtx: CanvasRenderingContext2D;
  layers: Record<string, LayerState>;
  private grainCanvas: HTMLCanvasElement | null = null;

  constructor(width: number, height: number, seed: number) {
    this.width = width;
    this.height = height;
    this.misreg = generateMisregistration(seed);

    this.outputCanvas = document.createElement('canvas');
    this.outputCanvas.width = width;
    this.outputCanvas.height = height;
    this.outputCtx = this.outputCanvas.getContext('2d')!;

    this.layers = {};
    for (const ink of Object.keys(RISO_INKS)) {
      const c = document.createElement('canvas');
      c.width = width;
      c.height = height;
      this.layers[ink] = { canvas: c, ctx: c.getContext('2d')! };
    }
  }

  clear(): void {
    this.outputCtx.clearRect(0, 0, this.width, this.height);
    for (const layer of Object.values(this.layers)) {
      layer.ctx.clearRect(0, 0, this.width, this.height);
    }
  }

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.outputCanvas.width = width;
    this.outputCanvas.height = height;
    for (const layer of Object.values(this.layers)) {
      layer.canvas.width = width;
      layer.canvas.height = height;
    }
    this.grainCanvas = null; // regenerate on next composite
  }

  /** Tint a grayscale-alpha canvas with a spot ink colour */
  private tintLayer(sourceCanvas: HTMLCanvasElement, ink: InkDef): HTMLCanvasElement {
    const tinted = document.createElement('canvas');
    tinted.width = this.width;
    tinted.height = this.height;
    const ctx = tinted.getContext('2d')!;

    ctx.drawImage(sourceCanvas, 0, 0);
    const imageData = ctx.getImageData(0, 0, this.width, this.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] === 0) continue;
      data[i] = ink.r;
      data[i + 1] = ink.g;
      data[i + 2] = ink.b;
    }

    ctx.putImageData(imageData, 0, 0);
    return tinted;
  }

  /** Generate grain texture canvas (cached) */
  private getGrainCanvas(): HTMLCanvasElement {
    if (this.grainCanvas) return this.grainCanvas;

    const canvas = document.createElement('canvas');
    canvas.width = this.width;
    canvas.height = this.height;
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.createImageData(this.width, this.height);
    const data = imageData.data;
    const rng = mulberry32(7919); // fixed seed for grain

    for (let i = 0; i < data.length; i += 4) {
      const noise = rng() * 255;
      data[i] = Math.min(255, noise + 8);
      data[i + 1] = noise;
      data[i + 2] = Math.max(0, noise - 8);
      data[i + 3] = 12;
    }

    ctx.putImageData(imageData, 0, 0);
    this.grainCanvas = canvas;
    return canvas;
  }

  /** Composite all ink layers onto paper with misregistration + multiply */
  composite(): void {
    const ctx = this.outputCtx;

    // Paper base
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, this.width, this.height);

    // Each ink layer in print order
    for (const inkName of PRINT_ORDER) {
      const layer = this.layers[inkName];
      const offset = this.misreg[inkName];
      const ink = RISO_INKS[inkName];
      const tinted = this.tintLayer(layer.canvas, ink);

      ctx.save();
      ctx.globalCompositeOperation = 'multiply';

      // Apply misregistration
      const cx = this.width / 2;
      const cy = this.height / 2;
      ctx.translate(cx + offset.dx, cy + offset.dy);
      if (offset.rotation) {
        ctx.rotate((offset.rotation * Math.PI) / 180);
      }
      ctx.translate(-cx, -cy);

      ctx.drawImage(tinted, 0, 0);
      ctx.restore();
    }

    // Grain overlay
    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    ctx.drawImage(this.getGrainCanvas(), 0, 0);
    ctx.restore();
  }
}

/* ── Halftone effect for ocean on Dymaxion ────────────────── */
export function applyHalftone(ctx: CanvasRenderingContext2D, width: number, height: number, spacing: number): void {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  ctx.clearRect(0, 0, width, height);

  const maxRadius = spacing * 0.45;
  const rng = mulberry32(1337);

  for (let y = 0; y < height; y += spacing) {
    for (let x = 0; x < width; x += spacing) {
      const idx = (y * width + x) * 4;
      const alpha = data[idx + 3] / 255;
      if (alpha < 0.05) continue;

      const radius = maxRadius * Math.sqrt(alpha);
      const jx = (rng() - 0.5) * 0.5;
      const jy = (rng() - 0.5) * 0.5;

      ctx.beginPath();
      ctx.arc(x + jx, y + jy, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(1, alpha * 1.2)})`;
      ctx.fill();
    }
  }
}
