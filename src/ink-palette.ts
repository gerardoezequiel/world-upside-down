/* ══════════════════════════════════════════════════════════════
   Ink Palette System — Riso Kagaku Spot Ink Catalog
   Real inks, curated subsets, live map recoloring.
   ══════════════════════════════════════════════════════════════ */
import type maplibregl from 'maplibre-gl';

/* ── Ink definition ────────────────────────────────────────── */
export interface CatalogInk {
  id: string;
  name: string;
  hex: string;
  pantone?: string;
}

/* ── Full catalog — 34 real Riso Kagaku spot inks ──────────── */
export const INK_CATALOG: Record<string, CatalogInk> = {
  black:        { id: 'black',        name: 'Black',             hex: '#000000', pantone: 'Black U' },
  lightGray:    { id: 'lightGray',    name: 'Light Gray',        hex: '#88898A', pantone: '424 U' },
  granite:      { id: 'granite',      name: 'Granite',           hex: '#A5AAA8', pantone: '7538 U' },
  charcoal:     { id: 'charcoal',     name: 'Charcoal',          hex: '#70747C', pantone: '7540 U' },
  mist:         { id: 'mist',         name: 'Mist',              hex: '#D5E4C0', pantone: '7485 U' },
  bisque:       { id: 'bisque',       name: 'Bisque',            hex: '#F2CDCF', pantone: '503 U' },
  lightMauve:   { id: 'lightMauve',   name: 'Light Mauve',       hex: '#E6B5C9', pantone: '7430 U' },
  mint:         { id: 'mint',         name: 'Mint',              hex: '#82D8D5', pantone: '324 U' },
  teal:         { id: 'teal',         name: 'Teal',              hex: '#00838A', pantone: '321 U' },
  lightTeal:    { id: 'lightTeal',    name: 'Light Teal',        hex: '#009DA5', pantone: '320 U' },
  aqua:         { id: 'aqua',         name: 'Aqua',              hex: '#5EC8E5', pantone: '637 U' },
  blue:         { id: 'blue',         name: 'Blue',              hex: '#0078BF', pantone: '3005 U' },
  mediumBlue:   { id: 'mediumBlue',   name: 'Medium Blue',       hex: '#3255A4', pantone: '286 U' },
  cornflower:   { id: 'cornflower',   name: 'Cornflower',        hex: '#62A8E5', pantone: '292 U' },
  seaBlue:      { id: 'seaBlue',      name: 'Sea Blue',          hex: '#0074A2', pantone: '307 U' },
  lake:         { id: 'lake',         name: 'Lake',              hex: '#235BA8', pantone: '293 U' },
  midnight:     { id: 'midnight',     name: 'Midnight',          hex: '#435060', pantone: '296 U' },
  federalBlue:  { id: 'federalBlue',  name: 'Federal Blue',      hex: '#3D5588', pantone: '288 U' },
  indigo:       { id: 'indigo',       name: 'Indigo',            hex: '#484D7A', pantone: '2758 U' },
  purple:       { id: 'purple',       name: 'Purple',            hex: '#765BA7', pantone: '2685 U' },
  violet:       { id: 'violet',       name: 'Violet',            hex: '#9D7AD2', pantone: '265 U' },
  burgundy:     { id: 'burgundy',     name: 'Burgundy',          hex: '#914E72', pantone: '235 U' },
  fluorPink:    { id: 'fluorPink',    name: 'Fluor. Pink',       hex: '#FF48B0', pantone: '806 U' },
  bubbleGum:    { id: 'bubbleGum',    name: 'Bubble Gum',        hex: '#F984CA', pantone: '231 U' },
  brightRed:    { id: 'brightRed',    name: 'Bright Red',        hex: '#F15060', pantone: '185 U' },
  orange:       { id: 'orange',       name: 'Orange',            hex: '#FF6C2F', pantone: 'Orange 021 U' },
  yellow:       { id: 'yellow',       name: 'Yellow',            hex: '#FFE800', pantone: 'Yellow U' },
  lightLime:    { id: 'lightLime',    name: 'Light Lime',        hex: '#E3ED55', pantone: '387 U' },
  green:        { id: 'green',        name: 'Green',             hex: '#00A95C', pantone: '354 U' },
  fluorGreen:   { id: 'fluorGreen',   name: 'Fluor. Green',      hex: '#44D62C', pantone: '802 U' },
  kellyGreen:   { id: 'kellyGreen',   name: 'Kelly Green',       hex: '#67B346', pantone: '368 U' },
  emerald:      { id: 'emerald',      name: 'Emerald',           hex: '#19975D', pantone: '355 U' },
  hunterGreen:  { id: 'hunterGreen',  name: 'Hunter Green',      hex: '#407060', pantone: '342 U' },
};

