import { describe, it, expect } from 'vitest';
import { recolorStyle } from '../recolor-style';
import { buildDerivedPalette, PALETTES } from '../ink-palette';

/** Minimal MapLibre-like style for testing */
function makeStyle(layers: any[]): any {
  return { version: 8, sources: {}, layers };
}

function makeLayer(id: string, type: string, paint: Record<string, any> = {}, layout: Record<string, any> = {}): any {
  return { id, type, paint, layout };
}

const classicPalette = PALETTES.find(p => p.id === 'classic')!.palette;
const P = buildDerivedPalette(classicPalette);

describe('recolorStyle', () => {
  it('sets background colour', () => {
    const style = makeStyle([makeLayer('background', 'background', { 'background-color': '#old' })]);
    const result = recolorStyle(P, style);
    expect(result.layers[0]).toHaveProperty('paint');
    expect((result.layers[0] as any).paint['background-color']).toBe(P.bg);
  });

  it('sets earth fill colour', () => {
    const style = makeStyle([makeLayer('earth', 'fill', { 'fill-color': '#old' })]);
    const result = recolorStyle(P, style);
    expect((result.layers[0] as any).paint['fill-color']).toBe(P.earth);
  });

  it('sets water fill colour', () => {
    const style = makeStyle([makeLayer('water', 'fill', { 'fill-color': '#old' })]);
    const result = recolorStyle(P, style);
    expect((result.layers[0] as any).paint['fill-color']).toBe(P.water);
  });

  it('sets buildings fill colour and opacity interpolation', () => {
    const style = makeStyle([makeLayer('buildings', 'fill', { 'fill-color': '#old' })]);
    const result = recolorStyle(P, style);
    const paint = (result.layers[0] as any).paint;
    expect(paint['fill-color']).toBe(P.buildings);
    expect(paint['fill-opacity']).toBeInstanceOf(Array);
    expect(paint['fill-opacity'][0]).toBe('interpolate');
  });

  it('sets water_stream and water_river line colour', () => {
    const style = makeStyle([
      makeLayer('water_stream', 'line', { 'line-color': '#old' }),
      makeLayer('water_river', 'line', { 'line-color': '#old' }),
    ]);
    const result = recolorStyle(P, style);
    expect((result.layers[0] as any).paint['line-color']).toBe(P.waterLine);
    expect((result.layers[1] as any).paint['line-color']).toBe(P.waterLine);
  });

  it('sets landuse_park fill colour and opacity', () => {
    const style = makeStyle([makeLayer('landuse_park', 'fill', { 'fill-color': '#old' })]);
    const result = recolorStyle(P, style);
    const paint = (result.layers[0] as any).paint;
    expect(paint['fill-color']).toBe(P.park);
    expect(Array.isArray(paint['fill-opacity'])).toBe(true);
    expect(paint['fill-opacity'][0]).toBe('interpolate');
  });

  it('handles landuse_park_something prefix', () => {
    const style = makeStyle([makeLayer('landuse_park_garden', 'fill', { 'fill-color': '#old' })]);
    const result = recolorStyle(P, style);
    expect((result.layers[0] as any).paint['fill-color']).toBe(P.park);
  });

  it('sets road casing colour', () => {
    const style = makeStyle([makeLayer('roads_highway_casing', 'line', { 'line-color': '#old' })]);
    const result = recolorStyle(P, style);
    expect((result.layers[0] as any).paint['line-color']).toBe(P.roadCas);
  });

  it('sets highway road colour to roadMajor', () => {
    const style = makeStyle([makeLayer('roads_highway', 'line', { 'line-color': '#old' })]);
    const result = recolorStyle(P, style);
    expect((result.layers[0] as any).paint['line-color']).toBe(P.roadMajor);
  });

  it('sets minor road colour to roadMinor', () => {
    const style = makeStyle([makeLayer('roads_minor', 'line', { 'line-color': '#old' })]);
    const result = recolorStyle(P, style);
    expect((result.layers[0] as any).paint['line-color']).toBe(P.roadMinor);
  });

  it('sets rail road colour', () => {
    const style = makeStyle([makeLayer('roads_rail', 'line', { 'line-color': '#old' })]);
    const result = recolorStyle(P, style);
    expect((result.layers[0] as any).paint['line-color']).toBe(P.rail);
  });

  it('sets boundary line colour', () => {
    const style = makeStyle([makeLayer('boundaries_country', 'line', { 'line-color': '#old' })]);
    const result = recolorStyle(P, style);
    expect((result.layers[0] as any).paint['line-color']).toBe(P.boundary);
  });

  it('hides roads_shields', () => {
    const style = makeStyle([makeLayer('roads_shields', 'symbol', {}, { visibility: 'visible' })]);
    const result = recolorStyle(P, style);
    expect((result.layers[0] as any).layout.visibility).toBe('none');
  });

  it('deletes icon-image from pois', () => {
    const style = makeStyle([makeLayer('pois', 'symbol', { 'text-color': '#old' }, { 'icon-image': 'marker' })]);
    const result = recolorStyle(P, style);
    expect((result.layers[0] as any).layout['icon-image']).toBeUndefined();
  });

  it('sets symbol layer text-color to label', () => {
    const style = makeStyle([makeLayer('places_city', 'symbol', { 'text-color': '#old', 'text-halo-color': '#old' })]);
    const result = recolorStyle(P, style);
    const paint = (result.layers[0] as any).paint;
    expect(paint['text-color']).toBe(P.label);
    expect(paint['text-halo-color']).toBe(P.labelHalo);
  });

  it('does not mutate the original style', () => {
    const style = makeStyle([makeLayer('background', 'background', { 'background-color': '#original' })]);
    const original = JSON.parse(JSON.stringify(style));
    recolorStyle(P, style);
    expect(style).toEqual(original);
  });

  it('handles empty layers array', () => {
    const style = makeStyle([]);
    const result = recolorStyle(P, style);
    expect(result.layers).toEqual([]);
  });

  it('handles layer without paint', () => {
    const style = makeStyle([{ id: 'no-paint', type: 'fill' }]);
    expect(() => recolorStyle(P, style)).not.toThrow();
  });

  it('sets landcover match expression', () => {
    const style = makeStyle([makeLayer('landcover', 'fill', { 'fill-color': '#old' })]);
    const result = recolorStyle(P, style);
    const fillColor = (result.layers[0] as any).paint['fill-color'];
    expect(fillColor[0]).toBe('match');
    expect(fillColor).toContain('grassland');
    expect(fillColor).toContain(P.grass);
    expect(fillColor).toContain(P.barren);
  });

  it('sets special landuse fills', () => {
    const layers = [
      makeLayer('landuse_hospital', 'fill', { 'fill-color': '#old' }),
      makeLayer('landuse_school', 'fill', { 'fill-color': '#old' }),
      makeLayer('landuse_industrial', 'fill', { 'fill-color': '#old' }),
    ];
    const result = recolorStyle(P, makeStyle(layers));
    expect((result.layers[0] as any).paint['fill-color']).toBe(P.hospital);
    expect((result.layers[1] as any).paint['fill-color']).toBe(P.school);
    expect((result.layers[2] as any).paint['fill-color']).toBe(P.industrial);
  });
});
