import { describe, it, expect } from 'vitest';
import {
  INK_CATALOG,
  PALETTES,
  CATEGORY_INKS,
  lighten,
  darken,
  buildTextPairings,
  buildDerivedPalette,
  DEFAULT_PALETTE_ID,
  type MapPalette,
} from '../ink-palette';

/* ── lighten ─────────────────────────────────────────────── */
describe('lighten', () => {
  it('returns white when amount is 1', () => {
    expect(lighten('#000000', 1)).toBe('#FFFFFF');
  });

  it('returns the same colour when amount is 0', () => {
    expect(lighten('#FF48B0', 0)).toBe('#FF48B0');
  });

  it('lightens a mid-tone correctly', () => {
    const result = lighten('#000000', 0.5);
    expect(result).toBe('#808080');
  });

  it('handles already-white input', () => {
    expect(lighten('#FFFFFF', 0.5)).toBe('#FFFFFF');
  });
});

/* ── darken ──────────────────────────────────────────────── */
describe('darken', () => {
  it('returns black when amount is 1', () => {
    expect(darken('#FFFFFF', 1)).toBe('#000000');
  });

  it('returns the same colour when amount is 0', () => {
    expect(darken('#FF48B0', 0)).toBe('#FF48B0');
  });

  it('darkens a mid-tone correctly', () => {
    const result = darken('#FFFFFF', 0.5);
    expect(result).toBe('#808080');
  });

  it('handles already-black input', () => {
    expect(darken('#000000', 0.5)).toBe('#000000');
  });
});

