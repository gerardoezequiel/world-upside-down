/* ══════════════════════════════════════════════════════════════
   Font System — 19 fonts, 6 categories, hero + ticker voices.
   ══════════════════════════════════════════════════════════════ */

/* ── Font definition ──────────────────────────────────────── */
export interface FontDefinition {
  id: string;
  name: string;
  family: string;
  googleId: string;
  weights: number[];
  category: FontCategory;
  lineage: string;
  character: string;
  cssClass: string;
  sampleText: string;
  isMonospace: boolean;
  isVariable?: boolean;
  variableAxes?: Record<string, { min: number; max: number; default?: number }>;
}

export type FontCategory = 'slab' | 'fatface' | 'blade' | 'hand' | 'wire' | 'scrawl';

/* ── Category metadata ────────────────────────────────────── */
export const FONT_CATEGORIES: Record<FontCategory, { name: string; label: string; description: string }> = {
  slab:    { name: 'Slab',     label: 'Wood Type',  description: 'Bold slab serifs. The poster, the picket sign.' },
  fatface: { name: 'Fat Face', label: 'Fat Face',   description: 'High-contrast display. The decree, the love letter.' },
  blade:   { name: 'Blade',    label: 'Condensed',  description: 'Squeezed narrow, pushed tall. The rally banner.' },
  hand:    { name: 'Hand',     label: 'Hand Set',   description: 'Organic, imperfect. The woodcut, the letterpress.' },
  wire:    { name: 'Wire',     label: 'Machine',    description: 'Monospace, geometric. The manifesto, the dispatch.' },
  scrawl:  { name: 'Scrawl',   label: 'Scrawl',     description: 'Handwritten, marker-drawn. The zine, the margin note.' },
};

