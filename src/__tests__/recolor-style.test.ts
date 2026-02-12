import { describe, it, expect } from 'vitest';
import { recolorStyle } from '../recolor-style';
import { buildDerivedPalette, PALETTES } from '../ink-palette';

const classicPalette = PALETTES.find(p => p.id === 'classic')!.palette;
const P = buildDerivedPalette(classicPalette);

function makeStyle(layers: any[]): any {
  return { version: 8, sources: {}, layers };
}

function fillLayer(id: string, color = '#old'): any {
  return { id, type: 'fill', paint: { 'fill-color': color } };
}

function lineLayer(id: string, color = '#old'): any {
  return { id, type: 'line', paint: { 'line-color': color } };
}

function symbolLayer(id: string): any {
  return { id, type: 'symbol', paint: { 'text-color': '#old', 'text-halo-color': '#old' }, layout: {} };
}

/* ── Core layer mappings ─────────────────────────────────── */
describe('recolorStyle — core layers', () => {
  it('sets background colour', () => {
    const style = makeStyle([{ id: 'background', type: 'background', paint: { 'background-color': '#old' } }]);
    const result = recolorStyle(P, style);
    expect(result.layers[0].paint['background-color']).toBe(P.bg);
  });

  it('sets earth fill colour', () => {
    const style = makeStyle([fillLayer('earth')]);
    const result = recolorStyle(P, style);
    expect(result.layers[0].paint['fill-color']).toBe(P.earth);
  });

  it('sets water fill colour', () => {
    const style = makeStyle([fillLayer('water')]);
    const result = recolorStyle(P, style);
    expect(result.layers[0].paint['fill-color']).toBe(P.water);
  });

  it('sets water_stream line colour', () => {
    const style = makeStyle([lineLayer('water_stream')]);
    const result = recolorStyle(P, style);
    expect(result.layers[0].paint['line-color']).toBe(P.waterLine);
  });

  it('sets buildings colour with opacity interpolation', () => {
    const style = makeStyle([fillLayer('buildings')]);
    const result = recolorStyle(P, style);
    expect(result.layers[0].paint['fill-color']).toBe(P.buildings);
    expect(result.layers[0].paint['fill-opacity']).toBeInstanceOf(Array);
    expect(result.layers[0].paint['fill-opacity'][0]).toBe('interpolate');
  });
});

/* ── Landuse layers ──────────────────────────────────────── */
describe('recolorStyle — landuse', () => {
  it('sets park colour and opacity', () => {
    const style = makeStyle([fillLayer('landuse_park')]);
    const result = recolorStyle(P, style);
    expect(result.layers[0].paint['fill-color']).toBe(P.park);
    expect(result.layers[0].paint['fill-opacity']).toBe(0.7);
  });

  it('matches landuse_park_* variants', () => {
    const style = makeStyle([fillLayer('landuse_park_nature')]);
    const result = recolorStyle(P, style);
    expect(result.layers[0].paint['fill-color']).toBe(P.park);
  });

  it('sets hospital, school, industrial fills', () => {
    const style = makeStyle([
      fillLayer('landuse_hospital'),
      fillLayer('landuse_school'),
      fillLayer('landuse_industrial'),
    ]);
    const result = recolorStyle(P, style);
    expect(result.layers[0].paint['fill-color']).toBe(P.hospital);
    expect(result.layers[1].paint['fill-color']).toBe(P.school);
    expect(result.layers[2].paint['fill-color']).toBe(P.industrial);
  });
});

/* ── Roads ───────────────────────────────────────────────── */
describe('recolorStyle — roads', () => {
  it('road casing gets roadCas colour', () => {
    const style = makeStyle([lineLayer('roads_highway_casing')]);
    const result = recolorStyle(P, style);
    expect(result.layers[0].paint['line-color']).toBe(P.roadCas);
  });

  it('highway roads get roadMajor', () => {
    const style = makeStyle([lineLayer('roads_highway')]);
    const result = recolorStyle(P, style);
    expect(result.layers[0].paint['line-color']).toBe(P.roadMajor);
  });

  it('minor roads get roadMinor', () => {
    const style = makeStyle([lineLayer('roads_minor')]);
    const result = recolorStyle(P, style);
    expect(result.layers[0].paint['line-color']).toBe(P.roadMinor);
  });

  it('rail roads get rail colour', () => {
    const style = makeStyle([lineLayer('roads_rail')]);
    const result = recolorStyle(P, style);
    expect(result.layers[0].paint['line-color']).toBe(P.rail);
  });
});

/* ── Boundaries and labels ───────────────────────────────── */
describe('recolorStyle — boundaries and labels', () => {
  it('boundaries get boundary colour', () => {
    const style = makeStyle([lineLayer('boundaries_country')]);
    const result = recolorStyle(P, style);
    expect(result.layers[0].paint['line-color']).toBe(P.boundary);
  });

  it('symbol layers get label and halo colours', () => {
    const style = makeStyle([symbolLayer('places_city')]);
    const result = recolorStyle(P, style);
    expect(result.layers[0].paint['text-color']).toBe(P.label);
    expect(result.layers[0].paint['text-halo-color']).toBe(P.labelHalo);
  });
});

/* ── Special layers ──────────────────────────────────────── */
describe('recolorStyle — special layers', () => {
  it('hides road shields', () => {
    const style = makeStyle([{ id: 'roads_shields', type: 'symbol', layout: { 'icon-image': 'shield' }, paint: {} }]);
    const result = recolorStyle(P, style);
    expect(result.layers[0].layout.visibility).toBe('none');
  });

  it('removes icon-image from pois', () => {
    const style = makeStyle([{
      id: 'pois', type: 'symbol',
      layout: { 'icon-image': 'poi', 'text-field': '{name}' },
      paint: { 'text-color': '#old', 'text-halo-color': '#old' },
    }]);
    const result = recolorStyle(P, style);
    expect(result.layers[0].layout['icon-image']).toBeUndefined();
  });

  it('landcover gets match expression', () => {
    const style = makeStyle([fillLayer('landcover')]);
    const result = recolorStyle(P, style);
    const expr = result.layers[0].paint['fill-color'];
    expect(expr[0]).toBe('match');
    expect(expr).toContain('grassland');
    expect(expr).toContain(P.grass);
  });
});

/* ── Purity ──────────────────────────────────────────────── */
describe('recolorStyle — purity', () => {
  it('does not mutate the original style', () => {
    const style = makeStyle([fillLayer('water')]);
    const original = JSON.parse(JSON.stringify(style));
    recolorStyle(P, style);
    expect(style).toEqual(original);
  });

  it('handles empty layers array', () => {
    const style = makeStyle([]);
    const result = recolorStyle(P, style);
    expect(result.layers).toEqual([]);
  });

  it('handles layer without paint property gracefully', () => {
    const style = makeStyle([{ id: 'no-paint', type: 'fill' }]);
    expect(() => recolorStyle(P, style)).not.toThrow();
  });
});