/* ── Palette roles ─────────────────────────────────────────── */
export interface MapPalette {
  base: string;   // land terrain, secondary roads, railways
  water: string;  // oceans, rivers, lakes, coastlines
  built: string;  // buildings, urban fabric
  green: string;  // parks, gardens, green space
  ink: string;    // labels, major roads, boundaries
}

export interface PresetPalette {
  id: string;
  name: string;
  palette: MapPalette;
}

export const PALETTES: PresetPalette[] = [
  { id: 'classic',   name: 'Classic',   palette: { base: 'lightGray', water: 'teal',      built: 'blue',       green: 'fluorPink',  ink: 'black' } },
  { id: 'protest',   name: 'Protest',   palette: { base: 'lightGray', water: 'blue',      built: 'fluorPink',  green: 'yellow',     ink: 'black' } },
  { id: 'blueprint', name: 'Blueprint', palette: { base: 'cornflower', water: 'blue',     built: 'mediumBlue', green: 'teal',       ink: 'black' } },
  { id: 'botanical', name: 'Botanical', palette: { base: 'mist',      water: 'teal',      built: 'lightGray',  green: 'green',      ink: 'black' } },
  { id: 'neon',      name: 'Neon',      palette: { base: 'lightGray', water: 'blue',      built: 'fluorPink',  green: 'fluorGreen', ink: 'black' } },
  { id: 'mono',      name: 'Mono',      palette: { base: 'lightGray', water: 'blue',      built: 'blue',       green: 'blue',       ink: 'black' } },
];

export const DEFAULT_PALETTE_ID = 'classic';

/* ── Curated ink subsets per category ──────────────────────── */
export const CATEGORY_INKS: Record<keyof MapPalette, string[]> = {
  base:  ['lightGray', 'granite', 'mist', 'bisque', 'lightMauve', 'cornflower', 'mint'],
  water: ['teal', 'blue', 'seaBlue', 'mediumBlue', 'cornflower', 'lake', 'midnight', 'lightTeal', 'aqua'],
  built: ['blue', 'mediumBlue', 'fluorPink', 'orange', 'brightRed', 'purple', 'teal', 'lightGray', 'federalBlue', 'burgundy', 'green', 'charcoal'],
  green: ['fluorPink', 'green', 'fluorGreen', 'yellow', 'teal', 'kellyGreen', 'emerald', 'orange', 'brightRed', 'lightLime', 'bubbleGum', 'violet'],
  ink:   ['black', 'midnight', 'charcoal', 'federalBlue', 'hunterGreen', 'indigo', 'burgundy'],
};

/* ── Color math ────────────────────────────────────────────── */
function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + ((1 << 24) | (Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b)).toString(16).slice(1).toUpperCase();
}

export function lighten(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r + (255 - r) * amount, g + (255 - g) * amount, b + (255 - b) * amount);
}

export function darken(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r * (1 - amount), g * (1 - amount), b * (1 - amount));
}

