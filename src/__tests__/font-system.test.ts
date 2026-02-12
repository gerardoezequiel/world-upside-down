import { describe, it, expect, beforeEach } from 'vitest';
import {
  FONT_CATALOG,
  FONT_CATEGORIES,
  FONT_PAIRINGS,
  STYLE_PRESETS,
  TICKER_COMPANIONS,
  TICKER_PHRASES,
  getFont,
  getFontsByCategory,
  createFontState,
  generateTickerPhrase,
  DEFAULT_PAIRING_ID,
  DEFAULT_STYLE_ID,
  type FontState,
  type FontCategory,
} from '../font-system';
import { INK_CATALOG, PALETTES } from '../ink-palette';

/* ── getFont ─────────────────────────────────────────────── */
describe('getFont', () => {
  it('returns correct font for valid ID', () => {
    const font = getFont('abril');
    expect(font).toBeDefined();
    expect(font!.name).toBe('Abril Fatface');
    expect(font!.category).toBe('fatface');
  });

  it('returns undefined for invalid ID', () => {
    expect(getFont('nonexistent')).toBeUndefined();
  });

  it('all 19 catalog fonts are findable', () => {
    for (const font of FONT_CATALOG) {
      expect(getFont(font.id), `Font "${font.id}" not found`).toBeDefined();
    }
  });

  it('is case sensitive (IDs are lowercase)', () => {
    expect(getFont('Abril')).toBeUndefined();
  });
});

/* ── getFontsByCategory ──────────────────────────────────── */
describe('getFontsByCategory', () => {
  const byCategory = getFontsByCategory();

  it('returns all 6 categories', () => {
    const categories: FontCategory[] = ['slab', 'fatface', 'blade', 'hand', 'wire', 'scrawl'];
    expect(Object.keys(byCategory).sort()).toEqual(categories.sort());
  });

  it('slab has 3 fonts', () => {
    expect(byCategory.slab.length).toBe(3);
  });

  it('fatface has 3 fonts', () => {
    expect(byCategory.fatface.length).toBe(3);
  });

  it('blade has 4 fonts', () => {
    expect(byCategory.blade.length).toBe(4);
  });

  it('hand has 3 fonts', () => {
    expect(byCategory.hand.length).toBe(3);
  });

  it('wire has 3 fonts', () => {
    expect(byCategory.wire.length).toBe(3);
  });

  it('scrawl has 3 fonts', () => {
    expect(byCategory.scrawl.length).toBe(3);
  });

  it('total across all categories equals FONT_CATALOG length', () => {
    const total = Object.values(byCategory).reduce((sum, fonts) => sum + fonts.length, 0);
    expect(total).toBe(FONT_CATALOG.length);
  });
});

/* ── createFontState ─────────────────────────────────────── */
describe('createFontState', () => {
  it('default pairing is "poster"', () => {
    const state = createFontState();
    expect(state.activePairing).toBe('poster');
  });

  it('default hero is "abril"', () => {
    const state = createFontState();
    expect(state.activeHero).toBe('abril');
  });

  it('default ticker is "caveat"', () => {
    const state = createFontState();
    expect(state.activeTicker).toBe('caveat');
  });

  it('pre-loaded fonts include anton and space-mono', () => {
    const state = createFontState();
    expect(state.loadedFonts.has('anton')).toBe(true);
    expect(state.loadedFonts.has('space-mono')).toBe(true);
  });

  it('tickerDirection starts as "east"', () => {
    const state = createFontState();
    expect(state.tickerDirection).toBe('east');
  });

  it('tickerPaused starts false', () => {
    const state = createFontState();
    expect(state.tickerPaused).toBe(false);
  });

  it('tickerPhrase starts as the first template', () => {
    const state = createFontState();
    expect(state.tickerPhrase).toBe(TICKER_PHRASES[0]);
  });

  it('tickerPlace starts empty', () => {
    const state = createFontState();
    expect(state.tickerPlace).toBe('');
  });
});