/* ── Full catalog — 19 Google Fonts ───────────────────────── */
export const FONT_CATALOG: FontDefinition[] = [
  // SLAB
  {
    id: 'alfa-slab', name: 'Alfa Slab One',
    family: "'Alfa Slab One', serif", googleId: 'Alfa+Slab+One',
    weights: [400], category: 'slab',
    lineage: 'Egyptian slab serif, pure wood type energy',
    character: 'The picket sign', cssClass: 'font-alfa-slab',
    sampleText: 'EVERY PEASANT', isMonospace: false,
  },
  {
    id: 'ultra', name: 'Ultra',
    family: "'Ultra', serif", googleId: 'Ultra',
    weights: [400], category: 'slab',
    lineage: 'Clarendon bold, 19th-century poster titling',
    character: 'The broadsheet headline', cssClass: 'font-ultra',
    sampleText: 'NEEDS A GARDEN', isMonospace: false,
  },
  {
    id: 'zilla', name: 'Zilla Slab',
    family: "'Zilla Slab', serif", googleId: 'Zilla+Slab:wght@400;700',
    weights: [400, 700], category: 'slab',
    lineage: 'Mozilla open-source slab serif',
    character: 'The open-source manifesto', cssClass: 'font-zilla',
    sampleText: 'The system cannot', isMonospace: false,
  },

  // FAT FACE
  {
    id: 'abril', name: 'Abril Fatface',
    family: "'Abril Fatface', serif", googleId: 'Abril+Fatface',
    weights: [400], category: 'fatface',
    lineage: '19th-century Fat Face poster titling, Didone display',
    character: 'The poster voice', cssClass: 'font-abril',
    sampleText: 'Better Lives', isMonospace: false,
  },
  {
    id: 'dm-serif', name: 'DM Serif Display',
    family: "'DM Serif Display', serif", googleId: 'DM+Serif+Display',
    weights: [400], category: 'fatface',
    lineage: 'Warm high-contrast display serif',
    character: 'The editorial headline', cssClass: 'font-dm-serif',
    sampleText: 'Enshrined in Palaces', isMonospace: false,
  },
  {
    id: 'playfair', name: 'Playfair Display',
    family: "'Playfair Display', serif", googleId: 'Playfair+Display:wght@400;700;900',
    weights: [400, 700, 900], category: 'fatface',
    lineage: 'Enlightenment-era transitional serif, Baskerville descendant',
    character: 'The love letter', cssClass: 'font-playfair',
    sampleText: 'The Margins', isMonospace: false,
  },

  // BLADE
  {
    id: 'bebas', name: 'Bebas Neue',
    family: "'Bebas Neue', sans-serif", googleId: 'Bebas+Neue',
    weights: [400], category: 'blade',
    lineage: 'Zine cover condensed display',
    character: 'The zine cover', cssClass: 'font-bebas',
    sampleText: 'WE ARE AN IMAGE', isMonospace: false,
  },
  {
    id: 'anton', name: 'Anton',
    family: "'Anton', sans-serif", googleId: 'Anton',
    weights: [400], category: 'blade',
    lineage: 'Traditional advertising grotesque',
    character: 'The billboard', cssClass: 'font-anton',
    sampleText: 'FROM THE FUTURE', isMonospace: false,
  },
  {
    id: 'oswald', name: 'Oswald',
    family: "'Oswald', sans-serif", googleId: 'Oswald:wght@400;700',
    weights: [400, 700], category: 'blade',
    lineage: 'Re-imagined Alternate Gothic, newspaper headline',
    character: 'The rally banner', cssClass: 'font-oswald',
    sampleText: 'THE PRISONS', isMonospace: false,
  },
  {
    id: 'league-gothic', name: 'League Gothic',
    family: "'League Gothic', sans-serif", googleId: 'League+Gothic',
    weights: [400], category: 'blade',
    lineage: 'Revival of Alternate Gothic No.1, open-source',
    character: 'The broadside', cssClass: 'font-league-gothic',
    sampleText: 'THE GALLOWS', isMonospace: false,
  },

  // HAND
  {
    id: 'fraunces', name: 'Fraunces',
    family: "'Fraunces', serif", googleId: 'Fraunces:opsz,wght,WONK@9..144,100..900,0..1',
    weights: [400, 700, 900], category: 'hand',
    lineage: 'Old Style soft serif with variable "wonk" axis',
    character: 'The hand-carved block', cssClass: 'font-fraunces',
    sampleText: 'Wild Combination', isMonospace: false,
    isVariable: true,
    variableAxes: { WONK: { min: 0, max: 1, default: 1 }, opsz: { min: 9, max: 144 } },
  },
  {
    id: 'young-serif', name: 'Young Serif',
    family: "'Young Serif', serif", googleId: 'Young+Serif',
    weights: [400], category: 'hand',
    lineage: 'Warm, organic display serif with hand-set character',
    character: 'The letterpress proof', cssClass: 'font-young-serif',
    sampleText: 'A zine inspired by', isMonospace: false,
  },
  {
    id: 'source-serif', name: 'Source Serif 4',
    family: "'Source Serif 4', serif", googleId: 'Source+Serif+4:wght@400;700',
    weights: [400, 700], category: 'hand',
    lineage: 'Adobe open-source editorial serif',
    character: 'The essay', cssClass: 'font-source-serif',
    sampleText: 'the music of', isMonospace: false,
  },

  // WIRE
  {
    id: 'space-mono', name: 'Space Mono',
    family: "'Space Mono', monospace", googleId: 'Space+Mono:wght@400;700',
    weights: [400, 700], category: 'wire',
    lineage: 'Constructivist monospace by Colophon Foundry',
    character: 'The manifesto', cssClass: 'font-space-mono',
    sampleText: 'be reformed.', isMonospace: true,
  },
  {
    id: 'space-grotesk', name: 'Space Grotesk',
    family: "'Space Grotesk', sans-serif", googleId: 'Space+Grotesk:wght@400;700',
    weights: [400, 700], category: 'wire',
    lineage: 'Geometric sans from monospace roots',
    character: 'The broadside', cssClass: 'font-space-grotesk',
    sampleText: 'Lost to the', isMonospace: false,
  },
  {
    id: 'syne', name: 'Syne',
    family: "'Syne', sans-serif", googleId: 'Syne:wght@400;700;800',
    weights: [400, 700, 800], category: 'wire',
    lineage: 'Designed for Synesthesie arts center, geometric',
    character: 'The dispatch', cssClass: 'font-syne',
    sampleText: 'an image from', isMonospace: false,
  },

  // SCRAWL
  {
    id: 'permanent-marker', name: 'Permanent Marker',
    family: "'Permanent Marker', cursive", googleId: 'Permanent+Marker',
    weights: [400], category: 'scrawl',
    lineage: 'Marker-drawn display, the hand of the zine cover',
    character: 'The zine headline', cssClass: 'font-permanent-marker',
    sampleText: 'DIRT', isMonospace: false,
  },
  {
    id: 'caveat', name: 'Caveat',
    family: "'Caveat', cursive", googleId: 'Caveat:wght@400;700',
    weights: [400, 700], category: 'scrawl',
    lineage: 'Casual handwriting, the marginal note',
    character: 'The margin note', cssClass: 'font-caveat',
    sampleText: 'nothing is obscene', isMonospace: false,
  },
  {
    id: 'special-elite', name: 'Special Elite',
    family: "'Special Elite', monospace", googleId: 'Special+Elite',
    weights: [400], category: 'scrawl',
    lineage: 'Typewriter with ink bleed and worn hammers',
    character: 'The photocopied leaflet', cssClass: 'font-special-elite',
    sampleText: 'the magazine that DARES', isMonospace: true,
  },
];