/* ── Derived palette — full ~30 entries from 5 inks ────────── */
export interface DerivedPalette {
  bg: string;
  earth: string;
  water: string;
  waterLine: string;
  buildings: string;
  urban: string;
  park: string;
  parkAlt: string;
  road: string;
  roadMajor: string;
  roadMinor: string;
  roadCas: string;
  rail: string;
  boundary: string;
  label: string;
  labelHalo: string;
  grass: string;
  farmland: string;
  scrub: string;
  barren: string;
  glacier: string;
  hospital: string;
  school: string;
  industrial: string;
  beach: string;
  zoo: string;
  aerodrome: string;
  pier: string;
  pedestrian: string;
  runway: string;
}

export function buildDerivedPalette(mp: MapPalette): DerivedPalette {
  const baseHex  = INK_CATALOG[mp.base].hex;
  const waterHex = INK_CATALOG[mp.water].hex;
  const builtHex = INK_CATALOG[mp.built].hex;
  const greenHex = INK_CATALOG[mp.green].hex;
  const inkHex   = INK_CATALOG[mp.ink].hex;

  return {
    bg:         '#FFFFFF',
    earth:      lighten(baseHex, 0.90),
    water:      waterHex,
    waterLine:  darken(waterHex, 0.15),
    buildings:  builtHex,
    urban:      lighten(builtHex, 0.35),
    park:       greenHex,
    parkAlt:    lighten(greenHex, 0.20),
    road:       inkHex,
    roadMajor:  inkHex,
    roadMinor:  baseHex,
    roadCas:    lighten(baseHex, 0.60),
    rail:       inkHex,
    boundary:   inkHex,
    label:      inkHex,
    labelHalo:  '#FFFFFF',
    grass:      lighten(baseHex, 0.85),
    farmland:   lighten(baseHex, 0.82),
    scrub:      lighten(baseHex, 0.80),
    barren:     lighten(baseHex, 0.88),
    glacier:    '#EEEEEE',
    hospital:   lighten(greenHex, 0.50),
    school:     lighten(builtHex, 0.50),
    industrial: lighten(baseHex, 0.55),
    beach:      lighten(baseHex, 0.75),
    zoo:        lighten(greenHex, 0.30),
    aerodrome:  lighten(baseHex, 0.65),
    pier:       lighten(baseHex, 0.60),
    pedestrian: lighten(baseHex, 0.70),
    runway:     lighten(baseHex, 0.50),
  };
}

/* ── Safe paint setter — silently ignores missing layers ───── */
function trySetPaint(map: maplibregl.Map, layerId: string, prop: string, value: unknown): void {
  try { map.setPaintProperty(layerId, prop, value); } catch { /* layer not found */ }
}