/* ── generateTickerPhrase ────────────────────────────────── */
describe('generateTickerPhrase', () => {
  let state: FontState;

  beforeEach(() => {
    state = createFontState();
  });

  it('returns empty string for empty place', () => {
    expect(generateTickerPhrase('', state)).toBe('');
  });

  it('returns phrase containing the place name', () => {
    const result = generateTickerPhrase('London', state);
    expect(result).toContain('London');
  });

  it('alternates ticker direction', () => {
    expect(state.tickerDirection).toBe('east');
    generateTickerPhrase('London', state);
    expect(state.tickerDirection).toBe('west');
    generateTickerPhrase('Paris', state);
    expect(state.tickerDirection).toBe('east');
  });

  it('updates state.tickerPlace', () => {
    generateTickerPhrase('Paris', state);
    expect(state.tickerPlace).toBe('Paris');
  });

  it('updates state.tickerPhrase to a known template', () => {
    generateTickerPhrase('Tokyo', state);
    expect(TICKER_PHRASES).toContain(state.tickerPhrase);
  });

  it('replaces [place] token in template', () => {
    const result = generateTickerPhrase('Buenos Aires', state);
    expect(result).not.toContain('[place]');
    expect(result).toContain('Buenos Aires');
  });
});

/* ── Data integrity ──────────────────────────────────────── */
describe('FONT_CATALOG integrity', () => {
  it('has 19 fonts', () => {
    expect(FONT_CATALOG.length).toBe(19);
  });

  it('every font has required fields', () => {
    for (const font of FONT_CATALOG) {
      expect(font.id.length).toBeGreaterThan(0);
      expect(font.name.length).toBeGreaterThan(0);
      expect(font.family.length).toBeGreaterThan(0);
      expect(font.googleId.length).toBeGreaterThan(0);
      expect(font.weights.length).toBeGreaterThan(0);
      expect(font.cssClass).toMatch(/^font-/);
    }
  });

  it('all font IDs are unique', () => {
    const ids = FONT_CATALOG.map(f => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('FONT_PAIRINGS integrity', () => {
  it('has 6 pairings', () => {
    expect(FONT_PAIRINGS.length).toBe(6);
  });

  it('hero and ticker reference valid fonts', () => {
    for (const pairing of FONT_PAIRINGS) {
      expect(getFont(pairing.hero), `Hero "${pairing.hero}" not found in pairing "${pairing.id}"`).toBeDefined();
      expect(getFont(pairing.ticker), `Ticker "${pairing.ticker}" not found in pairing "${pairing.id}"`).toBeDefined();
    }
  });

  it('default pairing exists', () => {
    expect(FONT_PAIRINGS.find(p => p.id === DEFAULT_PAIRING_ID)).toBeDefined();
  });
});

describe('STYLE_PRESETS integrity', () => {
  it('has 6 presets', () => {
    expect(STYLE_PRESETS.length).toBe(6);
  });

  it('each preset references a valid palette', () => {
    for (const preset of STYLE_PRESETS) {
      expect(PALETTES.find(p => p.id === preset.inkPalette), `Palette "${preset.inkPalette}" not found`).toBeDefined();
    }
  });

  it('each preset references a valid font pairing', () => {
    for (const preset of STYLE_PRESETS) {
      expect(FONT_PAIRINGS.find(p => p.id === preset.fontPairing), `Pairing "${preset.fontPairing}" not found`).toBeDefined();
    }
  });

  it('each preset references a valid ink for text colour', () => {
    for (const preset of STYLE_PRESETS) {
      expect(INK_CATALOG[preset.textInk], `Ink "${preset.textInk}" not found`).toBeDefined();
    }
  });

  it('default style exists', () => {
    expect(STYLE_PRESETS.find(p => p.id === DEFAULT_STYLE_ID)).toBeDefined();
  });
});

describe('TICKER_COMPANIONS integrity', () => {
  it('covers all 6 categories', () => {
    const categories: FontCategory[] = ['slab', 'fatface', 'blade', 'hand', 'wire', 'scrawl'];
    for (const cat of categories) {
      expect(TICKER_COMPANIONS[cat]).toBeDefined();
      expect(TICKER_COMPANIONS[cat].length).toBeGreaterThan(0);
    }
  });

  it('all companion IDs reference valid fonts', () => {
    for (const [category, companions] of Object.entries(TICKER_COMPANIONS)) {
      for (const id of companions) {
        expect(getFont(id), `Companion "${id}" in category "${category}" not found`).toBeDefined();
      }
    }
  });
});

describe('FONT_CATEGORIES integrity', () => {
  it('has 6 categories', () => {
    expect(Object.keys(FONT_CATEGORIES).length).toBe(6);
  });

  it('each category has name, label, and description', () => {
    for (const cat of Object.values(FONT_CATEGORIES)) {
      expect(cat.name.length).toBeGreaterThan(0);
      expect(cat.label.length).toBeGreaterThan(0);
      expect(cat.description.length).toBeGreaterThan(0);
    }
  });
});