/* ── buildTextPairings ───────────────────────────────────── */
describe('buildTextPairings', () => {
  const classicPalette: MapPalette = PALETTES.find(p => p.id === 'classic')!.palette;

  it('returns pairings for classic palette', () => {
    const pairings = buildTextPairings(classicPalette);
    expect(pairings.length).toBeGreaterThan(0);
    expect(pairings.length).toBeLessThanOrEqual(5);
  });

  it('first pairing (green role) is recommended', () => {
    const pairings = buildTextPairings(classicPalette);
    expect(pairings[0].recommended).toBe(true);
  });

  it('non-first pairings are not recommended', () => {
    const pairings = buildTextPairings(classicPalette);
    for (const p of pairings.slice(1)) {
      expect(p.recommended).toBeFalsy();
    }
  });

  it('each pairing has color, shadow, and name', () => {
    const pairings = buildTextPairings(classicPalette);
    for (const p of pairings) {
      expect(p.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(p.shadow).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(p.name.length).toBeGreaterThan(0);
    }
  });

  it('deduplicates inks (mono palette has fewer pairings)', () => {
    const monoPalette: MapPalette = PALETTES.find(p => p.id === 'mono')!.palette;
    const pairings = buildTextPairings(monoPalette);
    expect(pairings.length).toBe(3);
  });

  it('dark inks get lighter shadows', () => {
    const palette: MapPalette = { base: 'lightGray', water: 'teal', built: 'blue', green: 'black', ink: 'black' };
    const pairings = buildTextPairings(palette);
    const blackPairing = pairings.find(p => p.name === 'Black')!;
    expect(blackPairing.color).toBe('#000000');
    expect(blackPairing.shadow).not.toBe('#000000');
  });

  it('light inks get darker shadows', () => {
    const palette: MapPalette = { base: 'lightGray', water: 'teal', built: 'blue', green: 'yellow', ink: 'black' };
    const pairings = buildTextPairings(palette);
    const yellowPairing = pairings.find(p => p.name === 'Yellow')!;
    expect(yellowPairing.color).toBe('#FFE800');
    const shadowVal = parseInt(yellowPairing.shadow.slice(1), 16);
    const colorVal = parseInt(yellowPairing.color.slice(1), 16);
    expect(shadowVal).toBeLessThan(colorVal);
  });
});

/* ── buildDerivedPalette ─────────────────────────────────── */
describe('buildDerivedPalette', () => {
  const classicPalette: MapPalette = PALETTES.find(p => p.id === 'classic')!.palette;

  it('returns all 30 DerivedPalette keys', () => {
    const derived = buildDerivedPalette(classicPalette);
    const expectedKeys = [
      'bg', 'earth', 'water', 'waterLine', 'buildings', 'urban',
      'park', 'parkAlt', 'road', 'roadMajor', 'roadMinor', 'roadCas',
      'rail', 'boundary', 'label', 'labelHalo', 'grass', 'farmland',
      'scrub', 'barren', 'glacier', 'hospital', 'school', 'industrial',
      'beach', 'zoo', 'aerodrome', 'pier', 'pedestrian', 'runway',
    ];
    for (const key of expectedKeys) {
      expect(derived).toHaveProperty(key);
    }
  });

  it('all values are hex colour strings', () => {
    const derived = buildDerivedPalette(classicPalette);
    for (const value of Object.values(derived)) {
      expect(value).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it('bg is always white', () => {
    expect(buildDerivedPalette(classicPalette).bg).toBe('#FFFFFF');
  });

  it('water matches the water ink hex', () => {
    const derived = buildDerivedPalette(classicPalette);
    expect(derived.water).toBe(INK_CATALOG[classicPalette.water].hex);
  });

  it('buildings matches the built ink hex', () => {
    const derived = buildDerivedPalette(classicPalette);
    expect(derived.buildings).toBe(INK_CATALOG[classicPalette.built].hex);
  });

  it('road, roadMajor, rail, boundary, label all use ink hex', () => {
    const derived = buildDerivedPalette(classicPalette);
    const inkHex = INK_CATALOG[classicPalette.ink].hex;
    expect(derived.road).toBe(inkHex);
    expect(derived.roadMajor).toBe(inkHex);
    expect(derived.rail).toBe(inkHex);
    expect(derived.boundary).toBe(inkHex);
    expect(derived.label).toBe(inkHex);
  });

  it('produces different outputs for different palettes', () => {
    const classic = buildDerivedPalette(PALETTES[0].palette);
    const protest = buildDerivedPalette(PALETTES[1].palette);
    expect(classic.water).not.toBe(protest.water);
  });

  it('works for all 6 preset palettes without error', () => {
    for (const preset of PALETTES) {
      const derived = buildDerivedPalette(preset.palette);
      expect(derived.bg).toBe('#FFFFFF');
    }
  });
});

/* ── Data integrity ──────────────────────────────────────── */
describe('INK_CATALOG integrity', () => {
  it('has 33 inks', () => {
    expect(Object.keys(INK_CATALOG).length).toBe(33);
  });

  it('every ink has id, name, hex', () => {
    for (const [key, ink] of Object.entries(INK_CATALOG)) {
      expect(ink.id).toBe(key);
      expect(ink.name.length).toBeGreaterThan(0);
      expect(ink.hex).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });
});

describe('PALETTES integrity', () => {
  it('has 6 presets', () => {
    expect(PALETTES.length).toBe(6);
  });

  it('default palette exists', () => {
    expect(PALETTES.find(p => p.id === DEFAULT_PALETTE_ID)).toBeDefined();
  });

  it('every palette references valid inks', () => {
    for (const preset of PALETTES) {
      for (const inkId of Object.values(preset.palette)) {
        expect(INK_CATALOG[inkId], `unknown ink "${inkId}" in palette "${preset.id}"`).toBeDefined();
      }
    }
  });
});

describe('CATEGORY_INKS integrity', () => {
  it('all ink IDs reference valid catalog entries', () => {
    for (const [role, ids] of Object.entries(CATEGORY_INKS)) {
      for (const id of ids) {
        expect(INK_CATALOG[id], `${role} references unknown ink "${id}"`).toBeDefined();
      }
    }
  });

  it('covers all 5 roles', () => {
    expect(Object.keys(CATEGORY_INKS).sort()).toEqual(['base', 'built', 'green', 'ink', 'water']);
  });
});