/* ── Live repaint — applies derived palette to all map layers  */
export function applyMapPalette(map: maplibregl.Map, p: DerivedPalette, mp: MapPalette): void {
  const style = map.getStyle();
  if (!style) return;

  // Background + earth
  trySetPaint(map, 'background', 'background-color', p.bg);
  trySetPaint(map, 'earth', 'fill-color', p.earth);

  // Water
  trySetPaint(map, 'water', 'fill-color', p.water);
  trySetPaint(map, 'water_stream', 'line-color', p.waterLine);
  trySetPaint(map, 'water_river', 'line-color', p.waterLine);

  // Buildings
  trySetPaint(map, 'buildings', 'fill-color', p.buildings);
  trySetPaint(map, 'buildings', 'fill-outline-color', darken(p.buildings, 0.15) + '40');

  // Iterate all layers for pattern-matched updates
  for (const layer of style.layers) {
    const id = layer.id;

    // Parks
    if (id.startsWith('landuse_park')) {
      trySetPaint(map, id, 'fill-color', p.park);
    }

    // Road casings
    if (id.includes('_casing') && layer.type === 'line') {
      trySetPaint(map, id, 'line-color', p.roadCas);
    }

    // Roads
    if (id.startsWith('roads_') && !id.includes('label') && !id.includes('shield') && !id.includes('oneway') && layer.type === 'line') {
      if (id.includes('highway') || id.includes('major')) {
        trySetPaint(map, id, 'line-color', p.roadMajor);
      } else if (id.includes('minor') || id.includes('other') || id.includes('link')) {
        trySetPaint(map, id, 'line-color', p.roadMinor);
      } else if (id.includes('rail')) {
        trySetPaint(map, id, 'line-color', p.rail);
      } else if (id.includes('pier')) {
        trySetPaint(map, id, 'line-color', p.pier);
      } else if (id.includes('runway') || id.includes('taxiway')) {
        trySetPaint(map, id, 'line-color', p.runway);
      }
    }

    // Boundaries
    if (id.startsWith('boundaries') && layer.type === 'line') {
      trySetPaint(map, id, 'line-color', p.boundary);
    }

    // All text labels
    if (layer.type === 'symbol') {
      trySetPaint(map, id, 'text-color', p.label);
      trySetPaint(map, id, 'text-halo-color', p.labelHalo);
    }

    // Riso offset layers
    if (id === 'water-riso-offset') {
      trySetPaint(map, id, 'fill-color', INK_CATALOG[mp.water].hex);
    }
    if (id === 'buildings-riso-offset') {
      trySetPaint(map, id, 'fill-color', INK_CATALOG[mp.built].hex);
    }
    if (id.startsWith('landuse_park') && id.endsWith('-riso-offset')) {
      trySetPaint(map, id, 'fill-color', INK_CATALOG[mp.green].hex);
    }
    if (id.endsWith('-riso-offset') && (id.includes('roads_') || id.includes('boundaries'))) {
      trySetPaint(map, id, 'line-color', lighten(INK_CATALOG[mp.ink].hex, 0.15));
    }
  }

  // Special landuse fills
  trySetPaint(map, 'landuse_urban_green', 'fill-color', p.parkAlt);
  trySetPaint(map, 'landuse_hospital',    'fill-color', p.hospital);
  trySetPaint(map, 'landuse_school',      'fill-color', p.school);
  trySetPaint(map, 'landuse_industrial',  'fill-color', p.industrial);
  trySetPaint(map, 'landuse_beach',       'fill-color', p.beach);
  trySetPaint(map, 'landuse_zoo',         'fill-color', p.zoo);
  trySetPaint(map, 'landuse_aerodrome',   'fill-color', p.aerodrome);
  trySetPaint(map, 'landuse_pedestrian',  'fill-color', p.pedestrian);
  trySetPaint(map, 'landuse_pier',        'fill-color', p.pier);
  trySetPaint(map, 'landuse_runway',      'fill-color', p.runway);

  // Landcover match expression
  trySetPaint(map, 'landcover', 'fill-color', [
    'match', ['get', 'kind'],
    'grassland', p.grass, 'barren', p.barren,
    'urban_area', p.urban, 'farmland', p.farmland,
    'glacier', p.glacier, 'scrub', p.scrub,
    p.grass,
  ]);

  // POIs match expression
  trySetPaint(map, 'pois', 'text-color', [
    'match', ['get', 'kind'],
    'park', p.park, 'forest', p.park, 'garden', p.park,
    'beach', p.park, 'zoo', p.zoo, 'marina', p.waterLine,
    'station', p.road, 'bus_stop', p.roadMinor,
    'ferry_terminal', p.waterLine, 'aerodrome', p.roadMinor,
    'university', p.boundary, 'library', p.boundary,
    'school', p.boundary, 'townhall', p.boundary,
    'post_office', p.boundary, 'museum', p.boundary,
    'theatre', p.boundary, 'artwork', p.boundary,
    p.roadMinor,
  ]);
  trySetPaint(map, 'pois', 'text-halo-color', p.labelHalo);
}