/* ── Font lookup by id ────────────────────────────────────── */
const _fontMap = new Map(FONT_CATALOG.map(f => [f.id, f]));
export function getFont(id: string): FontDefinition | undefined {
  return _fontMap.get(id);
}

/* ── 6 curated pairings ───────────────────────────────────── */
export interface FontPairing {
  id: string;
  name: string;
  hero: string;     // font id
  ticker: string;   // font id
  character: string;
}

export const FONT_PAIRINGS: FontPairing[] = [
  { id: 'poster',      name: 'Poster',      hero: 'abril',            ticker: 'caveat',        character: 'The exhibition poster with a penciled note' },
  { id: 'zine',        name: 'Zine',        hero: 'permanent-marker', ticker: 'special-elite', character: 'The punk zine: marker cover, typewritten insides' },
  { id: 'rally',       name: 'Rally',       hero: 'bebas',            ticker: 'space-mono',    character: 'The protest banner with the typed communique' },
  { id: 'broadsheet',  name: 'Broadsheet',  hero: 'alfa-slab',        ticker: 'syne',          character: 'The 19th-century poster with a modernist caption' },
  { id: 'letterpress', name: 'Letterpress', hero: 'fraunces',         ticker: 'source-serif',  character: 'The woodcut print with the essayist commentary' },
  { id: 'dispatch',    name: 'Dispatch',    hero: 'league-gothic',    ticker: 'caveat',        character: 'The telegraph headline with the reporter\'s note' },
];

export const DEFAULT_PAIRING_ID = 'poster';

/* ── Ticker companion lookup ──────────────────────────────── */
export const TICKER_COMPANIONS: Record<FontCategory, string[]> = {
  slab:    ['caveat', 'syne', 'space-mono'],
  fatface: ['caveat', 'special-elite', 'space-grotesk'],
  blade:   ['space-mono', 'caveat', 'source-serif'],
  hand:    ['source-serif', 'space-mono', 'syne'],
  wire:    ['caveat', 'young-serif', 'source-serif'],
  scrawl:  ['space-grotesk', 'syne', 'space-mono'],
};

/* ── Ticker phrase templates ──────────────────────────────── */
export const TICKER_PHRASES = [
  'lost in [place]',
  '[place] is the place to be',
  'somewhere near [place]',
  'you are here: [place]',
  '[place], upside down',
  'south of [place]',
  'drifting through [place]',
  '[place] from below',
  'the world according to [place]',
];

/* ── Font state ───────────────────────────────────────────── */
export interface FontState {
  activePairing: string;
  activeHero: string;
  activeTicker: string;
  loadedFonts: Set<string>;
  tickerDirection: 'east' | 'west';
  tickerPhrase: string;
  tickerPlace: string;
  tickerPaused: boolean;
}

export function createFontState(): FontState {
  const defaultPairing = FONT_PAIRINGS[0];
  return {
    activePairing: defaultPairing.id,
    activeHero: defaultPairing.hero,
    activeTicker: defaultPairing.ticker,
    loadedFonts: new Set(['anton', 'space-mono']), // already in the page via existing Google Fonts link
    tickerDirection: 'east',
    tickerPhrase: TICKER_PHRASES[0],
    tickerPlace: '',
    tickerPaused: false,
  };
}

/* ── Font loading ─────────────────────────────────────────── */
export async function loadGoogleFont(font: FontDefinition, state: FontState): Promise<void> {
  if (state.loadedFonts.has(font.id)) return;

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${font.googleId}&display=swap`;
  document.head.appendChild(link);

  await document.fonts.ready;
  state.loadedFonts.add(font.id);
}

export async function loadFontById(id: string, state: FontState): Promise<FontDefinition | undefined> {
  const font = getFont(id);
  if (!font) return undefined;
  await loadGoogleFont(font, state);
  return font;
}

export async function preloadAllFonts(state: FontState): Promise<void> {
  const unloaded = FONT_CATALOG.filter(f => !state.loadedFonts.has(f.id));
  if (unloaded.length === 0) return;

  const families = unloaded.map(f => f.googleId).join('&family=');
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${families}&display=swap`;
  document.head.appendChild(link);

  await document.fonts.ready;
  unloaded.forEach(f => state.loadedFonts.add(f.id));
}

/* ── Apply fonts to DOM ───────────────────────────────────── */
const root = document.documentElement;

export async function applyHeroFont(fontId: string, state: FontState): Promise<void> {
  const font = await loadFontById(fontId, state);
  if (!font) return;

  state.activeHero = fontId;
  root.style.setProperty('--hero-font-family', font.family);

  // Fraunces: apply WONK axis
  if (font.isVariable && font.variableAxes?.WONK) {
    root.style.setProperty('--hero-font-variation', "'WONK' 1, 'opsz' 144");
  } else {
    root.style.setProperty('--hero-font-variation', 'normal');
  }

  // Auto-select ticker companion
  const companions = TICKER_COMPANIONS[font.category];
  if (companions && companions[0] !== state.activeTicker) {
    await applyTickerFont(companions[0], state);
  }
}

export async function applyTickerFont(fontId: string, state: FontState): Promise<void> {
  const font = await loadFontById(fontId, state);
  if (!font) return;

  state.activeTicker = fontId;
  root.style.setProperty('--ticker-font-family', font.family);
}

export async function applyPairing(pairingId: string, state: FontState): Promise<void> {
  const pairing = FONT_PAIRINGS.find(p => p.id === pairingId);
  if (!pairing) return;

  state.activePairing = pairingId;

  // Load both fonts
  const heroFont = getFont(pairing.hero);
  const tickerFont = getFont(pairing.ticker);
  if (heroFont) await loadGoogleFont(heroFont, state);
  if (tickerFont) await loadGoogleFont(tickerFont, state);

  state.activeHero = pairing.hero;
  state.activeTicker = pairing.ticker;
  root.style.setProperty('--hero-font-family', heroFont?.family || "'Anton', sans-serif");
  root.style.setProperty('--ticker-font-family', tickerFont?.family || "'Caveat', cursive");

  // Fraunces WONK
  if (heroFont?.isVariable && heroFont.variableAxes?.WONK) {
    root.style.setProperty('--hero-font-variation', "'WONK' 1, 'opsz' 144");
  } else {
    root.style.setProperty('--hero-font-variation', 'normal');
  }
}

/* ── Ticker phrase generation ─────────────────────────────── */
let _lastPhraseIdx = -1;

export function generateTickerPhrase(place: string, state: FontState): string {
  if (!place) return '';

  // Pick a different phrase than last time
  let idx: number;
  do {
    idx = Math.floor(Math.random() * TICKER_PHRASES.length);
  } while (idx === _lastPhraseIdx && TICKER_PHRASES.length > 1);
  _lastPhraseIdx = idx;

  const template = TICKER_PHRASES[idx];
  state.tickerPhrase = template;
  state.tickerPlace = place;

  // Alternate direction
  state.tickerDirection = state.tickerDirection === 'east' ? 'west' : 'east';

  return template.replace('[place]', place);
}

/* ── Persistence helpers ──────────────────────────────────── */
export function persistFontState(state: FontState): void {
  sessionStorage.setItem('wud-font', JSON.stringify({
    pairing: state.activePairing,
    hero: state.activeHero,
    ticker: state.activeTicker,
  }));
}

export function restoreFontState(state: FontState): { pairing: string; hero: string; ticker: string } | null {
  const stored = sessionStorage.getItem('wud-font');
  if (!stored) return null;
  try {
    const { pairing, hero, ticker } = JSON.parse(stored);
    if (pairing && hero && ticker && getFont(hero) && getFont(ticker)) {
      return { pairing, hero, ticker };
    }
  } catch { /* ignore */ }
  return null;
}

/* ── Fonts grouped by category (for UI) ───────────────────── */
export function getFontsByCategory(): Record<FontCategory, FontDefinition[]> {
  const result: Record<FontCategory, FontDefinition[]> = {
    slab: [], fatface: [], blade: [], hand: [], wire: [], scrawl: [],
  };
  for (const font of FONT_CATALOG) {
    result[font.category].push(font);
  }
  return result;
}
